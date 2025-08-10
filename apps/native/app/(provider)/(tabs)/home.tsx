import { View, Text, Pressable } from "react-native";
import { Link } from "expo-router";
import { Container } from "@/components/container";
import { Ionicons } from "@expo/vector-icons";

export default function ProviderHome() {
  return (
    <Container>
      <View className="flex-1 p-4">
        <Text className="text-2xl font-extrabold mb-2">Tagespflegeperson</Text>
        <Text className="text-gray-500 mb-4">Verwalte dein Tagespflegeperson-Profil und sieh eingehende Anfragen.</Text>

        <View className="mt-2">
          <Link href="/(provider)/(tabs)/inbox" asChild>
            <Pressable className="flex-row items-center justify-between bg-white rounded-xl p-4 mb-3 border border-gray-200 active:opacity-80">
              <View className="flex-row items-center">
                <Ionicons name="mail-outline" size={20} color="#111827" />
                <Text className="ml-3 font-semibold text-gray-900">Eingang (Matches)</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </Pressable>
          </Link>


          <Link href="/hub" asChild>
            <Pressable className="flex-row items-center justify-between bg-white rounded-xl p-4 mb-3 border border-gray-200 active:opacity-80">
              <View className="flex-row items-center">
                <Ionicons name="people-outline" size={20} color="#111827" />
                <Text className="ml-3 font-semibold text-gray-900">Profile & Rollen</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </Pressable>
          </Link>
        </View>
      </View>
    </Container>
  );
}

