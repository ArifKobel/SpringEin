import { Stack } from "expo-router";

export default function ExchangeSettingsLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Einstellungen" }} />
    </Stack>
  );
}

