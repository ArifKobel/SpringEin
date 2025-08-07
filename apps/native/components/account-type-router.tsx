import { useQuery } from "convex/react";
import { api } from "@SpringEin/backend/convex/_generated/api";
import { Redirect } from "expo-router";
import { View, Text } from "react-native";
import { Container } from "./container";

// Updated router to new roles/profiles model.
// Redirect priority:
// - If active role is provider → /(provider)/home
// - If active role is exchange → /(exchange)/home
// - Else → /hub to choose or create profiles
export const AccountTypeRouter = () => {
  const settings = useQuery(api.profiles.mySettings);
  const providers = useQuery(api.profiles.myProviderProfiles);
  const exchanges = useQuery(api.profiles.myExchangeProfiles);

  if (settings === undefined || providers === undefined || exchanges === undefined) {
    return (
      <Container>
        <View className="flex-1 justify-center items-center">
          <Text className="text-lg text-muted-foreground">Laden...</Text>
        </View>
      </Container>
    );
  }

  if (settings?.activeRole === "provider") {
    return <Redirect href="/(provider)/home" />;
  }
  if (settings?.activeRole === "exchange") {
    return <Redirect href="/(exchange)/home" />;
  }

  return <Redirect href="/hub" />;
};