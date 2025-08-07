import { useQuery } from "convex/react";
import { api } from "@SpringEin/backend/convex/_generated/api";
import { Redirect } from "expo-router";
import { View, Text } from "react-native";
import { Container } from "./container";

export const AccountTypeRouter = () => {
  const account = useQuery(api.accounts.getCurrent);
  const personProfile = useQuery(api.personProfiles.getCurrent);
  const teamProfile = useQuery(api.teamProfiles.getCurrent);

  // Loading state
  if (account === undefined || personProfile === undefined || teamProfile === undefined) {
    return (
      <Container>
        <View className="flex-1 justify-center items-center">
          <Text className="text-lg text-muted-foreground">Laden...</Text>
        </View>
      </Container>
    );
  }

  // No account found - redirect to onboarding welcome (only if user came from registration without account type)
  if (!account) {
    return <Redirect href="/(onboarding)/welcome" />;
  }

  // Account exists but no profile - redirect to profile creation
  if (account.accountType === "person" && !personProfile) {
    return <Redirect href="/(onboarding)/person-profile" />;
  }

  if (account.accountType === "team" && !teamProfile) {
    return <Redirect href="/(onboarding)/team-profile" />;
  }

  // Account and profile exist - redirect to main app
  return <Redirect href="/(drawer)" />;
};