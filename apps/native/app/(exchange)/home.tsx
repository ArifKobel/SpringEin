import { View, Text, Pressable } from "react-native";
import { Link } from "expo-router";
import { Container } from "@/components/container";

export default function ExchangeHome() {
  return (
    <Container>
      <View style={{ flex: 1, padding: 16 }}>
        <Text style={{ fontSize: 22, fontWeight: "800", marginBottom: 8 }}>Kindertagesstätte</Text>
        <Text style={{ color: "#6b7280", marginBottom: 16 }}>Verwalte dein Kindertagesstätte-Profil und erstelle Anfragen.</Text>

        <Link href="/(exchange)/requests/new">
          <Text style={{ fontWeight: "700", color: "#111827" }}>Vertretung anfragen</Text>
        </Link>
        <View style={{ height: 8 }} />
        <Link href="/(exchange)/requests/index">
          <Text style={{ fontWeight: "700", color: "#111827" }}>Meine Anfragen</Text>
        </Link>
      </View>
    </Container>
  );
}

