import { View, Text, ScrollView, TextInput, Pressable, Switch, Alert } from "react-native";
import { Container } from "@/components/container";
import { i18n } from "@/i18n";
import { router } from "expo-router";
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@SpringEin/backend/convex/_generated/api";
import { Ionicons } from "@expo/vector-icons";

const AGE_GROUPS = [
  { key: "0-1", label: "0-1 Jahre" },
  { key: "1-3", label: "1-3 Jahre" },
  { key: "3-6", label: "3-6 Jahre" },
] as const;

export default function PersonProfile() {
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    postalCode: "",
    phone: "",
    maxTravelDistance: "10",
    ageGroups: [] as Array<"0-1" | "1-3" | "3-6">,
    sharePhone: false,
    shareEmail: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createProfile = useMutation(api.personProfiles.create);

  const handleAgeGroupToggle = (ageGroup: "0-1" | "1-3" | "3-6") => {
    setFormData(prev => ({
      ...prev,
      ageGroups: prev.ageGroups.includes(ageGroup)
        ? prev.ageGroups.filter(ag => ag !== ageGroup)
        : [...prev.ageGroups, ageGroup]
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.postalCode.trim()) {
      Alert.alert("Fehler", "Bitte füllen Sie alle Pflichtfelder aus.");
      return;
    }

    if (formData.ageGroups.length === 0) {
      Alert.alert("Fehler", "Bitte wählen Sie mindestens eine Altersgruppe aus.");
      return;
    }

    setIsSubmitting(true);
    try {
      await createProfile({
        name: formData.name,
        bio: formData.bio || undefined,
        postalCode: formData.postalCode,
        phone: formData.phone || undefined,
        maxTravelDistance: parseInt(formData.maxTravelDistance),
        ageGroups: formData.ageGroups,
        sharePhone: formData.sharePhone,
        shareEmail: formData.shareEmail,
      });

      router.replace("/(drawer)");
    } catch (error) {
      Alert.alert("Fehler", "Profil konnte nicht erstellt werden.");
      console.error("Error creating profile:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container>
      <ScrollView className="flex-1 p-6">
        <View className="mb-6">
          <Text className="text-3xl font-bold text-foreground mb-2">
            {i18n.t("profile.createProfile")}
          </Text>
          <Text className="text-lg text-muted-foreground">
            Erstellen Sie Ihr Tagesmutter/Tagesvater Profil
          </Text>
        </View>

        {/* Name - Required */}
        <View className="mb-4">
          <Text className="text-base font-medium text-foreground mb-2">
            {i18n.t("profile.name")} *
          </Text>
          <TextInput
            value={formData.name}
            onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
            placeholder="Ihr vollständiger Name"
            className="border-2 border-gray-200 rounded-xl p-4 bg-white text-foreground"
          />
        </View>

        {/* Bio */}
        <View className="mb-4">
          <Text className="text-base font-medium text-foreground mb-2">
            {i18n.t("profile.bio")}
          </Text>
          <TextInput
            value={formData.bio}
            onChangeText={(text) => setFormData(prev => ({ ...prev, bio: text }))}
            placeholder="Erzählen Sie etwas über sich..."
            multiline
            numberOfLines={4}
            className="border-2 border-gray-200 rounded-xl p-4 bg-white text-foreground"
            textAlignVertical="top"
          />
        </View>

        {/* Postal Code - Required */}
        <View className="mb-4">
          <Text className="text-base font-medium text-foreground mb-2">
            {i18n.t("profile.postalCode")} *
          </Text>
          <TextInput
            value={formData.postalCode}
            onChangeText={(text) => setFormData(prev => ({ ...prev, postalCode: text }))}
            placeholder="12345"
            keyboardType="numeric"
            maxLength={5}
            className="border-2 border-gray-200 rounded-xl p-4 bg-white text-foreground"
          />
        </View>

        {/* Phone */}
        <View className="mb-4">
          <Text className="text-base font-medium text-foreground mb-2">
            {i18n.t("profile.phone")}
          </Text>
          <TextInput
            value={formData.phone}
            onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}
            placeholder="+49 123 456789"
            keyboardType="phone-pad"
            className="border-2 border-gray-200 rounded-xl p-4 bg-white text-foreground"
          />
        </View>

        {/* Max Travel Distance */}
        <View className="mb-4">
          <Text className="text-base font-medium text-foreground mb-2">
            {i18n.t("profile.maxTravelDistance")}
          </Text>
          <TextInput
            value={formData.maxTravelDistance}
            onChangeText={(text) => setFormData(prev => ({ ...prev, maxTravelDistance: text }))}
            placeholder="10"
            keyboardType="numeric"
            className="border-2 border-gray-200 rounded-xl p-4 bg-white text-foreground"
          />
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

        {/* Privacy Settings */}
        <View className="mb-6">
          <Text className="text-base font-medium text-foreground mb-4">
            Datenschutz-Einstellungen
          </Text>
          
          <View className="flex-row items-center justify-between p-4 bg-gray-50 rounded-xl mb-2">
            <Text className="text-base text-foreground flex-1">
              {i18n.t("profile.sharePhone")}
            </Text>
            <Switch
              value={formData.sharePhone}
              onValueChange={(value) => setFormData(prev => ({ ...prev, sharePhone: value }))}
            />
          </View>

          <View className="flex-row items-center justify-between p-4 bg-gray-50 rounded-xl">
            <Text className="text-base text-foreground flex-1">
              {i18n.t("profile.shareEmail")}
            </Text>
            <Switch
              value={formData.shareEmail}
              onValueChange={(value) => setFormData(prev => ({ ...prev, shareEmail: value }))}
            />
          </View>
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
            {isSubmitting ? "Wird erstellt..." : "Profil erstellen"}
          </Text>
        </Pressable>
      </ScrollView>
    </Container>
  );
}