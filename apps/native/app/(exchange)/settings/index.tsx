import { View, Text, Pressable } from "react-native";
import { Container } from "@/components/container";
import { Link } from "expo-router";
import { useAuthActions } from "@convex-dev/auth/react";
import { Ionicons } from "@expo/vector-icons";

export default function ExchangeSettings() {
  const { signOut } = useAuthActions();
  return (
    <Container>
      <View className="flex-1 p-4">
        <Text className="text-2xl font-extrabold mb-4">Einstellungen</Text>

        <Text className="text-sm font-bold text-gray-900 mb-2">Profil</Text>
        <Link href="/(exchange)/settings/profile" asChild>
          <Pressable className="flex-row items-center justify-between bg-white rounded-xl p-4 mb-4 border border-gray-200 active:opacity-80">
            <View className="flex-row items-center">
              <Ionicons name="person-circle-outline" size={20} color="#111827" />
              <Text className="ml-3 font-semibold text-gray-900">Profil bearbeiten</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </Pressable>
        </Link>

        <Text className="text-sm font-bold text-gray-900 mb-2">Konto</Text>
        <Pressable onPress={() => signOut()} className="flex-row items-center justify-between bg-red-50 rounded-xl p-4 border border-red-200 active:opacity-80">
          <View className="flex-row items-center">
            <Ionicons name="log-out-outline" size={20} color="#b91c1c" />
            <Text className="ml-3 font-semibold text-red-700">Abmelden</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#fca5a5" />
        </Pressable>
      </View>
    </Container>
  );
}

 

