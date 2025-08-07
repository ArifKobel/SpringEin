import { Drawer } from "expo-router/drawer";
import { api } from "@SpringEin/backend/convex/_generated/api";
import { useQuery } from "convex/react";
import { Redirect, usePathname } from "expo-router";

export default function ExchangeDrawer() {
  const profiles = useQuery(api.profiles.myExchangeProfiles);
  const path = usePathname();
  if (!profiles?.length && !path.includes("profile/new") && !path.includes("hub")) {
    return <Redirect href="/profile/new" />;
  } 
  return (
    <Drawer>
      <Drawer.Screen name="home" options={{ headerTitle: "Übersicht", drawerLabel: "Übersicht" }} />
      <Drawer.Screen name="profile/new" options={{ headerTitle: "Kindertagesstätte-Profil anlegen", drawerItemStyle: { display: "none" } }} />
      <Drawer.Screen name="profile/edit" options={{ headerTitle: "Kindertagesstätte-Profil bearbeiten", drawerItemStyle: { display: "none" } }} />
      <Drawer.Screen name="requests/new" options={{ headerTitle: "Vertretung anfragen", drawerLabel: "Vertretung anfragen" }} />
      <Drawer.Screen name="requests/index" options={{ headerTitle: "Meine Anfragen", drawerLabel: "Meine Anfragen" }} />
      <Drawer.Screen name="applications/index" options={{ headerTitle: "Bewerbungen", drawerLabel: "Bewerbungen" }} />
      <Drawer.Screen name="applications/[id]" options={{ headerTitle: "Bewerbungsdetails", drawerItemStyle: { display: "none" } }} />
      <Drawer.Screen name="provider/[id]" options={{ headerTitle: "Anbieter-Profil", drawerItemStyle: { display: "none" } }} />
      <Drawer.Screen name="settings" options={{ headerTitle: "Einstellungen", drawerLabel: "Einstellungen" }} />
      <Drawer.Screen name="hub" options={{ headerTitle: "Profile", drawerLabel: "Profile", drawerItemStyle: { marginTop: 'auto' } }} />
    </Drawer>
  );
}
