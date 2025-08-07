import { useEffect, useState } from "react";
import { View, Text, TextInput, ScrollView, Pressable, Alert, Platform } from "react-native";
import { useMutation, useQuery } from "convex/react";
import { api } from "@SpringEin/backend/convex/_generated/api";
import { Container } from "@/components/container";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";

export default function NewRequest() {
  const exchangeProfiles = useQuery(api.profiles.myExchangeProfiles) ?? [];
  const create = useMutation(api.requests.createSubstitutionRequest);
  const [exchangeProfileId, setExchangeProfileId] = useState<string | null>(null);
  const AGE_GROUP_PRESETS = ["0-2", "3-5", "6-10"] as const;
  const [ageGroups, setAgeGroups] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [timeFrom, setTimeFrom] = useState("08:00");
  const [timeTo, setTimeTo] = useState("16:00");
  const [notes, setNotes] = useState("");
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  useEffect(() => {
    if (exchangeProfiles.length && !exchangeProfileId) {
      setExchangeProfileId(exchangeProfiles[0]._id);
    }
  }, [exchangeProfiles]);

  const onSubmit = async () => {
    try {
      if (!exchangeProfileId || !startDate || !endDate) {
        Alert.alert("Fehler", "Profil, Start- und Enddatum sind erforderlich");
        return;
      }
      await create({
        exchangeProfileId: exchangeProfileId as any,
        ageGroups,
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
        timeFrom,
        timeTo,
        notes,
      });
      Alert.alert("Erfolgreich", "Anfrage erstellt");
    } catch (e) {
      Alert.alert("Fehler", String(e));
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
    if (selected) setStartDate(selected);
  };
  const onChangeEnd = (_: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS !== "ios") setShowEndPicker(false);
    if (selected) setEndDate(selected);
  };

  return (
    <Container>
      <ScrollView style={{ padding: 16 }}>
        <Text style={{ fontSize: 22, fontWeight: "700", marginBottom: 12 }}>Vertretung anfragen</Text>
        <Text style={{ marginBottom: 8 }}>Kindertagesstätte-Profil auswählen</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
          {exchangeProfiles.map((p) => (
            <Pressable
              key={p._id}
              onPress={() => setExchangeProfileId(p._id)}
              style={[styles.chip, exchangeProfileId === p._id && styles.chipActive]}
            >
              <Text style={{ color: exchangeProfileId === p._id ? "#fff" : "#111" }}>{p.city}</Text>
            </Pressable>
          ))}
        </View>
        <Text style={{ fontWeight: "600", marginBottom: 8 }}>Altersgruppen</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
          {AGE_GROUP_PRESETS.map((g) => (
            <Pressable key={g} onPress={() => setAgeGroups((prev) => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g])} style={[styles.chip, ageGroups.includes(g) && styles.chipActive]}>
              <Text style={{ color: ageGroups.includes(g) ? "#fff" : "#111" }}>{g}</Text>
            </Pressable>
          ))}
        </View>
        <Text style={{ fontWeight: "600", marginBottom: 8 }}>Zeitraum</Text>
        <View style={{ flexDirection: "row", gap: 12, marginBottom: 12 }}>
          <Pressable onPress={() => setShowStartPicker(true)} style={[styles.input, { flex: 1, justifyContent: "center" }]}>
            <Text>Start: {formatDate(startDate)}</Text>
          </Pressable>
          <Pressable onPress={() => setShowEndPicker(true)} style={[styles.input, { flex: 1, justifyContent: "center" }]}>
            <Text>Ende: {formatDate(endDate)}</Text>
          </Pressable>
        </View>
        {showStartPicker && (
          <DateTimePicker value={startDate} mode="date" display={Platform.OS === "ios" ? "spinner" : "default"} onChange={onChangeStart} />
        )}
        {showEndPicker && (
          <DateTimePicker value={endDate} mode="date" display={Platform.OS === "ios" ? "spinner" : "default"} onChange={onChangeEnd} />
        )}
        <View style={{ flexDirection: "row", gap: 12 }}>
          <TextInput placeholder="Von (HH:MM)" value={timeFrom} onChangeText={setTimeFrom} style={[styles.input, { flex: 1 }]} />
          <TextInput placeholder="Bis (HH:MM)" value={timeTo} onChangeText={setTimeTo} style={[styles.input, { flex: 1 }]} />
        </View>
        <TextInput placeholder="Notizen" value={notes} onChangeText={setNotes} style={[styles.input, { height: 100 }]} multiline />
        <Pressable onPress={onSubmit} style={styles.button}>
          <Text style={styles.buttonText}>Senden</Text>
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

