import { useEffect, useState } from "react";
import { View, Text, TextInput, ScrollView, Pressable, Alert } from "react-native";
import * as Location from "expo-location";
import { AddressInput, type AddressValue } from "@/components/address-input";
import { useMutation, useQuery } from "convex/react";
import { api } from "@SpringEin/backend/convex/_generated/api";
import { Container } from "@/components/container";
import { useMutation as useSetActiveMutation } from "convex/react";
import { router } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

export default function NewExchange() {
  const create = useMutation(api.profiles.createExchangeProfile);
  const setActive = useSetActiveMutation(api.profiles.setActiveProfile);
  const existing = useQuery(api.profiles.myExchangeProfiles) ?? [];
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
  const { control, handleSubmit, getValues, setValue, formState: { errors } } = useForm<FormValues>({
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
  // removed share toggles from profile
  const [openingHours, setOpeningHours] = useState<{ day: string; from: string; to: string }[]>([]);
  const [addressInfo, setAddressInfo] = useState<AddressValue>({ address: "", city: "", postalCode: "" });

  useEffect(() => {
    if (existing.length > 0) {
      router.replace("/(exchange)/profile/edit");
    }
  }, [existing.length]);

  const onSubmit = async (values: FormValues) => {
    try {
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
      const id = await create({
        facilityName: values.facilityName,
        address: values.address,
        city: values.city,
        postalCode: values.postalCode,
        latitude: lat,
        longitude: lng,
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
      await setActive({ role: "exchange", exchangeProfileId: id as any });
      router.replace("/(exchange)/(tabs)/home");
    } catch (e) {
      Alert.alert("Fehler", String(e));
    }
  };

  return (
    <Container>
      <ScrollView style={{ padding: 16 }}>
        <Text style={{ fontSize: 22, fontWeight: "700", marginBottom: 12 }}>
          Kindertagesstätte-Profil anlegen
        </Text>
        <Text style={{ fontWeight: "600", marginBottom: 6 }}>Einrichtungsname</Text>
        <Controller
          control={control}
          name="facilityName"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput placeholder="Einrichtungsname" value={value} onChangeText={onChange} onBlur={onBlur} style={styles.input} />
          )}
        />
        {errors.facilityName && <Text style={{ color: "#ef4444", marginTop: -8, marginBottom: 8, fontSize: 12 }}>{errors.facilityName.message}</Text>}
        <Text style={{ fontWeight: "600", marginBottom: 6 }}>Adresse</Text>
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
        {errors.address && <Text style={{ color: "#ef4444", marginTop: -8, marginBottom: 8, fontSize: 12 }}>{errors.address.message}</Text>}
        <Text style={{ fontWeight: "600", marginBottom: 6 }}>Stadt</Text>
        <Controller control={control} name="city" render={({ field: { value } }) => (
          <TextInput placeholder="Stadt" value={value} editable={false} style={[styles.input, { backgroundColor: '#F9FAFB' }]} />
        )} />
        {errors.city && <Text style={{ color: "#ef4444", marginTop: -8, marginBottom: 8, fontSize: 12 }}>{errors.city.message}</Text>}
        <Text style={{ fontWeight: "600", marginBottom: 6 }}>PLZ</Text>
        <Controller control={control} name="postalCode" render={({ field: { value } }) => (
          <TextInput placeholder="PLZ" value={value} editable={false} style={[styles.input, { backgroundColor: '#F9FAFB' }]} />
        )} />
        <Text style={{ fontWeight: "600", marginBottom: 6 }}>Ansprechpartner</Text>
        <Controller control={control} name="contactPersonName" render={({ field: { onChange, onBlur, value } }) => (
          <TextInput placeholder="Ansprechpartner" value={value} onChangeText={onChange} onBlur={onBlur} style={styles.input} />
        )} />
        <Text style={{ fontWeight: "600", marginBottom: 6 }}>Telefon</Text>
        <Controller control={control} name="phone" render={({ field: { onChange, onBlur, value } }) => (
          <TextInput placeholder="Telefon" value={value} onChangeText={onChange} onBlur={onBlur} style={styles.input} keyboardType="phone-pad" />
        )} />
        <Text style={{ fontWeight: "600", marginBottom: 6 }}>E-Mail</Text>
        <Controller control={control} name="email" render={({ field: { onChange, onBlur, value } }) => (
          <TextInput placeholder="E-Mail" value={value} onChangeText={onChange} onBlur={onBlur} style={styles.input} keyboardType="email-address" autoCapitalize="none" />
        )} />
        {errors.email && <Text style={{ color: "#ef4444", marginTop: -8, marginBottom: 8, fontSize: 12 }}>{errors.email.message}</Text>}
        {/* Share toggles removed from profile */}
        <Text style={{ fontWeight: "600", marginTop: 12, marginBottom: 8 }}>Altersgruppen</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
          {(["0-2", "3-5", "6-10"] as const).map((g) => {
            const list = getValues("ageGroups");
            const active = list.includes(g);
            return (
              <Pressable key={g} onPress={() => {
                const now = getValues("ageGroups");
                const next = now.includes(g) ? now.filter((x) => x !== g) : [...now, g];
                setValue("ageGroups", next, { shouldValidate: true });
              }} style={[styles.chip, active && styles.chipActive]}>
                <Text style={{ color: active ? "#fff" : "#111" }}>{g}</Text>
              </Pressable>
            );
          })}
        </View>
        {errors.ageGroups && <Text style={{ color: "#ef4444", marginTop: -8, marginBottom: 8, fontSize: 12 }}>{errors.ageGroups.message as string}</Text>}
        <Text style={{ fontWeight: "600", marginBottom: 8 }}>Öffnungstage</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
          {(["Mon", "Tue", "Wed", "Thu", "Fri"] as const).map((d) => {
            const list = getValues("openingDays");
            const active = list.includes(d);
            return (
              <Pressable key={d} onPress={() => {
                const now = getValues("openingDays");
                const next = now.includes(d) ? now.filter((x) => x !== d) : [...now, d];
                setValue("openingDays", next, { shouldValidate: true });
              }} style={[styles.chip, active && styles.chipActive]}>
                <Text style={{ color: active ? "#fff" : "#111" }}>{d}</Text>
              </Pressable>
            );
          })}
        </View>
        {errors.openingDays && <Text style={{ color: "#ef4444", marginTop: -8, marginBottom: 8, fontSize: 12 }}>{errors.openingDays.message as string}</Text>}
        <View style={{ flexDirection: "row", gap: 12 }}>
          <Controller control={control} name="openingTimeFrom" render={({ field: { onChange, onBlur, value } }) => (
            <TextInput placeholder="Öffnet (HH:MM)" value={value} onChangeText={onChange} onBlur={onBlur} style={[styles.input, { flex: 1 }]} />
          )} />
          <Controller control={control} name="openingTimeTo" render={({ field: { onChange, onBlur, value } }) => (
            <TextInput placeholder="Schließt (HH:MM)" value={value} onChangeText={onChange} onBlur={onBlur} style={[styles.input, { flex: 1 }]} />
          )} />
        </View>
        {(errors.openingTimeFrom || errors.openingTimeTo) && (
          <Text style={{ color: "#ef4444", marginTop: 4, marginBottom: 8, fontSize: 12 }}>{errors.openingTimeFrom?.message || errors.openingTimeTo?.message}</Text>
        )}
        <Text style={{ fontWeight: "600", marginTop: 12, marginBottom: 8 }}>Öffnungszeiten pro Wochentag (optional)</Text>
        {(["Mon", "Tue", "Wed", "Thu", "Fri"] as const).map((d) => {
          const entry = openingHours.find((x) => x.day === d) || { day: d, from: "", to: "" };
          return (
            <View key={d} style={{ flexDirection: "row", gap: 8, marginBottom: 8 }}>
              <View style={[styles.input, { flex: 0.6 }]}><Text>{d}</Text></View>
              <TextInput placeholder="Von" value={entry.from} onChangeText={(t) => setOpeningHours((prev) => {
                const others = prev.filter((x) => x.day !== d);
                return [...others, { ...entry, from: t }];
              })} style={[styles.input, { flex: 1 }]} />
              <TextInput placeholder="Bis" value={entry.to} onChangeText={(t) => setOpeningHours((prev) => {
                const others = prev.filter((x) => x.day !== d);
                return [...others, { ...entry, to: t }];
              })} style={[styles.input, { flex: 1 }]} />
            </View>
          );
        })}
        <Controller control={control} name="bio" render={({ field: { onChange, onBlur, value } }) => (
          <TextInput placeholder="Kurzbeschreibung" value={value} onChangeText={onChange} onBlur={onBlur} style={[styles.input, { height: 100 }]} multiline />
        )} />
        <Pressable onPress={handleSubmit(onSubmit)} style={styles.button}>
          <Text style={styles.buttonText}>Speichern</Text>
        </Pressable>
      </ScrollView>
    </Container>
  );
}

const styles = {
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 999,
  },
  chipActive: {
    backgroundColor: "#111827",
    borderColor: "#111827",
  },
  button: {
    backgroundColor: "#111827",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: { color: "white", fontWeight: "700" },
} as const;
