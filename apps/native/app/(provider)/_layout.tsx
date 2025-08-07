import { Drawer } from "expo-router/drawer";

export default function ProviderDrawer() {
  return (
    <Drawer>
      <Drawer.Screen name="home" options={{ headerTitle: "Übersicht", drawerLabel: "Übersicht" }} />
      <Drawer.Screen name="profile/new" options={{ headerTitle: "Provider-Profil anlegen", drawerItemStyle: { display: "none" } }} />
      <Drawer.Screen name="profile/edit" options={{ headerTitle: "Provider-Profil bearbeiten", drawerItemStyle: { display: "none" } }} />
      <Drawer.Screen name="inbox" options={{ headerTitle: "Eingang (Matches)", drawerLabel: "Eingang (Matches)" }} />
      <Drawer.Screen name="settings" options={{ headerTitle: "Einstellungen", drawerLabel: "Einstellungen" }} />
      <Drawer.Screen name="hub" options={{ headerTitle: "Profile", drawerLabel: "Profile", drawerItemStyle: { marginTop: 'auto' } }} />
    </Drawer>
  );
}

