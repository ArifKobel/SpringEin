import { useEffect, useMemo, useState } from "react";
import { View, Text, TextInput, ScrollView, Pressable, Alert, Platform } from "react-native";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import Slider from "@react-native-community/slider";
import { useMutation, useQuery } from "convex/react";
import { api } from "@SpringEin/backend/convex/_generated/api";
import { Container } from "@/components/container";

const AGE_GROUP_PRESETS = ["0-2", "3-5", "6-10"] as const;
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"] as const;

export default function EditProvider() {
  const settings = useQuery(api.profiles.mySettings);
  const myProviders = useQuery(api.profiles.myProviderProfiles) ?? [];
  const currentId = useMemo(() => settings?.activeProviderProfileId ?? myProviders[0]?._id, [settings, myProviders]);
  const update = useMutation(api.profiles.updateProviderProfile);
  const profile = myProviders.find((p) => p._id === currentId);

  const [displayName, setDisplayName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [capacity, setCapacity] = useState("0");
  const [ageGroups, setAgeGroups] = useState<string[]>([]);
  const [maxCommuteKm, setMaxCommuteKm] = useState("0");
  const [availableDays, setAvailableDays] = useState<string[]>([]);
  const [availableTimeFrom, setAvailableTimeFrom] = useState("08:00");
  const [availableTimeTo, setAvailableTimeTo] = useState("16:00");
  const [bio, setBio] = useState("");
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName((profile as any).displayName ?? "");
      setAddress(profile.address);
      setCity(profile.city);
      setPostalCode(profile.postalCode);
      setCapacity(String(profile.capacity));
      setAgeGroups(profile.ageGroups);
      setMaxCommuteKm(String(profile.maxCommuteKm));
      setAvailableDays(profile.availableDays);
      setAvailableTimeFrom(profile.availableTimeFrom);
      setAvailableTimeTo(profile.availableTimeTo);
      setBio(profile.bio ?? "");
    }
  }, [profile]);

  const toggle = (list: string[], value: string, setter: (v: string[]) => void) => {
    setter(list.includes(value) ? list.filter((x) => x !== value) : [...list, value]);
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
    if (selected) setAvailableTimeFrom(formatTime(selected));
  };
  const onChangeTo = (_: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS !== "ios") setShowToPicker(false);
    if (selected) setAvailableTimeTo(formatTime(selected));
  };

  const onSubmit = async () => {
    try {
      if (!profile) return;
      if (!city || !address) {
        Alert.alert("Fehler", "Adresse und Stadt sind erforderlich");
        return;
      }
      await update({
        profileId: profile._id as any,
        displayName,
        address,
        city,
        postalCode,
        capacity: Number(capacity),
        ageGroups,
        maxCommuteKm: Number(maxCommuteKm),
        availableDays,
        availableTimeFrom,
        availableTimeTo,
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
        <Text className="text-2xl font-bold mb-3">Tagespflegeperson-Profil bearbeiten</Text>
        {!profile ? (
          <Text>Kein Profil gefunden.</Text>
        ) : (
          <>
            <Text className="font-semibold mb-1">Name</Text>
            <TextInput placeholder="Name" value={displayName} onChangeText={setDisplayName} className="border border-gray-300 rounded-lg p-3 mb-3" />
            <TextInput placeholder="Adresse" value={address} onChangeText={setAddress} className="border border-gray-300 rounded-lg p-3 mb-3" />
            <TextInput placeholder="Stadt" value={city} onChangeText={setCity} className="border border-gray-300 rounded-lg p-3 mb-3" />
            <TextInput placeholder="PLZ" value={postalCode} onChangeText={setPostalCode} className="border border-gray-300 rounded-lg p-3 mb-3" />
            <Text className="font-semibold mb-1">Kapazität (Kinder)</Text>
            <View className="mb-1 flex-row justify-between">
              <Text className="text-gray-700">{Number(capacity) || 1}</Text>
              <Text className="text-gray-500 text-xs">1–5</Text>
            </View>
            <Slider
              minimumValue={1}
              maximumValue={5}
              step={1}
              value={Number(capacity) || 1}
              onValueChange={(v) => setCapacity(String(v))}
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
              {AGE_GROUP_PRESETS.map((ag) => (
                <Pressable key={ag} onPress={() => toggle(ageGroups, ag, setAgeGroups)} className={`px-3 py-2 rounded-full border ${ageGroups.includes(ag) ? "bg-gray-900 border-gray-900" : "border-gray-300"}`}>
                  <Text className={`${ageGroups.includes(ag) ? "text-white" : "text-gray-900"}`}>{ag}</Text>
                </Pressable>
              ))}
            </View>
            <Text className="font-semibold mb-1">Max. Pendelstrecke (km)</Text>
            <View className="mb-1 flex-row justify-between">
              <Text className="text-gray-700">{Number(maxCommuteKm) || 0} km</Text>
              <Text className="text-gray-500 text-xs">0–100 km</Text>
            </View>
            <Slider
              minimumValue={0}
              maximumValue={100}
              step={5}
              value={Number(maxCommuteKm) || 0}
              onValueChange={(v) => setMaxCommuteKm(String(v))}
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
              {DAYS.map((d) => (
                <Pressable key={d} onPress={() => toggle(availableDays, d, setAvailableDays)} className={`px-3 py-2 rounded-full border ${availableDays.includes(d) ? "bg-gray-900 border-gray-900" : "border-gray-300"}`}>
                  <Text className={`${availableDays.includes(d) ? "text-white" : "text-gray-900"}`}>{d}</Text>
                </Pressable>
              ))}
            </View>
            <Text className="font-semibold mb-2">Verfügbare Zeiten</Text>
            <View className="flex-row gap-3 mb-2">
              <Pressable onPress={() => setShowFromPicker(true)} className="border border-gray-300 rounded-lg p-3 flex-1 justify-center">
                <Text>Von: {availableTimeFrom}</Text>
              </Pressable>
              <Pressable onPress={() => setShowToPicker(true)} className="border border-gray-300 rounded-lg p-3 flex-1 justify-center">
                <Text>Bis: {availableTimeTo}</Text>
              </Pressable>
            </View>
            {showFromPicker && (
              <DateTimePicker value={parseTimeToDate(availableTimeFrom)} mode="time" display={Platform.OS === "ios" ? "spinner" : "default"} onChange={onChangeFrom} />
            )}
            {showToPicker && (
              <DateTimePicker value={parseTimeToDate(availableTimeTo)} mode="time" display={Platform.OS === "ios" ? "spinner" : "default"} onChange={onChangeTo} />
            )}
            <Text className="font-semibold mb-2">Bio</Text>
            <TextInput placeholder="Bio" value={bio} onChangeText={setBio} className="border border-gray-300 rounded-lg p-3 h-24" multiline />
            <Pressable onPress={onSubmit} className="bg-gray-900 py-3 rounded-lg items-center mt-2">
              <Text className="text-white font-bold">Speichern</Text>
            </Pressable>
          </>
        )}
        </View>
      </ScrollView>
    </Container>
  );
}

 

