import { View, Text, Pressable } from "react-native";
import { Container } from "@/components/container";
import { i18n } from "@/i18n";
import { router } from "expo-router";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";

export default function AccountType() {
  const [selectedType, setSelectedType] = useState<"person" | "team" | null>(null);

  const handleContinue = () => {
    if (selectedType) {
      // Store the selected account type and continue to registration
      router.push({
        pathname: "/(auth)/register",
        params: { accountType: selectedType }
      });
    }
  };

  return (
    <Container>
      <View className="flex-1 p-6 justify-center">
        <View className="mb-8">
          <Text className="text-4xl font-bold text-foreground text-center mb-2">
            SpringEin
          </Text>
          <Text className="text-lg text-muted-foreground text-center mb-8">
            {i18n.t("home.subtitle")}
          </Text>
          <Text className="text-2xl font-semibold text-foreground text-center mb-6">
            {i18n.t("auth.chooseAccountType")}
          </Text>
        </View>

        <View className="space-y-4 mb-8">
          {/* Person Account Option */}
          <Pressable
            onPress={() => setSelectedType("person")}
            className={`border-2 rounded-xl p-6 ${
              selectedType === "person" 
                ? "border-primary bg-primary/5" 
                : "border-gray-200 bg-white"
            }`}
          >
            <View className="flex-row items-center mb-3">
              <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${
                selectedType === "person" ? "bg-primary" : "bg-gray-100"
              }`}>
                <Ionicons 
                  name="person" 
                  size={24} 
                  color={selectedType === "person" ? "white" : "#666"} 
                />
              </View>
              <View className="flex-1">
                <Text className={`text-xl font-semibold ${
                  selectedType === "person" ? "text-primary" : "text-foreground"
                }`}>
                  {i18n.t("auth.personAccount")}
                </Text>
              </View>
              {selectedType === "person" && (
                <Ionicons name="checkmark-circle" size={24} color="#3b82f6" />
              )}
            </View>
            <Text className="text-muted-foreground ml-16">
              {i18n.t("auth.personDescription")}
            </Text>
          </Pressable>

          {/* Team Account Option */}
          <Pressable
            onPress={() => setSelectedType("team")}
            className={`border-2 rounded-xl p-6 ${
              selectedType === "team" 
                ? "border-primary bg-primary/5" 
                : "border-gray-200 bg-white"
            }`}
          >
            <View className="flex-row items-center mb-3">
              <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${
                selectedType === "team" ? "bg-primary" : "bg-gray-100"
              }`}>
                <Ionicons 
                  name="business" 
                  size={24} 
                  color={selectedType === "team" ? "white" : "#666"} 
                />
              </View>
              <View className="flex-1">
                <Text className={`text-xl font-semibold ${
                  selectedType === "team" ? "text-primary" : "text-foreground"
                }`}>
                  {i18n.t("auth.teamAccount")}
                </Text>
              </View>
              {selectedType === "team" && (
                <Ionicons name="checkmark-circle" size={24} color="#3b82f6" />
              )}
            </View>
            <Text className="text-muted-foreground ml-16">
              {i18n.t("auth.teamDescription")}
            </Text>
          </Pressable>
        </View>

        {/* Continue Button */}
        <Pressable 
          onPress={handleContinue}
          disabled={!selectedType}
          className={`rounded-xl p-4 ${
            selectedType 
              ? "bg-primary active:bg-primary/90" 
              : "bg-gray-200"
          }`}
        >
          <Text className={`text-center text-lg font-semibold ${
            selectedType ? "text-primary-foreground" : "text-gray-400"
          }`}>
            {i18n.t("auth.continue")}
          </Text>
        </Pressable>
      </View>
    </Container>
  );
}