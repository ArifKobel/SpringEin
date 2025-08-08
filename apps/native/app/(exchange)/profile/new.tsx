import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  Alert,
} from "react-native";
import { useMutation, useQuery } from "convex/react";
import { api } from "@SpringEin/backend/convex/_generated/api";
import { Container } from "@/components/container";
import { useMutation as useSetActiveMutation } from "convex/react";
import { router } from "expo-router";

export default function NewExchange() {
  const create = useMutation(api.profiles.createExchangeProfile);
  const setActive = useSetActiveMutation(api.profiles.setActiveProfile);
  const existing = useQuery(api.profiles.myExchangeProfiles) ?? [];
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

  useEffect(() => {
    if (existing.length > 0) {
      router.replace("/(exchange)/profile/edit");
    }
  }, [existing.length]);

  const onSubmit = async () => {
    try {
      if (!facilityName || !address || !city) {
        Alert.alert("Fehler", "Name der Einrichtung, Adresse und Stadt sind erforderlich");
        return;
      }
      const id = await create({
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
      await setActive({ role: "exchange", exchangeProfileId: id as any });
      router.replace("/(exchange)/home");
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
        <TextInput
          placeholder="Einrichtungsname"
          value={facilityName}
          onChangeText={setFacilityName}
          style={styles.input}
        />
        <Text style={{ fontWeight: "600", marginBottom: 6 }}>Adresse</Text>
        <TextInput
          placeholder="Adresse"
          value={address}
          onChangeText={setAddress}
          style={styles.input}
        />
        <Text style={{ fontWeight: "600", marginBottom: 6 }}>Stadt</Text>
        <TextInput
          placeholder="Stadt"
          value={city}
          onChangeText={setCity}
          style={styles.input}
        />
        <Text style={{ fontWeight: "600", marginBottom: 6 }}>PLZ</Text>
        <TextInput
          placeholder="PLZ"
          value={postalCode}
          onChangeText={setPostalCode}
          style={styles.input}
        />
        <Text style={{ fontWeight: "600", marginBottom: 6 }}>Ansprechpartner</Text>
        <TextInput
          placeholder="Ansprechpartner"
          value={contactPersonName}
          onChangeText={setContactPersonName}
          style={styles.input}
        />
        <Text style={{ fontWeight: "600", marginBottom: 6 }}>Telefon</Text>
        <TextInput
          placeholder="Telefon"
          value={phone}
          onChangeText={setPhone}
          style={styles.input}
          keyboardType="phone-pad"
        />
        <Text style={{ fontWeight: "600", marginBottom: 6 }}>E-Mail</Text>
        <TextInput
          placeholder="E-Mail"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {/* Share toggles removed from profile */}
        <Text style={{ fontWeight: "600", marginTop: 12, marginBottom: 8 }}>Altersgruppen</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
          {(["0-2", "3-5", "6-10"] as const).map((g) => (
            <Pressable key={g} onPress={() => setAgeGroups((prev) => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g])} style={[styles.chip, ageGroups.includes(g) && styles.chipActive]}>
              <Text style={{ color: ageGroups.includes(g) ? "#fff" : "#111" }}>{g}</Text>
            </Pressable>
          ))}
        </View>
        <Text style={{ fontWeight: "600", marginBottom: 8 }}>Öffnungstage</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
          {(["Mon", "Tue", "Wed", "Thu", "Fri"] as const).map((d) => (
            <Pressable key={d} onPress={() => setOpeningDays((prev) => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d])} style={[styles.chip, openingDays.includes(d) && styles.chipActive]}>
              <Text style={{ color: openingDays.includes(d) ? "#fff" : "#111" }}>{d}</Text>
            </Pressable>
          ))}
        </View>
        <View style={{ flexDirection: "row", gap: 12 }}>
          <TextInput placeholder="Öffnet (HH:MM)" value={openingTimeFrom} onChangeText={setOpeningTimeFrom} style={[styles.input, { flex: 1 }]} />
          <TextInput placeholder="Schließt (HH:MM)" value={openingTimeTo} onChangeText={setOpeningTimeTo} style={[styles.input, { flex: 1 }]} />
        </View>
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
        <TextInput
          placeholder="Kurzbeschreibung"
          value={bio}
          onChangeText={setBio}
          style={[styles.input, { height: 100 }]}
          multiline
        />
        <Pressable onPress={onSubmit} style={styles.button}>
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
