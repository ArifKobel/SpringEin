import { useEffect, useMemo, useState } from "react";
import { View, Text, TextInput, ScrollView, Pressable, Alert } from "react-native";
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

  useEffect(() => {
    if (profile) {
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

  const onSubmit = async () => {
    try {
      if (!profile) return;
      if (!city || !address) {
        Alert.alert("Fehler", "Adresse und Stadt sind erforderlich");
        return;
      }
      await update({
        profileId: profile._id as any,
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
      <ScrollView style={{ padding: 16 }}>  
        <Text style={{ fontSize: 22, fontWeight: "700", marginBottom: 12 }}>Tagespflegeperson-Profil bearbeiten</Text>
        {!profile ? (
          <Text>Kein Profil gefunden.</Text>
        ) : (
          <>
            <TextInput placeholder="Adresse" value={address} onChangeText={setAddress} style={styles.input} />
            <TextInput placeholder="Stadt" value={city} onChangeText={setCity} style={styles.input} />
            <TextInput placeholder="PLZ" value={postalCode} onChangeText={setPostalCode} style={styles.input} />
            <TextInput placeholder="Kapazität (Kinder)" value={capacity} onChangeText={setCapacity} keyboardType="number-pad" style={styles.input} />
            <Text style={styles.label}>Altersgruppen</Text>
            <View style={styles.rowWrap}>
              {AGE_GROUP_PRESETS.map((ag) => (
                <Pressable key={ag} onPress={() => toggle(ageGroups, ag, setAgeGroups)} style={[styles.chip, ageGroups.includes(ag) && styles.chipActive]}>
                  <Text style={{ color: ageGroups.includes(ag) ? "#fff" : "#111" }}>{ag}</Text>
                </Pressable>
              ))}
            </View>
            <TextInput placeholder="Max. Pendelstrecke (km)" value={maxCommuteKm} onChangeText={setMaxCommuteKm} keyboardType="number-pad" style={styles.input} />
            <Text style={styles.label}>Wochentage</Text>
            <View style={styles.rowWrap}>
              {DAYS.map((d) => (
                <Pressable key={d} onPress={() => toggle(availableDays, d, setAvailableDays)} style={[styles.chip, availableDays.includes(d) && styles.chipActive]}>
                  <Text style={{ color: availableDays.includes(d) ? "#fff" : "#111" }}>{d}</Text>
                </Pressable>
              ))}
            </View>
            <View style={{ flexDirection: "row", gap: 12 }}>
              <TextInput placeholder="Von (HH:MM)" value={availableTimeFrom} onChangeText={setAvailableTimeFrom} style={[styles.input, { flex: 1 }]} />
              <TextInput placeholder="Bis (HH:MM)" value={availableTimeTo} onChangeText={setAvailableTimeTo} style={[styles.input, { flex: 1 }]} />
            </View>
            <TextInput placeholder="Bio" value={bio} onChangeText={setBio} style={[styles.input, { height: 100 }]} multiline />
            <Pressable onPress={onSubmit} style={styles.button}>
              <Text style={styles.buttonText}>Speichern</Text>
            </Pressable>
          </>
        )}
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
  label: { fontWeight: "600", marginBottom: 8 },
  rowWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 },
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

