import { View, Text, ScrollView, TextInput, Pressable, Switch, Alert } from "react-native";
import { Container } from "@/components/container";
import { i18n } from "@/i18n";
import { router } from "expo-router";
import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@SpringEin/backend/convex/_generated/api";
import { Ionicons } from "@expo/vector-icons";

const AGE_GROUPS = [
  { key: "0-1", label: "0-1 Jahre" },
  { key: "1-3", label: "1-3 Jahre" },
  { key: "3-6", label: "3-6 Jahre" },
] as const;

const DAYS_OF_WEEK = [
  { key: 1, label: "Montag" },
  { key: 2, label: "Dienstag" },
  { key: 3, label: "Mittwoch" },
  { key: 4, label: "Donnerstag" },
  { key: 5, label: "Freitag" },
  { key: 6, label: "Samstag" },
  { key: 0, label: "Sonntag" },
] as const;

export default function CreateJob() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "substitute" as "substitute" | "longterm",
    startDate: "",
    endDate: "",
    daysOfWeek: [] as number[],
    startTime: "",
    endTime: "",
    ageGroups: [] as Array<"0-1" | "1-3" | "3-6">,
    maxPositions: "1",
    hasExpiration: false,
    expirationDays: "30",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const account = useQuery(api.accounts.getCurrent);
  const createJob = useMutation(api.jobPostings.create);

  // Check if user has team account
  if (account && account.accountType !== "team") {
    return (
      <Container>
        <View className="flex-1 justify-center items-center p-6">
          <Ionicons name="business-outline" size={64} color="#ef4444" />
          <Text className="text-xl font-semibold text-foreground mt-4 text-center">
            Nur Team-Accounts können Stellenanzeigen erstellen
          </Text>
          <Pressable
            onPress={() => router.back()}
            className="bg-primary rounded-xl p-3 mt-4"
          >
            <Text className="text-primary-foreground font-medium">Zurück</Text>
          </Pressable>
        </View>
      </Container>
    );
  }

  const handleAgeGroupToggle = (ageGroup: "0-1" | "1-3" | "3-6") => {
    setFormData(prev => ({
      ...prev,
      ageGroups: prev.ageGroups.includes(ageGroup)
        ? prev.ageGroups.filter(ag => ag !== ageGroup)
        : [...prev.ageGroups, ageGroup]
    }));
  };

  const handleDayToggle = (day: number) => {
    setFormData(prev => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek.includes(day)
        ? prev.daysOfWeek.filter(d => d !== day)
        : [...prev.daysOfWeek, day]
    }));
  };

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.startTime.trim() || !formData.endTime.trim()) {
      Alert.alert("Fehler", "Bitte füllen Sie alle Pflichtfelder aus.");
      return;
    }

    if (formData.ageGroups.length === 0) {
      Alert.alert("Fehler", "Bitte wählen Sie mindestens eine Altersgruppe aus.");
      return;
    }

    if (parseInt(formData.maxPositions) < 1) {
      Alert.alert("Fehler", "Mindestens eine Position muss verfügbar sein.");
      return;
    }

    setIsSubmitting(true);
    try {
      const expiresAt = formData.hasExpiration 
        ? Date.now() + (parseInt(formData.expirationDays) * 24 * 60 * 60 * 1000)
        : undefined;

      await createJob({
        title: formData.title,
        description: formData.description || undefined,
        type: formData.type,
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined,
        daysOfWeek: formData.daysOfWeek.length > 0 ? formData.daysOfWeek : undefined,
        startTime: formData.startTime,
        endTime: formData.endTime,
        ageGroups: formData.ageGroups,
        maxPositions: parseInt(formData.maxPositions),
        expiresAt,
      });

      Alert.alert("Erfolg", "Stellenanzeige wurde erstellt!", [
        { text: "OK", onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert("Fehler", "Stellenanzeige konnte nicht erstellt werden.");
      console.error("Error creating job:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container>
      <ScrollView className="flex-1 p-6">
        <View className="mb-6">
          <Text className="text-3xl font-bold text-foreground mb-2">
            {i18n.t("jobs.createJob")}
          </Text>
          <Text className="text-lg text-muted-foreground">
            Erstellen Sie eine neue Stellenanzeige
          </Text>
        </View>

        {/* Title - Required */}
        <View className="mb-4">
          <Text className="text-base font-medium text-foreground mb-2">
            {i18n.t("jobs.jobTitle")} *
          </Text>
          <TextInput
            value={formData.title}
            onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
            placeholder="z.B. Vertretung für Gruppe 3-6 Jahre"
            className="border-2 border-gray-200 rounded-xl p-4 bg-white text-foreground"
          />
        </View>

        {/* Description */}
        <View className="mb-4">
          <Text className="text-base font-medium text-foreground mb-2">
            {i18n.t("jobs.jobDescription")}
          </Text>
          <TextInput
            value={formData.description}
            onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
            placeholder="Beschreibung der Stelle, Anforderungen, etc..."
            multiline
            numberOfLines={4}
            className="border-2 border-gray-200 rounded-xl p-4 bg-white text-foreground"
            textAlignVertical="top"
          />
        </View>

        {/* Job Type */}
        <View className="mb-4">
          <Text className="text-base font-medium text-foreground mb-2">
            {i18n.t("jobs.jobType")} *
          </Text>
          <View className="flex-row space-x-2">
            <Pressable
              onPress={() => setFormData(prev => ({ ...prev, type: "substitute" }))}
              className={`flex-1 p-4 rounded-xl border-2 ${
                formData.type === "substitute"
                  ? "border-primary bg-primary/5"
                  : "border-gray-200 bg-white"
              }`}
            >
              <Text className={`text-center font-medium ${
                formData.type === "substitute" ? "text-primary" : "text-foreground"
              }`}>
                {i18n.t("jobs.substitute")}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setFormData(prev => ({ ...prev, type: "longterm" }))}
              className={`flex-1 p-4 rounded-xl border-2 ${
                formData.type === "longterm"
                  ? "border-primary bg-primary/5"
                  : "border-gray-200 bg-white"
              }`}
            >
              <Text className={`text-center font-medium ${
                formData.type === "longterm" ? "text-primary" : "text-foreground"
              }`}>
                {i18n.t("jobs.longterm")}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Date Range (for longterm jobs) */}
        {formData.type === "longterm" && (
          <View className="mb-4">
            <Text className="text-base font-medium text-foreground mb-2">
              Zeitraum
            </Text>
            <View className="flex-row space-x-2">
              <View className="flex-1">
                <Text className="text-sm text-muted-foreground mb-1">
                  {i18n.t("jobs.startDate")}
                </Text>
                <TextInput
                  value={formData.startDate}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, startDate: text }))}
                  placeholder="TT.MM.JJJJ"
                  className="border-2 border-gray-200 rounded-xl p-3 bg-white text-foreground"
                />
              </View>
              <View className="flex-1">
                <Text className="text-sm text-muted-foreground mb-1">
                  {i18n.t("jobs.endDate")}
                </Text>
                <TextInput
                  value={formData.endDate}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, endDate: text }))}
                  placeholder="TT.MM.JJJJ"
                  className="border-2 border-gray-200 rounded-xl p-3 bg-white text-foreground"
                />
              </View>
            </View>
          </View>
        )}

        {/* Days of Week (for longterm jobs) */}
        {formData.type === "longterm" && (
          <View className="mb-4">
            <Text className="text-base font-medium text-foreground mb-2">
              Wochentage
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {DAYS_OF_WEEK.map((day) => (
                <Pressable
                  key={day.key}
                  onPress={() => handleDayToggle(day.key)}
                  className={`px-3 py-2 rounded-lg border ${
                    formData.daysOfWeek.includes(day.key)
                      ? "border-primary bg-primary/10"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <Text className={`text-sm ${
                    formData.daysOfWeek.includes(day.key)
                      ? "text-primary font-medium"
                      : "text-foreground"
                  }`}>
                    {day.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* Time Range */}
        <View className="mb-4">
          <Text className="text-base font-medium text-foreground mb-2">
            Arbeitszeiten *
          </Text>
          <View className="flex-row space-x-2">
            <View className="flex-1">
              <Text className="text-sm text-muted-foreground mb-1">
                {i18n.t("jobs.startTime")}
              </Text>
              <TextInput
                value={formData.startTime}
                onChangeText={(text) => setFormData(prev => ({ ...prev, startTime: text }))}
                placeholder="08:00"
                className="border-2 border-gray-200 rounded-xl p-3 bg-white text-foreground"
              />
            </View>
            <View className="flex-1">
              <Text className="text-sm text-muted-foreground mb-1">
                {i18n.t("jobs.endTime")}
              </Text>
              <TextInput
                value={formData.endTime}
                onChangeText={(text) => setFormData(prev => ({ ...prev, endTime: text }))}
                placeholder="16:00"
                className="border-2 border-gray-200 rounded-xl p-3 bg-white text-foreground"
              />
            </View>
          </View>
        </View>

        {/* Age Groups */}
        <View className="mb-4">
          <Text className="text-base font-medium text-foreground mb-2">
            {i18n.t("profile.ageGroups")} *
          </Text>
          <View className="space-y-2">
            {AGE_GROUPS.map((group) => (
              <Pressable
                key={group.key}
                onPress={() => handleAgeGroupToggle(group.key)}
                className={`flex-row items-center p-4 rounded-xl border-2 ${
                  formData.ageGroups.includes(group.key)
                    ? "border-primary bg-primary/5"
                    : "border-gray-200 bg-white"
                }`}
              >
                <View className={`w-6 h-6 rounded-full border-2 mr-3 items-center justify-center ${
                  formData.ageGroups.includes(group.key)
                    ? "border-primary bg-primary"
                    : "border-gray-300"
                }`}>
                  {formData.ageGroups.includes(group.key) && (
                    <Ionicons name="checkmark" size={16} color="white" />
                  )}
                </View>
                <Text className={`text-base ${
                  formData.ageGroups.includes(group.key)
                    ? "text-primary font-medium"
                    : "text-foreground"
                }`}>
                  {group.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Max Positions */}
        <View className="mb-4">
          <Text className="text-base font-medium text-foreground mb-2">
            {i18n.t("jobs.maxPositions")} *
          </Text>
          <TextInput
            value={formData.maxPositions}
            onChangeText={(text) => setFormData(prev => ({ ...prev, maxPositions: text }))}
            placeholder="1"
            keyboardType="numeric"
            className="border-2 border-gray-200 rounded-xl p-4 bg-white text-foreground"
          />
        </View>

        {/* Expiration */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between p-4 bg-gray-50 rounded-xl mb-2">
            <Text className="text-base text-foreground flex-1">
              Anzeige automatisch ablaufen lassen
            </Text>
            <Switch
              value={formData.hasExpiration}
              onValueChange={(value) => setFormData(prev => ({ ...prev, hasExpiration: value }))}
            />
          </View>

          {formData.hasExpiration && (
            <TextInput
              value={formData.expirationDays}
              onChangeText={(text) => setFormData(prev => ({ ...prev, expirationDays: text }))}
              placeholder="30"
              keyboardType="numeric"
              className="border-2 border-gray-200 rounded-xl p-4 bg-white text-foreground"
            />
          )}
        </View>

        {/* Submit Button */}
        <Pressable
          onPress={handleSubmit}
          disabled={isSubmitting}
          className={`rounded-xl p-4 mb-6 ${
            isSubmitting
              ? "bg-gray-300"
              : "bg-primary active:bg-primary/90"
          }`}
        >
          <Text className={`text-center text-lg font-semibold ${
            isSubmitting ? "text-gray-500" : "text-primary-foreground"
          }`}>
            {isSubmitting ? "Wird erstellt..." : "Stellenanzeige erstellen"}
          </Text>
        </Pressable>
      </ScrollView>
    </Container>
  );
}