import { useEffect, useState } from "react";
import { View, Text, TextInput, ScrollView, Pressable, Alert, Platform } from "react-native";
import { useMutation, useQuery } from "convex/react";
import { api } from "@SpringEin/backend/convex/_generated/api";
import { Container } from "@/components/container";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { router } from "expo-router";

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
  const [showFromTimePicker, setShowFromTimePicker] = useState(false);
  const [showToTimePicker, setShowToTimePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (exchangeProfiles.length && !exchangeProfileId) {
      setExchangeProfileId(exchangeProfiles[0]._id);
    }
  }, [exchangeProfiles]);

  const onSubmit = async () => {
    try {
      if (!exchangeProfileId) return Alert.alert("Fehler", "Bitte ein Profil auswählen.");
      if (!startDate || !endDate) return Alert.alert("Fehler", "Start- und Enddatum sind erforderlich.");
      if (ageGroups.length === 0) return Alert.alert("Fehler", "Bitte mindestens eine Altersgruppe auswählen.");
      if (endDate < startDate) return Alert.alert("Fehler", "Enddatum darf nicht vor dem Startdatum liegen.");
      if (!isValidTime(timeFrom) || !isValidTime(timeTo)) return Alert.alert("Fehler", "Bitte gültige Zeiten (HH:MM) angeben.");
      if (timeFrom >= timeTo) return Alert.alert("Fehler", "Die Zeit 'Von' muss vor 'Bis' liegen.");

      setIsSubmitting(true);
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
      router.replace("/(exchange)/requests");
    } catch (e) {
      Alert.alert("Fehler", String(e));
    }
    finally {
      setIsSubmitting(false);
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
  const isValidTime = (t: string) => /^\d{2}:\d{2}$/.test(t);

  const onChangeFromTime = (_: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS !== "ios") setShowFromTimePicker(false);
    if (selected) setTimeFrom(formatTime(selected));
  };
  const onChangeToTime = (_: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS !== "ios") setShowToTimePicker(false);
    if (selected) setTimeTo(formatTime(selected));
  };

  return (
    <Container>
      <ScrollView>
        <View className="p-4">
          <Text className="text-2xl font-bold mb-3">Vertretung anfragen</Text>
          <Text className="mb-2">Kindertagesstätte-Profil auswählen</Text>
          <View className="flex-row flex-wrap gap-2 mb-3">
            {exchangeProfiles.map((p) => (
              <Pressable
                key={p._id}
                onPress={() => setExchangeProfileId(p._id)}
                className={`px-3 py-2 rounded-full border ${exchangeProfileId === p._id ? "bg-gray-900 border-gray-900" : "border-gray-300"}`}
              >
                <Text className={`${exchangeProfileId === p._id ? "text-white" : "text-gray-900"}`}>{p.facilityName}</Text>
              </Pressable>
            ))}
          </View>
          <Text className="font-semibold mb-2">Altersgruppen</Text>
          <View className="flex-row flex-wrap gap-2 mb-3">
            {AGE_GROUP_PRESETS.map((g) => (
              <Pressable key={g} onPress={() => setAgeGroups((prev) => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g])} className={`px-3 py-2 rounded-full border ${ageGroups.includes(g) ? "bg-gray-900 border-gray-900" : "border-gray-300"}`}>
                <Text className={`${ageGroups.includes(g) ? "text-white" : "text-gray-900"}`}>{g}</Text>
              </Pressable>
            ))}
          </View>
          <Text className="font-semibold mb-2">Zeitraum</Text>
          <View className="flex-row gap-3 mb-3">
            <Pressable onPress={() => setShowStartPicker(true)} className="border border-gray-300 rounded-lg p-3 flex-1 justify-center">
              <Text>Start: {formatDate(startDate)}</Text>
            </Pressable>
            <Pressable onPress={() => setShowEndPicker(true)} className="border border-gray-300 rounded-lg p-3 flex-1 justify-center">
              <Text>Ende: {formatDate(endDate)}</Text>
            </Pressable>
          </View>
        {showStartPicker && (
          <DateTimePicker value={startDate} mode="date" display={Platform.OS === "ios" ? "spinner" : "default"} onChange={onChangeStart} />
        )}
        {showEndPicker && (
          <DateTimePicker value={endDate} mode="date" display={Platform.OS === "ios" ? "spinner" : "default"} onChange={onChangeEnd} />
        )}
          <Text className="font-semibold mb-2">Uhrzeit</Text>
          <View className="flex-row gap-3 mb-3">
            <Pressable onPress={() => setShowFromTimePicker(true)} className="border border-gray-300 rounded-lg p-3 flex-1 justify-center">
              <Text>Von: {timeFrom}</Text>
            </Pressable>
            <Pressable onPress={() => setShowToTimePicker(true)} className="border border-gray-300 rounded-lg p-3 flex-1 justify-center">
              <Text>Bis: {timeTo}</Text>
            </Pressable>
          </View>
        {showFromTimePicker && (
          <DateTimePicker value={parseTimeToDate(timeFrom)} mode="time" display={Platform.OS === "ios" ? "spinner" : "default"} onChange={onChangeFromTime} />
        )}
        {showToTimePicker && (
          <DateTimePicker value={parseTimeToDate(timeTo)} mode="time" display={Platform.OS === "ios" ? "spinner" : "default"} onChange={onChangeToTime} />
        )}
          <TextInput placeholder="Notizen" value={notes} onChangeText={setNotes} className="border border-gray-300 rounded-lg p-3 h-24" multiline />
          <Pressable disabled={isSubmitting} onPress={onSubmit} className={`bg-gray-900 py-3 rounded-lg items-center mt-2 ${isSubmitting ? "opacity-60" : ""}`}>
            <Text className="text-white font-bold">Senden</Text>
          </Pressable>
        </View>
      </ScrollView>
    </Container>
  );
}

 

