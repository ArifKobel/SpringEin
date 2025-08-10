import { View, Text, Pressable } from "react-native";
import { Container } from "@/components/container";
import { useQuery, useMutation } from "convex/react";
import { api } from "@SpringEin/backend/convex/_generated/api";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function Hub() {
  const settings = useQuery(api.profiles.mySettings);
  const providers = useQuery(api.profiles.myProviderProfiles) ?? [];
  const exchanges = useQuery(api.profiles.myExchangeProfiles) ?? [];
  const setActive = useMutation(api.profiles.setActiveProfile);

  const activateProvider = async (id?: string) => {
    await setActive({ role: "provider", providerProfileId: id as any });
    router.replace("/(provider)/(tabs)/home");
  };
  const activateExchange = async (id?: string) => {
    await setActive({ role: "exchange", exchangeProfileId: id as any });
    router.replace("/(exchange)/home");
  };

  return (
    <Container>
      <View className="flex-1 p-4">
        <Text className="text-2xl font-extrabold mb-1">Profile & Rollen</Text>
        <Text className="text-gray-500 mb-5">Wähle ein bestehendes Profil oder lege ein neues an.</Text>

        <Text className="text-sm font-bold text-gray-900 mb-2">Tagespflegeperson</Text>
        {providers.length === 0 && (
          <Pressable onPress={() => router.push("/(provider)/profile/new")} className="flex-row items-center justify-between bg-white rounded-xl p-4 mb-3 border border-dashed border-gray-300 active:opacity-80">
            <View className="flex-row items-center">
              <Ionicons name="person-add-outline" size={20} color="#111827" />
              <Text className="ml-3 font-semibold text-gray-900">Neues Profil anlegen</Text>
            </View>
            <Ionicons name="add" size={20} color="#9ca3af" />
          </Pressable>
        )}
        {providers.map((p) => {
          const isActive = settings?.activeProviderProfileId === p._id;
          return (
            <Pressable
              key={p._id}
              onPress={() => activateProvider(p._id)}
              className={`flex-row items-center justify-between bg-white rounded-xl p-4 mb-3 border ${isActive ? "border-emerald-500" : "border-gray-200"} active:opacity-80`}
            >
              <View className="flex-row items-center">
                <Ionicons name="person-outline" size={20} color="#111827" />
                <View className="ml-3">
                  <Text className="font-semibold text-gray-900">{p.displayName}</Text>
                  <Text className="text-gray-500">{p.address}</Text>
                </View>
              </View>
              <View className="flex-row items-center">
                {isActive && (
                  <View className="bg-emerald-100 px-2 py-1 rounded-full mr-2">
                    <Text className="text-emerald-700 text-xs font-semibold">Aktiv</Text>
                  </View>
                )}
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </View>
            </Pressable>
          );
        })}
        {/* Max. 1 Provider-Profil: keine zusätzliche Erstellung anzeigen */}

        <Text className="text-sm font-bold text-gray-900 mb-2">Kindertagesstätte</Text>
        {exchanges.length === 0 && (
          <Pressable onPress={() => router.push("/(exchange)/profile/new")} className="flex-row items-center justify-between bg-white rounded-xl p-4 mb-3 border border-dashed border-gray-300 active:opacity-80">
            <View className="flex-row items-center">
              <Ionicons name="business-outline" size={20} color="#111827" />
              <Text className="ml-3 font-semibold text-gray-900">Neues Profil anlegen</Text>
            </View>
            <Ionicons name="add" size={20} color="#9ca3af" />
          </Pressable>
        )}
        {exchanges.map((e) => {
          const isActive = settings?.activeExchangeProfileId === e._id;
          return (
            <Pressable
              key={e._id}
              onPress={() => activateExchange(e._id)}
              className={`flex-row items-center justify-between bg-white rounded-xl p-4 mb-3 border ${isActive ? "border-emerald-500" : "border-gray-200"} active:opacity-80`}
            >
              <View className="flex-row items-center">
                <Ionicons name="home-outline" size={20} color="#111827" />
                <View className="ml-3">
                  <Text className="font-semibold text-gray-900">{e.city}</Text>
                  {!!e.facilityName && <Text className="text-gray-500">{e.facilityName}</Text>}
                </View>
              </View>
              <View className="flex-row items-center">
                {isActive && (
                  <View className="bg-emerald-100 px-2 py-1 rounded-full mr-2">
                    <Text className="text-emerald-700 text-xs font-semibold">Aktiv</Text>
                  </View>
                )}
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </View>
            </Pressable>
          );
        })}
        {/* Max. 1 Exchange-Profil: keine zusätzliche Erstellung anzeigen */}
      </View>
    </Container>
  );
}
