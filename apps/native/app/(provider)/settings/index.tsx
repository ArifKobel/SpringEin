import { View, Text, Pressable } from "react-native";
import { Container } from "@/components/container";
import { Link } from "expo-router";
import { useAuthActions } from "@convex-dev/auth/react";

export default function ProviderSettings() {
  const { signOut } = useAuthActions();
  return (
    <Container>
      <View style={{ flex: 1, padding: 16 }}>
        <Text style={{ fontSize: 22, fontWeight: "800", marginBottom: 12 }}>Einstellungen</Text>
        <Link href="/(provider)/settings/profile">
          <Text style={{ color: "#111827", fontWeight: "700" }}>Profil bearbeiten</Text>
        </Link>
        <View style={{ height: 16 }} />
        <Pressable onPress={() => signOut()} style={styles.btnDanger}>
          <Text style={{ color: "white", fontWeight: "700" }}>Abmelden</Text>
        </Pressable>
      </View>
    </Container>
  );
}

const styles = {
  btnDanger: {
    backgroundColor: "#b91c1c",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
} as const;

