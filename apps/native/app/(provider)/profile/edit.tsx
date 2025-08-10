import { useEffect, useMemo, useState } from "react";
import { View, Text, TextInput, ScrollView, Pressable, Alert, Platform } from "react-native";
import * as Location from "expo-location";
import { AddressInput, type AddressValue } from "@/components/address-input";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import Slider from "@react-native-community/slider";
import { useMutation, useQuery } from "convex/react";
import { api } from "@SpringEin/backend/convex/_generated/api";
import { Container } from "@/components/container";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

const AGE_GROUP_PRESETS = ["0-2", "3-5", "6-10"] as const;
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"] as const;

export default function EditProvider() {
  const settings = useQuery(api.profiles.mySettings);
  const myProviders = useQuery(api.profiles.myProviderProfiles) ?? [];
  const currentId = useMemo(() => settings?.activeProviderProfileId ?? myProviders[0]?._id, [settings, myProviders]);
  const update = useMutation(api.profiles.updateProviderProfile);
  const profile = myProviders.find((p) => p._id === currentId);

  type FormValues = {
    displayName?: string;
    address: string;
    city: string;
    postalCode?: string;
    capacity: number;
    ageGroups: string[];
    maxCommuteKm: number;
    availableDays: string[];
    availableTimeFrom: string;
    availableTimeTo: string;
    bio?: string;
  };
  const schema: yup.ObjectSchema<FormValues> = yup.object({
    displayName: yup.string().optional(),
    address: yup.string().required("Adresse ist erforderlich"),
    city: yup.string().required("Stadt ist erforderlich"),
    postalCode: yup.string().optional(),
    capacity: yup.number().min(1).max(5).required(),
    ageGroups: yup.array(yup.string().required()).min(1, "Mindestens eine Altersgruppe wählen").required(),
    maxCommuteKm: yup.number().min(0).max(100).required(),
    availableDays: yup.array(yup.string().required()).min(1, "Mindestens ein Wochentag").required(),
    availableTimeFrom: yup.string().matches(/^\d{2}:\d{2}$/g, "Format HH:MM").required(),
    availableTimeTo: yup.string().matches(/^\d{2}:\d{2}$/g, "Format HH:MM").required(),
    bio: yup.string().optional(),
  }).test("time-order", "Von muss vor Bis liegen", (values) => {
    if (!values) return false;
    const toMinutes = (t: string) => {
      const [h, m] = t.split(":").map(Number);
      return h * 60 + m;
    };
    return toMinutes(values.availableTimeFrom) < toMinutes(values.availableTimeTo);
  });
  const { control, handleSubmit, setValue, getValues, reset, formState: { errors } } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      displayName: "",
      address: "",
      city: "",
      postalCode: "",
      capacity: 1,
      ageGroups: [],
      maxCommuteKm: 0,
      availableDays: [],
      availableTimeFrom: "08:00",
      availableTimeTo: "16:00",
      bio: "",
    }
  });
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [addressInfo, setAddressInfo] = useState<AddressValue>({ address: "" });

  useEffect(() => {
    if (profile) {
      reset({
        displayName: (profile as any).displayName ?? "",
        address: profile.address,
        city: profile.city,
        postalCode: profile.postalCode,
        capacity: Number(profile.capacity),
        ageGroups: profile.ageGroups,
        maxCommuteKm: Number(profile.maxCommuteKm),
        availableDays: profile.availableDays,
        availableTimeFrom: profile.availableTimeFrom,
        availableTimeTo: profile.availableTimeTo,
        bio: profile.bio ?? "",
      });
    }
  }, [profile, reset]);

  const toggleListValue = (field: keyof Pick<FormValues, "ageGroups" | "availableDays">, value: string) => {
    const list = getValues(field) as string[];
    const next = list.includes(value) ? list.filter((x) => x !== value) : [...list, value];
    setValue(field as any, next, { shouldValidate: true });
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
  const onChangeFrom = (_: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS !== "ios") setShowFromPicker(false);
    if (selected) setValue('availableTimeFrom', formatTime(selected), { shouldValidate: true });
  };
  const onChangeTo = (_: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS !== "ios") setShowToPicker(false);
    if (selected) setValue('availableTimeTo', formatTime(selected), { shouldValidate: true });
  };

  const onSubmit = async (values: FormValues) => {
    try {
      if (!profile) return;
      let lat = addressInfo.latitude;
      let lng = addressInfo.longitude;
      if ((lat == null || lng == null) && values.address) {
        const r = await Location.geocodeAsync(values.address);
        if (r[0]) {
          lat = r[0].latitude;
          lng = r[0].longitude;
          setAddressInfo({ ...addressInfo, latitude: lat, longitude: lng });
        }
      }
      await update({
        profileId: profile._id as any,
        displayName: values.displayName,
        address: values.address,
        city: values.city,
        postalCode: values.postalCode ?? "",
        latitude: lat,
        longitude: lng,
        capacity: values.capacity,
        ageGroups: values.ageGroups,
        maxCommuteKm: values.maxCommuteKm,
        availableDays: values.availableDays,
        availableTimeFrom: values.availableTimeFrom,
        availableTimeTo: values.availableTimeTo,
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
            <Text className="text-2xl font-bold mb-3">Tagespflegeperson-Profil bearbeiten</Text>
        {!profile ? (
          <Text>Kein Profil gefunden.</Text>
        ) : (
          <>
            <Text className="font-semibold mb-1">Name</Text>
                <Controller control={control} name="displayName" render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput placeholder="Name" value={value} onChangeText={onChange} onBlur={onBlur} className="border border-gray-300 rounded-lg p-3 mb-3" />
                )} />
                <Controller control={control} name="address" render={({ field: { value } }) => (
                  <AddressInput
                    value={{ address: value, city: getValues('city') || undefined, postalCode: getValues('postalCode') || undefined, latitude: addressInfo.latitude, longitude: addressInfo.longitude }}
                    onChange={(val) => {
                      setAddressInfo(val);
                      setValue('address', val.address, { shouldValidate: true });
                      if (val.city) setValue('city', val.city, { shouldValidate: true });
                      if (val.postalCode) setValue('postalCode', val.postalCode, { shouldValidate: true });
                    }}
                  />
                )} />
                {errors.address && <Text className="text-red-500 text-xs mb-2">{errors.address.message}</Text>}
                <Controller control={control} name="city" render={({ field: { value } }) => (
                  <TextInput placeholder="Stadt" value={value} editable={false} className={`border rounded-lg p-3 mb-1 ${errors.city ? 'border-red-400' : 'border-gray-300'} bg-gray-50`} />
                )} />
                {errors.city && <Text className="text-red-500 text-xs mb-2">{errors.city.message}</Text>}
                <Controller control={control} name="postalCode" render={({ field: { value } }) => (
                  <TextInput placeholder="PLZ" value={value} editable={false} className="border border-gray-300 rounded-lg p-3 mb-3 bg-gray-50" />
                )} />
            <Text className="font-semibold mb-1">Kapazität (Kinder)</Text>
            <View className="mb-1 flex-row justify-between">
                  <Text className="text-gray-700">{getValues('capacity') || 1}</Text>
              <Text className="text-gray-500 text-xs">1–5</Text>
            </View>
            <Slider
              minimumValue={1}
              maximumValue={5}
              step={1}
                  value={getValues('capacity') || 1}
                  onValueChange={(v) => setValue('capacity', v, { shouldValidate: true })}
              minimumTrackTintColor="#111827"
              maximumTrackTintColor="#D1D5DB"
              thumbTintColor="#111827"
            />
            <View className="flex-row justify-between mt-1 mb-3">
              {[1,2,3,4,5].map((v) => (
                <Text key={v} className="text-xs text-gray-400">{v}</Text>
              ))}
            </View>
            <Text className="font-semibold mb-2">Altersgruppen</Text>
            <View className="flex-row flex-wrap gap-2 mb-3">
                  {AGE_GROUP_PRESETS.map((ag) => {
                    const active = (getValues('ageGroups') || []).includes(ag);
                    return (
                      <Pressable key={ag} onPress={() => toggleListValue('ageGroups', ag)} className={`px-3 py-2 rounded-full border ${active ? "bg-gray-900 border-gray-900" : "border-gray-300"}`}>
                        <Text className={`${active ? "text-white" : "text-gray-900"}`}>{ag}</Text>
                      </Pressable>
                    );
                  })}
            </View>
                {errors.ageGroups && <Text className="text-red-500 text-xs mb-2">{errors.ageGroups.message as string}</Text>}
            <Text className="font-semibold mb-1">Max. Pendelstrecke (km)</Text>
            <View className="mb-1 flex-row justify-between">
                  <Text className="text-gray-700">{getValues('maxCommuteKm') || 0} km</Text>
              <Text className="text-gray-500 text-xs">0–100 km</Text>
            </View>
            <Slider
              minimumValue={0}
              maximumValue={100}
              step={5}
                  value={getValues('maxCommuteKm') || 0}
                  onValueChange={(v) => setValue('maxCommuteKm', v, { shouldValidate: true })}
              minimumTrackTintColor="#111827"
              maximumTrackTintColor="#D1D5DB"
              thumbTintColor="#111827"
            />
            <View className="flex-row justify-between mt-1 mb-3">
              {[0,20,40,60,80,100].map((v) => (
                <Text key={v} className="text-xs text-gray-400">{v}</Text>
              ))}
            </View>
            <Text className="font-semibold mb-2">Wochentage</Text>
            <View className="flex-row flex-wrap gap-2 mb-3">
                  {DAYS.map((d) => {
                    const active = (getValues('availableDays') || []).includes(d);
                    return (
                      <Pressable key={d} onPress={() => toggleListValue('availableDays', d)} className={`px-3 py-2 rounded-full border ${active ? "bg-gray-900 border-gray-900" : "border-gray-300"}`}>
                        <Text className={`${active ? "text-white" : "text-gray-900"}`}>{d}</Text>
                      </Pressable>
                    );
                  })}
            </View>
            <Text className="font-semibold mb-2">Verfügbare Zeiten</Text>
            <View className="flex-row gap-3 mb-2">
                  <Pressable onPress={() => setShowFromPicker(true)} className="border border-gray-300 rounded-lg p-3 flex-1 justify-center">
                    <Text>Von: {getValues('availableTimeFrom')}</Text>
              </Pressable>
                  <Pressable onPress={() => setShowToPicker(true)} className="border border-gray-300 rounded-lg p-3 flex-1 justify-center">
                    <Text>Bis: {getValues('availableTimeTo')}</Text>
              </Pressable>
            </View>
            {showFromPicker && (
                  <DateTimePicker value={parseTimeToDate(getValues('availableTimeFrom'))} mode="time" display={Platform.OS === "ios" ? "spinner" : "default"} onChange={onChangeFrom} />
            )}
            {showToPicker && (
                  <DateTimePicker value={parseTimeToDate(getValues('availableTimeTo'))} mode="time" display={Platform.OS === "ios" ? "spinner" : "default"} onChange={onChangeTo} />
            )}
                <Text className="font-semibold mb-2">Bio</Text>
                <Controller control={control} name="bio" render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput placeholder="Bio" value={value} onChangeText={onChange} onBlur={onBlur} className="border border-gray-300 rounded-lg p-3 h-24" multiline />
                )} />
                <Pressable onPress={handleSubmit(onSubmit)} className="bg-gray-900 py-3 rounded-lg items-center mt-2">
              <Text className="text-white font-bold">Speichern</Text>
            </Pressable>
          </>
        )}
        </View>
      </ScrollView>
    </Container>
  );
}

 

