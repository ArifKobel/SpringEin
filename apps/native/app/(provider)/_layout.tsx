import { Stack } from "expo-router";
import { useQuery } from "convex/react";
import { api } from "@SpringEin/backend/convex/_generated/api";
import { Redirect, usePathname } from "expo-router";

export default function ProviderTabs() {
  const myProviders = useQuery(api.profiles.myProviderProfiles) ?? [];
  const path = usePathname();
  if (!myProviders.length && !path.includes("profile/new") && !path.includes("hub") && !path.includes("profile/edit")) {
    return <Redirect href="/(provider)/profile/new" />;
  }
  return (
    <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="profile/edit" options={{ title: "Profil bearbeiten", presentation: "modal" }} />
        <Stack.Screen name="hub" options={{ title: "Profil wechseln", presentation: "modal" }} />
    </Stack>
  );
}

