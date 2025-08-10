import { router, Tabs } from "expo-router";
import { api } from "@SpringEin/backend/convex/_generated/api";
import { useQuery } from "convex/react";
import { Redirect, usePathname } from "expo-router";
import { BrandLogo } from "@/components/header-button";
import { Ionicons } from "@expo/vector-icons";

export default function ExchangeTabs() {
  const profiles = useQuery(api.profiles.myExchangeProfiles);
  const path = usePathname();
  if (profiles === undefined) {
    return null;
  }
  if (!profiles.length && !path.includes("profile/new") && !path.includes("hub")) {
    return <Redirect href="/(exchange)/profile/new" />;
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
        name="requests/new"
        options={{
          title: "Anfragen",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="add-circle-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="requests/index"
        options={{
          title: "Meine Anfragen",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
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
