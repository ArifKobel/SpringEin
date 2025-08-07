import { View, Text, ScrollView, TextInput, Pressable, Alert } from "react-native";
import { Container } from "@/components/container";
import { i18n } from "@/i18n";
import { router } from "expo-router";
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@SpringEin/backend/convex/_generated/api";

export default function TeamProfile() {
  const [formData, setFormData] = useState({
    facilityName: "",
    description: "",
    address: "",
    postalCode: "",
    phone: "",
    contactPersonName: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createProfile = useMutation(api.teamProfiles.create);

  const handleSubmit = async () => {
    if (!formData.facilityName.trim() || !formData.address.trim() || 
        !formData.postalCode.trim() || !formData.phone.trim() || 
        !formData.contactPersonName.trim()) {
      Alert.alert("Fehler", "Bitte füllen Sie alle Pflichtfelder aus.");
      return;
    }

    setIsSubmitting(true);
    try {
      await createProfile({
        facilityName: formData.facilityName,
        description: formData.description || undefined,
        address: formData.address,
        postalCode: formData.postalCode,
        phone: formData.phone,
        contactPersonName: formData.contactPersonName,
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
            Erstellen Sie Ihr Tagesstätten-Profil
          </Text>
        </View>

        {/* Facility Name - Required */}
        <View className="mb-4">
          <Text className="text-base font-medium text-foreground mb-2">
            {i18n.t("profile.facilityName")} *
          </Text>
          <TextInput
            value={formData.facilityName}
            onChangeText={(text) => setFormData(prev => ({ ...prev, facilityName: text }))}
            placeholder="Name Ihrer Tagesstätte"
            className="border-2 border-gray-200 rounded-xl p-4 bg-white text-foreground"
          />
        </View>

        {/* Description */}
        <View className="mb-4">
          <Text className="text-base font-medium text-foreground mb-2">
            {i18n.t("profile.description")}
          </Text>
          <TextInput
            value={formData.description}
            onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
            placeholder="Beschreibung Ihrer Einrichtung..."
            multiline
            numberOfLines={4}
            className="border-2 border-gray-200 rounded-xl p-4 bg-white text-foreground"
            textAlignVertical="top"
          />
        </View>

        {/* Address - Required */}
        <View className="mb-4">
          <Text className="text-base font-medium text-foreground mb-2">
            {i18n.t("profile.address")} *
          </Text>
          <TextInput
            value={formData.address}
            onChangeText={(text) => setFormData(prev => ({ ...prev, address: text }))}
            placeholder="Straße, Hausnummer, Stadt"
            className="border-2 border-gray-200 rounded-xl p-4 bg-white text-foreground"
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

        {/* Phone - Required */}
        <View className="mb-4">
          <Text className="text-base font-medium text-foreground mb-2">
            {i18n.t("profile.phone")} *
          </Text>
          <TextInput
            value={formData.phone}
            onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}
            placeholder="+49 123 456789"
            keyboardType="phone-pad"
            className="border-2 border-gray-200 rounded-xl p-4 bg-white text-foreground"
          />
        </View>

        {/* Contact Person Name - Required */}
        <View className="mb-6">
          <Text className="text-base font-medium text-foreground mb-2">
            {i18n.t("profile.contactPersonName")} *
          </Text>
          <TextInput
            value={formData.contactPersonName}
            onChangeText={(text) => setFormData(prev => ({ ...prev, contactPersonName: text }))}
            placeholder="Name der Ansprechperson"
            className="border-2 border-gray-200 rounded-xl p-4 bg-white text-foreground"
          />
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