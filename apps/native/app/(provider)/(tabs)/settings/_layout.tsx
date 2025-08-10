import { Stack } from "expo-router";

export default function ProviderSettingsLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false, headerTitle: "Einstellungen", title: "Einstellungen" }} />
      <Stack.Screen name="profile" options={{ title: "Profil bearbeiten" }} />
    </Stack>
  );
}
 
