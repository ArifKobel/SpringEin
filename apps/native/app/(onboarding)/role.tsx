import { View, Text, Pressable } from "react-native";
import { Container } from "@/components/container";
import { useMutation, useQuery } from "convex/react";
import { api } from "@SpringEin/backend/convex/_generated/api";
import { router } from "expo-router";

export default function Role() {
  const setActive = useMutation(api.profiles.setActiveProfile);
  const myProviders = useQuery(api.profiles.myProviderProfiles) ?? [];
  const myExchanges = useQuery(api.profiles.myExchangeProfiles) ?? [];

  const onSelectProvider = async () => {
    const first = myProviders[0]?._id;
    await setActive({ role: "provider", providerProfileId: first });
    router.replace("/(provider)/home");
  };
  const onSelectExchange = async () => {
    const first = myExchanges[0]?._id;
    await setActive({ role: "exchange", exchangeProfileId: first });
    router.replace("/(exchange)/home");
  };

  return (
    <Container>
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 12 }}>
        <Text style={{ fontSize: 22, fontWeight: "800" }}>Wähle deine Rolle</Text>
        <Pressable onPress={onSelectProvider} style={styles.btnPrimary}>
          <Text style={styles.btnText}>Ich biete Betreuung an</Text>
        </Pressable>
        <Pressable onPress={onSelectExchange} style={styles.btnSecondary}>
          <Text style={styles.btnTextDark}>Ich suche Vertretung</Text>
        </Pressable>
      </View>
    </Container>
  );
}

const styles = {
  btnPrimary: {
    backgroundColor: "#111827",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
  },
  btnSecondary: {
    backgroundColor: "#e5e7eb",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
  },
  btnText: { color: "white", fontWeight: "700" },
  btnTextDark: { color: "#111827", fontWeight: "700" },
} as const;

