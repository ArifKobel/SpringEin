import { useEffect, useMemo, useState } from "react";
import { View, Text, TextInput, ScrollView, Pressable, Alert, Platform } from "react-native";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { useMutation, useQuery } from "convex/react";
import { api } from "@SpringEin/backend/convex/_generated/api";
import { Container } from "@/components/container";

export default function EditExchange() {
  const settings = useQuery(api.profiles.mySettings);
  const myExchanges = useQuery(api.profiles.myExchangeProfiles) ?? [];
  const currentId = useMemo(() => settings?.activeExchangeProfileId ?? myExchanges[0]?._id, [settings, myExchanges]);
  const update = useMutation(api.profiles.updateExchangeProfile);
  const profile = myExchanges.find((p) => p._id === currentId);

  const [facilityName, setFacilityName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [contactPersonName, setContactPersonName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  // removed share toggles from profile
  const [ageGroups, setAgeGroups] = useState<string[]>([]);
  const [openingDays, setOpeningDays] = useState<string[]>([]);
  const [openingTimeFrom, setOpeningTimeFrom] = useState("08:00");
  const [openingTimeTo, setOpeningTimeTo] = useState("16:00");
  const [openingHours, setOpeningHours] = useState<{ day: string; from: string; to: string }[]>([]);
  const [bio, setBio] = useState("");
  const [showStdFrom, setShowStdFrom] = useState(false);
  const [showStdTo, setShowStdTo] = useState(false);
  const [openDayPicker, setOpenDayPicker] = useState<{ day: string | null; which: "from" | "to" | null }>({ day: null, which: null });

  useEffect(() => {
    if (profile) {
      setFacilityName(profile.facilityName ?? "");
      setAddress(profile.address ?? "");
      setCity(profile.city);
      setPostalCode(profile.postalCode ?? "");
      setContactPersonName(profile.contactPersonName ?? "");
      setPhone(profile.phone ?? "");
      setEmail((profile as any).email ?? "");
      setAgeGroups(profile.ageGroups ?? []);
      setOpeningDays(profile.openingDays ?? []);
      setOpeningTimeFrom(profile.openingTimeFrom ?? "08:00");
      setOpeningTimeTo(profile.openingTimeTo ?? "16:00");
      setOpeningHours(profile.openingHours ?? []);
      setBio(profile.bio ?? "");
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
    if (selected) setOpeningTimeFrom(formatTime(selected));
  };
  const onChangeStdTo = (_: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS !== "ios") setShowStdTo(false);
    if (selected) setOpeningTimeTo(formatTime(selected));
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
    setOpeningHours((prev) => {
      const others = prev.filter((x) => !openingDays.includes(x.day));
      const add = openingDays.map((d) => ({ day: d, from: openingTimeFrom, to: openingTimeTo }));
      return [...others, ...add];
    });
  };

  const onSubmit = async () => {
    try {
      if (!profile) return;
      if (!facilityName || !address || !city) {
        Alert.alert("Fehler", "Name der Einrichtung, Adresse und Stadt sind erforderlich");
        return;
      }
       await update({
        profileId: profile._id as any,
        facilityName,
        address,
        city,
        postalCode,
        contactPersonName,
         phone,
         email,
        ageGroups,
        openingDays,
        openingTimeFrom,
        openingTimeTo,
        openingHours,
        bio,
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
              <TextInput placeholder="Einrichtungsname" value={facilityName} onChangeText={setFacilityName} className="border border-gray-300 rounded-lg p-3 mb-3" />

              <Text className="text-sm font-semibold mb-1">Adresse</Text>
              <TextInput placeholder="Adresse" value={address} onChangeText={setAddress} className="border border-gray-300 rounded-lg p-3 mb-3" />
              <View className="flex-row gap-3">
                <View className="flex-1">
                  <Text className="text-sm font-semibold mb-1">Stadt</Text>
                  <TextInput placeholder="Stadt" value={city} onChangeText={setCity} className="border border-gray-300 rounded-lg p-3 mb-3" />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-semibold mb-1">PLZ</Text>
                  <TextInput placeholder="PLZ" value={postalCode} onChangeText={setPostalCode} className="border border-gray-300 rounded-lg p-3 mb-3" />
                </View>
              </View>

              <Text className="text-sm font-semibold mb-1">Ansprechpartner</Text>
              <TextInput placeholder="Ansprechpartner" value={contactPersonName} onChangeText={setContactPersonName} className="border border-gray-300 rounded-lg p-3 mb-3" />

              <Text className="text-sm font-semibold mb-1">Telefon</Text>
              <TextInput placeholder="Telefon" value={phone} onChangeText={setPhone} className="border border-gray-300 rounded-lg p-3 mb-3" keyboardType="phone-pad" />

              <Text className="text-sm font-semibold mb-1">E-Mail</Text>
              <TextInput placeholder="E-Mail" value={email} onChangeText={setEmail} className="border border-gray-300 rounded-lg p-3 mb-3" keyboardType="email-address" autoCapitalize="none" />

              <Text className="text-sm font-semibold mt-2 mb-2">Altersgruppen</Text>
              <View className="flex-row flex-wrap gap-2 mb-3">
                {(["0-2", "3-5", "6-10"] as const).map((g) => (
                  <Pressable key={g} onPress={() => setAgeGroups((prev) => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g])} className={`px-3 py-2 rounded-full border ${ageGroups.includes(g) ? "bg-gray-900 border-gray-900" : "border-gray-300"}`}>
                    <Text className={`${ageGroups.includes(g) ? "text-white" : "text-gray-900"}`}>{g}</Text>
                  </Pressable>
                ))}
              </View>

              <Text className="text-sm font-semibold mb-2">Öffnungstage</Text>
              <View className="flex-row flex-wrap gap-2 mb-3">
                {(["Mon", "Tue", "Wed", "Thu", "Fri"] as const).map((d) => (
                  <Pressable key={d} onPress={() => setOpeningDays((prev) => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d])} className={`px-3 py-2 rounded-full border ${openingDays.includes(d) ? "bg-gray-900 border-gray-900" : "border-gray-300"}`}>
                    <Text className={`${openingDays.includes(d) ? "text-white" : "text-gray-900"}`}>{d}</Text>
                  </Pressable>
                ))}
              </View>

              <Text className="text-sm font-semibold mb-2">Öffnungszeiten (Standard)</Text>
              <View className="flex-row gap-3 mb-2">
                <Pressable onPress={() => setShowStdFrom(true)} className="border border-gray-300 rounded-lg p-3 flex-1 justify-center">
                  <Text>Öffnet: {openingTimeFrom}</Text>
                </Pressable>
                <Pressable onPress={() => setShowStdTo(true)} className="border border-gray-300 rounded-lg p-3 flex-1 justify-center">
                  <Text>Schließt: {openingTimeTo}</Text>
                </Pressable>
              </View>
              {showStdFrom && (
                <DateTimePicker value={parseTimeToDate(openingTimeFrom)} mode="time" display={Platform.OS === "ios" ? "spinner" : "default"} onChange={onChangeStdFrom} />
              )}
              {showStdTo && (
                <DateTimePicker value={parseTimeToDate(openingTimeTo)} mode="time" display={Platform.OS === "ios" ? "spinner" : "default"} onChange={onChangeStdTo} />
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
                    (openingHours.find((x) => x.day === openDayPicker.day)?.[openDayPicker.which!]) || openingTimeFrom
                  )}
                  mode="time"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={onChangeDayTime}
                />
              )}

              <Text className="text-sm font-semibold mb-1 mt-2">Kurzbeschreibung / Bio</Text>
              <TextInput placeholder="Kurzbeschreibung / Bio" value={bio} onChangeText={setBio} className="border border-gray-300 rounded-lg p-3 h-24" multiline />

              <Pressable onPress={onSubmit} className="bg-gray-900 py-3 rounded-lg items-center mt-3">
                <Text className="text-white font-bold">Speichern</Text>
              </Pressable>
            </>
          )}
        </View>
      </ScrollView>
    </Container>
  );
}

 

