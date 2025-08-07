import { useEffect, useMemo, useState } from "react";
import { View, Text, TextInput, ScrollView, Pressable, Alert } from "react-native";
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
  const [sharePhone, setSharePhone] = useState(false);
  const [shareEmail, setShareEmail] = useState(false);
  const [ageGroups, setAgeGroups] = useState<string[]>([]);
  const [openingDays, setOpeningDays] = useState<string[]>([]);
  const [openingTimeFrom, setOpeningTimeFrom] = useState("08:00");
  const [openingTimeTo, setOpeningTimeTo] = useState("16:00");
  const [bio, setBio] = useState("");

  useEffect(() => {
    if (profile) {
      setFacilityName(profile.facilityName ?? "");
      setAddress(profile.address ?? "");
      setCity(profile.city);
      setPostalCode(profile.postalCode ?? "");
      setContactPersonName(profile.contactPersonName ?? "");
      setPhone(profile.phone ?? "");
      setSharePhone(Boolean(profile.sharePhone));
      setShareEmail(Boolean(profile.shareEmail));
      setAgeGroups(profile.ageGroups ?? []);
      setOpeningDays(profile.openingDays ?? []);
      setOpeningTimeFrom(profile.openingTimeFrom ?? "08:00");
      setOpeningTimeTo(profile.openingTimeTo ?? "16:00");
      setBio(profile.bio ?? "");
    }
  }, [profile]);

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
        sharePhone,
        shareEmail,
        ageGroups,
        openingDays,
        openingTimeFrom,
        openingTimeTo,
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
        <Text style={{ fontSize: 22, fontWeight: "700", marginBottom: 12 }}>Kindertagesstätte-Profil bearbeiten</Text>
        {!profile ? (
          <Text>Kein Profil gefunden.</Text>
        ) : (
          <>
            <TextInput placeholder="Einrichtungsname" value={facilityName} onChangeText={setFacilityName} style={styles.input} />
            <TextInput placeholder="Adresse" value={address} onChangeText={setAddress} style={styles.input} />
            <TextInput placeholder="Stadt" value={city} onChangeText={setCity} style={styles.input} />
            <TextInput placeholder="PLZ" value={postalCode} onChangeText={setPostalCode} style={styles.input} />
            <TextInput placeholder="Ansprechpartner" value={contactPersonName} onChangeText={setContactPersonName} style={styles.input} />
            <TextInput placeholder="Telefon" value={phone} onChangeText={setPhone} style={styles.input} keyboardType="phone-pad" />
            <View style={{ flexDirection: "row", gap: 12 }}>
              <Pressable onPress={() => setSharePhone((v) => !v)} style={[styles.chip, sharePhone && styles.chipActive]}>
                <Text style={{ color: sharePhone ? "#fff" : "#111" }}>Telefon teilen</Text>
              </Pressable>
              <Pressable onPress={() => setShareEmail((v) => !v)} style={[styles.chip, shareEmail && styles.chipActive]}>
                <Text style={{ color: shareEmail ? "#fff" : "#111" }}>E-Mail teilen</Text>
              </Pressable>
            </View>
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
            <TextInput placeholder="Kurzbeschreibung" value={bio} onChangeText={setBio} style={[styles.input, { height: 100 }]} multiline />
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

