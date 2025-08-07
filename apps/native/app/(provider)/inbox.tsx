import { View, Text, ScrollView, Pressable, Alert, TextInput } from "react-native";
import { useMutation, useQuery } from "convex/react";
import { api } from "@SpringEin/backend/convex/_generated/api";
import { Container } from "@/components/container";
import { useState } from "react";

export default function Inbox() {
  const items = useQuery(api.requests.providerInbox) ?? [];

  // Hinweis: Annahme/Ablehnung erfolgt durch die Kindertagesstätte auf Bewerbungen.

  return (
    <Container>
      <ScrollView style={{ padding: 16 }}>
        <Text style={{ fontSize: 22, fontWeight: "700", marginBottom: 12 }}>Eingehende Anfragen</Text>
        {items.map((it: any) => (
          <View key={it.match._id} style={styles.card}>
            <Text style={styles.title}>Status: {it.match.status}</Text>
            <Text>Datum: {it.request.startDate} bis {it.request.endDate}</Text>
            <Text>Zeit: {it.request.timeFrom} - {it.request.timeTo}</Text>
            <Text>Altersgruppen: {it.request.ageGroups.join(", ")}</Text>
            {/* Bewerbung durch Anbieter */}
            <ApplySection requestId={it.request._id} providerProfileId={it.match.providerProfileId} />
          </View>
        ))}
        {!items.length && <Text>Keine Anfragen vorhanden.</Text>}
      </ScrollView>
    </Container>
  );
}

function ApplySection({ requestId, providerProfileId }: { requestId: string; providerProfileId: string }) {
  const apply = useMutation(api.requests.applyToRequest);
  const [coverNote, setCoverNote] = useState("");
  const [sharePhone, setSharePhone] = useState(true);
  const [shareEmail, setShareEmail] = useState(false);
  const [initialMessage, setInitialMessage] = useState("");

  const onApply = async () => {
    try {
      await apply({ requestId: requestId as any, providerProfileId: providerProfileId as any, coverNote, sharePhone, shareEmail, initialMessage });
      Alert.alert("Gesendet", "Bewerbung gesendet");
    } catch (e) {
      Alert.alert("Fehler", String(e));
    }
  };

  return (
    <View style={{ marginTop: 12 }}>
      <Text style={styles.title}>Bewerben</Text>
      <TextInput placeholder="Kurze Notiz" value={coverNote} onChangeText={setCoverNote} style={styles.input} />
      <View style={{ flexDirection: "row", gap: 8, marginBottom: 8 }}>
        <Pressable onPress={() => setSharePhone((v) => !v)} style={[styles.chip, sharePhone && styles.chipActive]}>
          <Text style={{ color: sharePhone ? "#fff" : "#111" }}>Telefon teilen</Text>
        </Pressable>
        <Pressable onPress={() => setShareEmail((v) => !v)} style={[styles.chip, shareEmail && styles.chipActive]}>
          <Text style={{ color: shareEmail ? "#fff" : "#111" }}>E-Mail teilen</Text>
        </Pressable>
      </View>
      <TextInput placeholder="Nachricht" value={initialMessage} onChangeText={setInitialMessage} style={[styles.input, { height: 80 }]} multiline />
      <Pressable onPress={onApply} style={[styles.btnPrimary, { marginTop: 8 }]}>
        <Text style={styles.btnText}>Bewerbung senden</Text>
      </Pressable>
    </View>
  );
}

const styles = {
  card: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  title: { fontWeight: "700", marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
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
  btnPrimary: {
    backgroundColor: "#111827",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  btnSecondary: {
    backgroundColor: "#e5e7eb",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  btnText: { color: "white", fontWeight: "700" },
  btnTextDark: { color: "#111827", fontWeight: "700" },
} as const;


