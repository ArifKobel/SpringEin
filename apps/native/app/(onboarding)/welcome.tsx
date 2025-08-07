import { View, Text, Pressable } from "react-native";
import { Container } from "@/components/container";
import { i18n } from "@/i18n";
import { router } from "expo-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "@SpringEin/backend/convex/_generated/api";
import { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";

export default function Welcome() {
  const [isCreating, setIsCreating] = useState(false);
  
  const account = useQuery(api.accounts.getCurrent);
  const createAccount = useMutation(api.accounts.create);

  const handleAccountTypeSelect = async (type: "person" | "team") => {
    setIsCreating(true);
    try {
      await createAccount({ accountType: type });
      
      // Navigate to appropriate profile creation
      if (type === "person") {
        router.push("/(onboarding)/person-profile");
      } else {
        router.push("/(onboarding)/team-profile");
      }
    } catch (error) {
      console.error("Error creating account:", error);
    } finally {
      setIsCreating(false);
    }
  };

  // If account already exists, redirect to appropriate profile creation
  useEffect(() => {
    if (account) {
      if (account.accountType === "person") {
        router.push("/(onboarding)/person-profile");
      } else {
        router.push("/(onboarding)/team-profile");
      }
    }
  }, [account]);

  // If account exists, show loading or redirect
  if (account) {
    return (
      <Container>
        <View className="flex-1 justify-center items-center p-6">
          <Text className="text-lg text-muted-foreground">
            Weiterleitung zum Profil...
          </Text>
        </View>
      </Container>
    );
  }

  return (
    <Container>
      <View className="flex-1 p-6 justify-center">
        <View className="mb-8">
          <Text className="text-4xl font-bold text-foreground text-center mb-2">
            {i18n.t("onboarding.welcome")}
          </Text>
          <Text className="text-lg text-muted-foreground text-center mb-8">
            {i18n.t("onboarding.subtitle")}
          </Text>
          <Text className="text-2xl font-semibold text-foreground text-center mb-6">
            {i18n.t("auth.chooseAccountType")}
          </Text>
          <Text className="text-sm text-muted-foreground text-center mb-6">
            Sie haben sich erfolgreich registriert. Bitte wählen Sie Ihren Account-Typ:
          </Text>
        </View>

        <View className="space-y-4 mb-8">
          {/* Person Account Option */}
          <Pressable
            onPress={() => handleAccountTypeSelect("person")}
            disabled={isCreating}
            className="border-2 border-gray-200 bg-white rounded-xl p-6 active:bg-gray-50"
          >
            <View className="flex-row items-center mb-3">
              <View className="w-12 h-12 rounded-full items-center justify-center mr-4 bg-blue-100">
                <Ionicons name="person" size={24} color="#3b82f6" />
              </View>
              <View className="flex-1">
                <Text className="text-xl font-semibold text-foreground">
                  {i18n.t("auth.personAccount")}
                </Text>
              </View>
              <Ionicons name="arrow-forward" size={24} color="#666" />
            </View>
            <Text className="text-muted-foreground ml-16">
              {i18n.t("auth.personDescription")}
            </Text>
          </Pressable>

          {/* Team Account Option */}
          <Pressable
            onPress={() => handleAccountTypeSelect("team")}
            disabled={isCreating}
            className="border-2 border-gray-200 bg-white rounded-xl p-6 active:bg-gray-50"
          >
            <View className="flex-row items-center mb-3">
              <View className="w-12 h-12 rounded-full items-center justify-center mr-4 bg-green-100">
                <Ionicons name="business" size={24} color="#10b981" />
              </View>
              <View className="flex-1">
                <Text className="text-xl font-semibold text-foreground">
                  {i18n.t("auth.teamAccount")}
                </Text>
              </View>
              <Ionicons name="arrow-forward" size={24} color="#666" />
            </View>
            <Text className="text-muted-foreground ml-16">
              {i18n.t("auth.teamDescription")}
            </Text>
          </Pressable>
        </View>

        {isCreating && (
          <View className="items-center">
            <Text className="text-muted-foreground">
              {i18n.t("onboarding.creating")}
            </Text>
          </View>
        )}
      </View>
    </Container>
  );
}