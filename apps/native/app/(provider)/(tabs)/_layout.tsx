import { Stack, Tabs } from "expo-router";
import { useQuery } from "convex/react";
import { api } from "@SpringEin/backend/convex/_generated/api";
import { Redirect, usePathname } from "expo-router";
import { BrandLogo } from "@/components/header-button";
import { Ionicons } from "@expo/vector-icons";

export default function ProviderTabs() {
  const myProviders = useQuery(api.profiles.myProviderProfiles) ?? [];
  const path = usePathname();
  if (!myProviders.length && !path.includes("profile/new") && !path.includes("hub") && !path.includes("profile/edit")) {
    return <Redirect href="/(provider)/profile/new" />;
  }
  return (
    <Tabs screenOptions={{ headerTitle: () => <BrandLogo /> }}>
      <Tabs.Screen
        name="home"
        options={{
          title: "Übersicht",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="inbox"
        options={{
          title: "Eingang",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="mail-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings/index"
        options={{
          title: "Einstellungen",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />

    </Tabs>
  );
}

