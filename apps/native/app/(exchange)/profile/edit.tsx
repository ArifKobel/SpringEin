import { useEffect, useMemo, useState } from "react";
import { View, Text, TextInput, ScrollView, Pressable, Alert, Platform } from "react-native";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { useMutation, useQuery } from "convex/react";
import { api } from "@SpringEin/backend/convex/_generated/api";
import { Container } from "@/components/container";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

export default function EditExchange() {
  const settings = useQuery(api.profiles.mySettings);
  const myExchanges = useQuery(api.profiles.myExchangeProfiles) ?? [];
  const currentId = useMemo(() => settings?.activeExchangeProfileId ?? myExchanges[0]?._id, [settings, myExchanges]);
  const update = useMutation(api.profiles.updateExchangeProfile);
  const profile = myExchanges.find((p) => p._id === currentId);

  type FormValues = {
    facilityName: string;
    address: string;
    city: string;
    postalCode?: string;
    contactPersonName?: string;
    phone?: string;
    email?: string;
    ageGroups: string[];
    openingDays: string[];
    openingTimeFrom: string;
    openingTimeTo: string;
    bio?: string;
  };
  const schema: yup.ObjectSchema<FormValues> = yup.object({
    facilityName: yup.string().required("Einrichtungsname ist erforderlich"),
    address: yup.string().required("Adresse ist erforderlich"),
    city: yup.string().required("Stadt ist erforderlich"),
    postalCode: yup.string().optional(),
    contactPersonName: yup.string().optional(),
    phone: yup.string().optional(),
    email: yup.string().email("Ungültige E-Mail").optional(),
    ageGroups: yup.array(yup.string().required()).min(1, "Mindestens eine Altersgruppe wählen").required(),
    openingDays: yup.array(yup.string().required()).min(1, "Mindestens ein Öffnungstag").required(),
    openingTimeFrom: yup.string().matches(/^\d{2}:\d{2}$/g, "Format HH:MM").required(),
    openingTimeTo: yup.string().matches(/^\d{2}:\d{2}$/g, "Format HH:MM").required(),
    bio: yup.string().optional(),
  });
  const { control, handleSubmit, setValue, getValues, reset, formState: { errors } } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      facilityName: "",
      address: "",
      city: "",
      postalCode: "",
      contactPersonName: "",
      phone: "",
      email: "",
      ageGroups: [],
      openingDays: [],
      openingTimeFrom: "08:00",
      openingTimeTo: "16:00",
      bio: "",
    },
  });
  const [openingHours, setOpeningHours] = useState<{ day: string; from: string; to: string }[]>([]);
  const [showStdFrom, setShowStdFrom] = useState(false);
  const [showStdTo, setShowStdTo] = useState(false);
  const [openDayPicker, setOpenDayPicker] = useState<{ day: string | null; which: "from" | "to" | null }>({ day: null, which: null });

  useEffect(() => {
    if (profile) {
      reset({
        facilityName: profile.facilityName ?? "",
        address: profile.address ?? "",
        city: profile.city,
        postalCode: profile.postalCode ?? "",
        contactPersonName: profile.contactPersonName ?? "",
        phone: profile.phone ?? "",
        email: (profile as any).email ?? "",
        ageGroups: profile.ageGroups ?? [],
        openingDays: profile.openingDays ?? [],
        openingTimeFrom: profile.openingTimeFrom ?? "08:00",
        openingTimeTo: profile.openingTimeTo ?? "16:00",
        bio: profile.bio ?? "",
      });
      setOpeningHours(profile.openingHours ?? []);
    }
  }, [profile]);

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
  const onChangeStdFrom = (_: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS !== "ios") setShowStdFrom(false);
    if (selected) setValue("openingTimeFrom", formatTime(selected), { shouldValidate: true });
  };
  const onChangeStdTo = (_: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS !== "ios") setShowStdTo(false);
    if (selected) setValue("openingTimeTo", formatTime(selected), { shouldValidate: true });
  };
  const onChangeDayTime = (_: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS !== "ios") setOpenDayPicker({ day: null, which: null });
    if (!selected || !openDayPicker.day || !openDayPicker.which) return;
    const d = openDayPicker.day;
    const entry = openingHours.find((x) => x.day === d) || { day: d, from: "", to: "" };
    const next = { ...entry, [openDayPicker.which]: formatTime(selected) } as { day: string; from: string; to: string };
    setOpeningHours((prev) => {
      const others = prev.filter((x) => x.day !== d);
      return [...others, next];
    });
  };
  const applyStandardToDays = () => {
    const selectedDays = getValues("openingDays");
    const from = getValues("openingTimeFrom");
    const to = getValues("openingTimeTo");
    setOpeningHours((prev) => {
      const others = prev.filter((x) => !selectedDays.includes(x.day));
      const add = selectedDays.map((d) => ({ day: d, from, to }));
      return [...others, ...add];
    });
  };

  const onSubmit = async (values: FormValues) => {
    try {
      if (!profile) return;
       await update({
        profileId: profile._id as any,
        facilityName: values.facilityName,
        address: values.address,
        city: values.city,
        postalCode: values.postalCode,
        contactPersonName: values.contactPersonName,
        phone: values.phone,
        email: values.email,
        ageGroups: values.ageGroups,
        openingDays: values.openingDays,
        openingTimeFrom: values.openingTimeFrom,
        openingTimeTo: values.openingTimeTo,
        openingHours,
        bio: values.bio,
      });
      Alert.alert("Gespeichert", "Profil aktualisiert");
    } catch (e) {
      Alert.alert("Fehler", String(e));
    }
  };

  return (
    <Container>
      <ScrollView>
        <View className="p-4">
          <Text className="text-2xl font-bold mb-1">Kindertagesstätte-Profil bearbeiten</Text>
          <Text className="text-gray-500 mb-4">Pflege Stammdaten und Öffnungszeiten.</Text>
          {!profile ? (
            <Text>Kein Profil gefunden.</Text>
          ) : (
            <>
              <Text className="text-sm font-semibold mb-1">Einrichtungsname</Text>
              <Controller control={control} name="facilityName" render={({ field: { onChange, onBlur, value } }) => (
                <TextInput placeholder="Einrichtungsname" value={value} onChangeText={onChange} onBlur={onBlur} className={`border rounded-lg p-3 mb-1 ${errors.facilityName ? "border-red-400" : "border-gray-300"}`} />
              )} />
              {errors.facilityName && <Text className="text-red-500 text-xs mb-2">{errors.facilityName.message}</Text>}

              <Text className="text-sm font-semibold mb-1">Adresse</Text>
              <Controller control={control} name="address" render={({ field: { onChange, onBlur, value } }) => (
                <TextInput placeholder="Adresse" value={value} onChangeText={onChange} onBlur={onBlur} className={`border rounded-lg p-3 mb-1 ${errors.address ? "border-red-400" : "border-gray-300"}`} />
              )} />
              {errors.address && <Text className="text-red-500 text-xs mb-2">{errors.address.message}</Text>}
              <View className="flex-row gap-3">
                <View className="flex-1">
                  <Text className="text-sm font-semibold mb-1">Stadt</Text>
                  <Controller control={control} name="city" render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput placeholder="Stadt" value={value} onChangeText={onChange} onBlur={onBlur} className={`border rounded-lg p-3 mb-1 ${errors.city ? "border-red-400" : "border-gray-300"}`} />
                  )} />
                  {errors.city && <Text className="text-red-500 text-xs mb-2">{errors.city.message}</Text>}
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-semibold mb-1">PLZ</Text>
                  <Controller control={control} name="postalCode" render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput placeholder="PLZ" value={value} onChangeText={onChange} onBlur={onBlur} className="border border-gray-300 rounded-lg p-3 mb-3" />
                  )} />
                </View>
              </View>

              <Text className="text-sm font-semibold mb-1">Ansprechpartner</Text>
              <Controller control={control} name="contactPersonName" render={({ field: { onChange, onBlur, value } }) => (
                <TextInput placeholder="Ansprechpartner" value={value} onChangeText={onChange} onBlur={onBlur} className="border border-gray-300 rounded-lg p-3 mb-3" />
              )} />

              <Text className="text-sm font-semibold mb-1">Telefon</Text>
              <Controller control={control} name="phone" render={({ field: { onChange, onBlur, value } }) => (
                <TextInput placeholder="Telefon" value={value} onChangeText={onChange} onBlur={onBlur} className="border border-gray-300 rounded-lg p-3 mb-3" keyboardType="phone-pad" />
              )} />

              <Text className="text-sm font-semibold mb-1">E-Mail</Text>
              <Controller control={control} name="email" render={({ field: { onChange, onBlur, value } }) => (
                <TextInput placeholder="E-Mail" value={value} onChangeText={onChange} onBlur={onBlur} className={`border rounded-lg p-3 mb-1 ${errors.email ? "border-red-400" : "border-gray-300"}`} keyboardType="email-address" autoCapitalize="none" />
              )} />
              {errors.email && <Text className="text-red-500 text-xs mb-2">{errors.email.message}</Text>}

              <Text className="text-sm font-semibold mt-2 mb-2">Altersgruppen</Text>
              <View className="flex-row flex-wrap gap-2 mb-3">
                {(["0-2", "3-5", "6-10"] as const).map((g) => {
                  const list = getValues("ageGroups");
                  const active = list.includes(g);
                  return (
                    <Pressable key={g} onPress={() => {
                      const now = getValues("ageGroups");
                      const next = now.includes(g) ? now.filter((x) => x !== g) : [...now, g];
                      setValue("ageGroups", next, { shouldValidate: true });
                    }} className={`px-3 py-2 rounded-full border ${active ? "bg-gray-900 border-gray-900" : "border-gray-300"}`}>
                      <Text className={`${active ? "text-white" : "text-gray-900"}`}>{g}</Text>
                    </Pressable>
                  );
                })}
              </View>
              {errors.ageGroups && <Text className="text-red-500 text-xs mb-2">{errors.ageGroups.message as string}</Text>}

              <Text className="text-sm font-semibold mb-2">Öffnungstage</Text>
              <View className="flex-row flex-wrap gap-2 mb-3">
                {(["Mon", "Tue", "Wed", "Thu", "Fri"] as const).map((d) => {
                  const list = getValues("openingDays");
                  const active = list.includes(d);
                  return (
                    <Pressable key={d} onPress={() => {
                      const now = getValues("openingDays");
                      const next = now.includes(d) ? now.filter((x) => x !== d) : [...now, d];
                      setValue("openingDays", next, { shouldValidate: true });
                    }} className={`px-3 py-2 rounded-full border ${active ? "bg-gray-900 border-gray-900" : "border-gray-300"}`}>
                      <Text className={`${active ? "text-white" : "text-gray-900"}`}>{d}</Text>
                    </Pressable>
                  );
                })}
              </View>
              {errors.openingDays && <Text className="text-red-500 text-xs mb-2">{errors.openingDays.message as string}</Text>}

              <Text className="text-sm font-semibold mb-2">Öffnungszeiten (Standard)</Text>
              <View className="flex-row gap-3 mb-2">
                <Pressable onPress={() => setShowStdFrom(true)} className="border border-gray-300 rounded-lg p-3 flex-1 justify-center">
                  <Text>Öffnet: {getValues("openingTimeFrom")}</Text>
                </Pressable>
                <Pressable onPress={() => setShowStdTo(true)} className="border border-gray-300 rounded-lg p-3 flex-1 justify-center">
                  <Text>Schließt: {getValues("openingTimeTo")}</Text>
                </Pressable>
              </View>
              {(errors.openingTimeFrom || errors.openingTimeTo) && (
                <Text className="text-red-500 text-xs mb-2">{errors.openingTimeFrom?.message || errors.openingTimeTo?.message}</Text>
              )}
              {showStdFrom && (
                <DateTimePicker value={parseTimeToDate(getValues("openingTimeFrom"))} mode="time" display={Platform.OS === "ios" ? "spinner" : "default"} onChange={onChangeStdFrom} />
              )}
              {showStdTo && (
                <DateTimePicker value={parseTimeToDate(getValues("openingTimeTo"))} mode="time" display={Platform.OS === "ios" ? "spinner" : "default"} onChange={onChangeStdTo} />
              )}
              <Pressable onPress={applyStandardToDays} className="self-start bg-gray-200 px-3 py-2 rounded-lg mt-1">
                <Text className="text-gray-900 font-semibold">Standard auf Wochentage anwenden</Text>
              </Pressable>

              <Text className="text-sm font-semibold mt-3 mb-2">Öffnungszeiten pro Wochentag (optional)</Text>
              {(["Mon", "Tue", "Wed", "Thu", "Fri"] as const).map((d) => {
                const entry = openingHours.find((x) => x.day === d) || { day: d, from: "", to: "" };
                return (
                  <View key={d} className="flex-row items-center gap-2 mb-2">
                    <View className="border border-gray-300 rounded-lg px-3 py-2 flex-[0.6]"><Text>{d}</Text></View>
                    <Pressable onPress={() => setOpenDayPicker({ day: d, which: "from" })} className="border border-gray-300 rounded-lg p-3 flex-1 justify-center">
                      <Text>Von: {entry.from || "--:--"}</Text>
                    </Pressable>
                    <Pressable onPress={() => setOpenDayPicker({ day: d, which: "to" })} className="border border-gray-300 rounded-lg p-3 flex-1 justify-center">
                      <Text>Bis: {entry.to || "--:--"}</Text>
                    </Pressable>
                  </View>
                );
              })}
              {openDayPicker.day && openDayPicker.which && (
                <DateTimePicker
                  value={parseTimeToDate(
                    (openingHours.find((x) => x.day === openDayPicker.day)?.[openDayPicker.which!]) || getValues("openingTimeFrom")
                  )}
                  mode="time"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={onChangeDayTime}
                />
              )}

              <Text className="text-sm font-semibold mb-1 mt-2">Kurzbeschreibung / Bio</Text>
              <Controller control={control} name="bio" render={({ field: { onChange, onBlur, value } }) => (
                <TextInput placeholder="Kurzbeschreibung / Bio" value={value} onChangeText={onChange} onBlur={onBlur} className="border border-gray-300 rounded-lg p-3 h-24" multiline />
              )} />

              <Pressable onPress={handleSubmit(onSubmit)} className="bg-gray-900 py-3 rounded-lg items-center mt-3">
                <Text className="text-white font-bold">Speichern</Text>
              </Pressable>
            </>
          )}
        </View>
      </ScrollView>
    </Container>
  );
}

 

