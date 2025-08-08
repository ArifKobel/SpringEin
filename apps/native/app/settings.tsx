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
      <View className="flex-1 p-4">
        <Text className="text-2xl font-extrabold mb-3">Einstellungen</Text>
        <Text className="font-bold mb-2">Sprache</Text>
        <View className="flex-row gap-2 mb-4">
          <Pressable onPress={() => changeLang("de")} className={`px-3 py-2 rounded-full border ${lang === "de" ? "bg-gray-900 border-gray-900" : "border-gray-300"}`}>
            <Text className={`${lang === "de" ? "text-white" : "text-gray-900"}`}>Deutsch</Text>
          </Pressable>
          <Pressable onPress={() => changeLang("en")} className={`px-3 py-2 rounded-full border ${lang === "en" ? "bg-gray-900 border-gray-900" : "border-gray-300"}`}>
            <Text className={`${lang === "en" ? "text-white" : "text-gray-900"}`}>English</Text>
          </Pressable>
        </View>

        <Text className="font-bold mb-2">Konto</Text>
        <Pressable onPress={() => signOut()} className="bg-red-700 py-3 px-3 rounded-lg items-center mt-2">
          <Text className="text-white font-bold">Abmelden</Text>
        </Pressable>
      </View>
    </Container>
  );
}

 

