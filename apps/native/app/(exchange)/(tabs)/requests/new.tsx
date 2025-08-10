import { useEffect, useState } from "react";
import { View, Text, TextInput, ScrollView, Pressable, Alert, Platform } from "react-native";
import { useMutation, useQuery } from "convex/react";
import { api } from "@SpringEin/backend/convex/_generated/api";
import { Container } from "@/components/container";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { router } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

export default function NewRequest() {
  const exchangeProfiles = useQuery(api.profiles.myExchangeProfiles) ?? [];
  const create = useMutation(api.requests.createSubstitutionRequest);
  const [exchangeProfileId, setExchangeProfileId] = useState<string | null>(null);
  const AGE_GROUP_PRESETS = ["0-2", "3-5", "6-10"] as const;
  type FormValues = {
    ageGroups: string[];
    startDate: Date;
    endDate: Date;
    timeFrom: string;
    timeTo: string;
    notes?: string;
  };
  const schema: yup.ObjectSchema<FormValues> = yup.object({
    ageGroups: yup.array(yup.string().required()).min(1, "Mindestens eine Altersgruppe wählen").required(),
    startDate: yup.date().required(),
    endDate: yup.date().min(yup.ref('startDate'), 'Ende nach Start').required(),
    timeFrom: yup.string().matches(/^\d{2}:\d{2}$/g, "Format HH:MM").required(),
    timeTo: yup.string().matches(/^\d{2}:\d{2}$/g, "Format HH:MM").required(),
    notes: yup.string().optional(),
  }).test('time-order', 'Von muss vor Bis liegen', (values) => {
    if (!values) return false;
    const toMinutes = (t: string) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
    return toMinutes(values.timeFrom) < toMinutes(values.timeTo);
  });
  const { control, handleSubmit, setValue, getValues, formState: { errors } } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      ageGroups: [],
      startDate: new Date(),
      endDate: new Date(),
      timeFrom: "08:00",
      timeTo: "16:00",
      notes: "",
    }
  });
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [showFromTimePicker, setShowFromTimePicker] = useState(false);
  const [showToTimePicker, setShowToTimePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (exchangeProfiles.length && !exchangeProfileId) {
      setExchangeProfileId(exchangeProfiles[0]._id);
    }
  }, [exchangeProfiles]);

  const onSubmit = async (values: FormValues) => {
    try {
      if (!exchangeProfileId) return Alert.alert("Fehler", "Bitte ein Profil auswählen.");

      setIsSubmitting(true);
      await create({
        exchangeProfileId: exchangeProfileId as any,
        ageGroups: values.ageGroups,
        startDate: formatDate(values.startDate),
        endDate: formatDate(values.endDate),
        timeFrom: values.timeFrom,
        timeTo: values.timeTo,
        notes: values.notes,
      });
      Alert.alert("Erfolgreich", "Anfrage erstellt");
      router.replace("/(exchange)/(tabs)/requests");
    } catch (e) {
      Alert.alert("Fehler", String(e));
    }
    finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const da = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${da}`;
  };

  const onChangeStart = (_: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS !== "ios") setShowStartPicker(false);
    if (selected) setValue('startDate', selected, { shouldValidate: true });
  };
  const onChangeEnd = (_: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS !== "ios") setShowEndPicker(false);
    if (selected) setValue('endDate', selected, { shouldValidate: true });
  };

  const parseTimeToDate = (t: string): Date => {
    const [hh = "08", mm = "00"] = t.split(":");
    const d = new Date();
    d.setHours(Number(hh));
    d.setMinutes(Number(mm));
    d.setSeconds(0);
    d.setMilliseconds(0);
    return d;
  };

  const formatTime = (d: Date) => `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  const isValidTime = (t: string) => /^\d{2}:\d{2}$/.test(t);

  const onChangeFromTime = (_: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS !== "ios") setShowFromTimePicker(false);
    if (selected) setValue('timeFrom', formatTime(selected), { shouldValidate: true });
  };
  const onChangeToTime = (_: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS !== "ios") setShowToTimePicker(false);
    if (selected) setValue('timeTo', formatTime(selected), { shouldValidate: true });
  };

  return (
    <Container>
      <KeyboardAwareScrollView keyboardShouldPersistTaps="handled">
        <View className="p-4">
          <Text className="text-2xl font-bold mb-3">Vertretung anfragen</Text>
          <Text className="mb-2">Kindertagesstätte-Profil auswählen</Text>
          <View className="flex-row flex-wrap gap-2 mb-3">
            {exchangeProfiles.map((p) => (
              <Pressable
                key={p._id}
                onPress={() => setExchangeProfileId(p._id)}
                className={`px-3 py-2 rounded-full border ${exchangeProfileId === p._id ? "bg-gray-900 border-gray-900" : "border-gray-300"}`}
              >
                <Text className={`${exchangeProfileId === p._id ? "text-white" : "text-gray-900"}`}>{p.facilityName}</Text>
              </Pressable>
            ))}
          </View>
          <Text className="font-semibold mb-2">Altersgruppen</Text>
          <View className="flex-row flex-wrap gap-2 mb-1">
            {AGE_GROUP_PRESETS.map((g) => {
              const active = (getValues('ageGroups') || []).includes(g);
              return (
                <Pressable key={g} onPress={() => {
                  const now = getValues('ageGroups') || [];
                  const next = now.includes(g) ? now.filter((x) => x !== g) : [...now, g];
                  setValue('ageGroups', next, { shouldValidate: true });
                }} className={`px-3 py-2 rounded-full border ${active ? "bg-gray-900 border-gray-900" : "border-gray-300"}`}>
                  <Text className={`${active ? "text-white" : "text-gray-900"}`}>{g}</Text>
                </Pressable>
              );
            })}
          </View>
          {errors.ageGroups && <Text className="text-red-500 text-xs mb-2">{errors.ageGroups.message as string}</Text>}
          <Text className="font-semibold mb-2">Zeitraum</Text>
          <View className="flex-row gap-3 mb-3">
            <Pressable onPress={() => setShowStartPicker(true)} className="border border-gray-300 rounded-lg p-3 flex-1 justify-center">
              <Text>Start: {formatDate(getValues('startDate'))}</Text>
            </Pressable>
            <Pressable onPress={() => setShowEndPicker(true)} className="border border-gray-300 rounded-lg p-3 flex-1 justify-center">
              <Text>Ende: {formatDate(getValues('endDate'))}</Text>
            </Pressable>
          </View>
        {showStartPicker && (
          <DateTimePicker value={getValues('startDate')} mode="date" display={Platform.OS === "ios" ? "spinner" : "default"} onChange={onChangeStart} />
        )}
        {showEndPicker && (
          <DateTimePicker value={getValues('endDate')} mode="date" display={Platform.OS === "ios" ? "spinner" : "default"} onChange={onChangeEnd} />
        )}
          <Text className="font-semibold mb-2">Uhrzeit</Text>
          <View className="flex-row gap-3 mb-3">
            <Pressable onPress={() => setShowFromTimePicker(true)} className="border border-gray-300 rounded-lg p-3 flex-1 justify-center">
              <Text>Von: {getValues('timeFrom')}</Text>
            </Pressable>
            <Pressable onPress={() => setShowToTimePicker(true)} className="border border-gray-300 rounded-lg p-3 flex-1 justify-center">
              <Text>Bis: {getValues('timeTo')}</Text>
            </Pressable>
          </View>
        {showFromTimePicker && (
          <DateTimePicker value={parseTimeToDate(getValues('timeFrom'))} mode="time" display={Platform.OS === "ios" ? "spinner" : "default"} onChange={onChangeFromTime} />
        )}
        {showToTimePicker && (
          <DateTimePicker value={parseTimeToDate(getValues('timeTo'))} mode="time" display={Platform.OS === "ios" ? "spinner" : "default"} onChange={onChangeToTime} />
        )}
          <Controller control={control} name="notes" render={({ field: { onChange, onBlur, value } }) => (
            <TextInput placeholder="Notizen" value={value} onChangeText={onChange} onBlur={onBlur} className="border border-gray-300 rounded-lg p-3 h-24" multiline />
          )} />
          <Pressable disabled={isSubmitting} onPress={handleSubmit(onSubmit)} className={`bg-gray-900 py-3 rounded-lg items-center mt-2 ${isSubmitting ? "opacity-60" : ""}`}>
            <Text className="text-white font-bold">Senden</Text>
          </Pressable>
        </View>
      </KeyboardAwareScrollView>
    </Container>
  );
}

 

