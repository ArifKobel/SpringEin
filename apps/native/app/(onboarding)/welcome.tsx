import { Link } from "expo-router";
import { View, Text } from "react-native";
import { Container } from "@/components/container";

export default function Welcome() {
  return (
    <Container>
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}>
        <Text style={{ fontSize: 28, fontWeight: "800", marginBottom: 12 }}>Willkommen bei SpringEin</Text>
        <Text style={{ fontSize: 16, color: "#6b7280", textAlign: "center", marginBottom: 24 }}>
          Starte in 2 Schritten: Rolle wählen und Profil anlegen.
        </Text>
        <Link href="/(onboarding)/role">
          <Text style={{ color: "#111827", fontWeight: "700" }}>Weiter</Text>
        </Link>
      </View>
    </Container>
  );
}

