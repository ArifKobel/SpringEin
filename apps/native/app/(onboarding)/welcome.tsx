import { Link } from "expo-router";
import { View, Text } from "react-native";
import { Container } from "@/components/container";

export default function Welcome() {
  return (
    <Container>
      <View className="flex-1 items-center justify-center p-6">
        <Text className="text-3xl font-extrabold mb-3">Willkommen bei SpringEin</Text>
        <Text className="text-base text-gray-500 text-center mb-6">
          Starte in 2 Schritten: Rolle wählen und Profil anlegen.
        </Text>
        <Link href="/(onboarding)/role">
          <Text className="text-gray-900 font-bold">Weiter</Text>
        </Link>
      </View>
    </Container>
  );
}

