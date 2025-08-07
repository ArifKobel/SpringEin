import { View, Text } from "react-native";
import { Link } from "expo-router";
import { Container } from "@/components/container";

export default function ProviderHome() {
  return (
    <Container>
      <View style={{ flex: 1, padding: 16 }}>
        <Text style={{ fontSize: 22, fontWeight: "800", marginBottom: 8 }}>Tagespflegeperson</Text>
        <Text style={{ color: "#6b7280", marginBottom: 16 }}>Verwalte dein Tagespflegeperson-Profil und sieh eingehende Anfragen.</Text>

        <Link href="/(provider)/inbox">
          <Text style={{ fontWeight: "700", color: "#111827" }}>Eingang (Matches)</Text>
        </Link>
        <View style={{ height: 8 }} />
        <Link href="/(provider)/profile/new">
          <Text style={{ fontWeight: "700", color: "#111827" }}>Neues Tagespflegeperson-Profil</Text>
        </Link>
        <View style={{ height: 8 }} />
        <Link href="/hub">
          <Text style={{ fontWeight: "700", color: "#111827" }}>Profile & Rollen</Text>
        </Link>
      </View>
    </Container>
  );
}

