import { View, Text, Pressable } from "react-native";
import { Link } from "expo-router";
import { Container } from "@/components/container";
import { Ionicons } from "@expo/vector-icons";

export default function ExchangeHome() {
  return (
    <Container>
      <View className="flex-1 p-4">
        <Text className="text-2xl font-extrabold mb-2">Kindertagesstätte</Text>
        <Text className="text-gray-500 mb-4">Verwalte dein Kindertagesstätte-Profil und erstelle Anfragen.</Text>

        <View className="mt-2">
          <Link href="/(exchange)/requests/new" asChild>
            <Pressable className="flex-row items-center justify-between bg-white rounded-xl p-4 mb-3 border border-gray-200 active:opacity-80">
              <View className="flex-row items-center">
                <Ionicons name="add-circle-outline" size={20} color="#111827" />
                <Text className="ml-3 font-semibold text-gray-900">Vertretung anfragen</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </Pressable>
          </Link>

          <Link href="/(exchange)/requests/index" asChild>
            <Pressable className="flex-row items-center justify-between bg-white rounded-xl p-4 mb-3 border border-gray-200 active:opacity-80">
              <View className="flex-row items-center">
                <Ionicons name="list-outline" size={20} color="#111827" />
                <Text className="ml-3 font-semibold text-gray-900">Meine Anfragen</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </Pressable>
          </Link>
        </View>
      </View>
    </Container>
  );
}

