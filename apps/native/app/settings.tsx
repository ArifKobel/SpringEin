import { useState } from "react";
import { View, Text, Pressable, Alert } from "react-native";
import { Container } from "@/components/container";
import { useAuthActions } from "@convex-dev/auth/react";

export default function Settings() {
  const { signOut } = useAuthActions();
  const [lang, setLang] = useState<"de" | "en">("de");

  const changeLang = (l: "de" | "en") => {
    setLang(l);
    Alert.alert("Info", `Sprache auf ${l.toUpperCase()} gesetzt (Demo)`);
    // TODO: hook into i18n + persist preference
  };

  return (
    <Container>
      <View style={{ flex: 1, padding: 16 }}>
        <Text style={{ fontSize: 22, fontWeight: "800", marginBottom: 12 }}>Einstellungen</Text>
        <Text style={{ fontWeight: "700", marginBottom: 8 }}>Sprache</Text>
        <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
          <Pressable onPress={() => changeLang("de")} style={[styles.chip, lang === "de" && styles.chipActive]}>
            <Text style={{ color: lang === "de" ? "#fff" : "#111" }}>Deutsch</Text>
          </Pressable>
          <Pressable onPress={() => changeLang("en")} style={[styles.chip, lang === "en" && styles.chipActive]}>
            <Text style={{ color: lang === "en" ? "#fff" : "#111" }}>English</Text>
          </Pressable>
        </View>

        <Text style={{ fontWeight: "700", marginBottom: 8 }}>Konto</Text>
        <Pressable onPress={() => signOut()} style={styles.btnDanger}>
          <Text style={{ color: "white", fontWeight: "700" }}>Abmelden</Text>
        </Pressable>
      </View>
    </Container>
  );
}

const styles = {
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 999,
  },
  chipActive: {
    backgroundColor: "#111827",
    borderColor: "#111827",
  },
  btnDanger: {
    backgroundColor: "#b91c1c",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
} as const;

