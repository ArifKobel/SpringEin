import { View, Text, Pressable } from "react-native";
import { Container } from "@/components/container";
import { useQuery, useMutation } from "convex/react";
import { api } from "@SpringEin/backend/convex/_generated/api";
import { router } from "expo-router";

export default function Hub() {
  const settings = useQuery(api.profiles.mySettings);
  const providers = useQuery(api.profiles.myProviderProfiles) ?? [];
  const exchanges = useQuery(api.profiles.myExchangeProfiles) ?? [];
  const setActive = useMutation(api.profiles.setActiveProfile);

  const activateProvider = async (id?: string) => {
    await setActive({ role: "provider", providerProfileId: id as any });
    router.replace("/(provider)/home");
  };
  const activateExchange = async (id?: string) => {
    await setActive({ role: "exchange", exchangeProfileId: id as any });
    router.replace("/(exchange)/home");
  };

  return (
    <Container>
      <View className="flex-1 p-4">
        <Text className="text-2xl font-extrabold mb-3">Profile & Rollen</Text>
        <Text className="text-gray-500 mb-4">Wähle ein bestehendes Profil oder lege ein neues an.</Text>

        <Text className="font-bold mb-2">Tagespflegeperson-Profil</Text>
        {providers.map((p) => (
          <Pressable key={p._id} onPress={() => activateProvider(p._id)} className="py-3 px-3 rounded-lg border border-gray-200 mb-2">
            <Text>{p.city} · {p.address}</Text>
          </Pressable>
        ))}
        <Pressable onPress={() => router.push("/(provider)/profile/new")} className="bg-gray-200 py-3 px-3 rounded-lg items-center mt-1 disabled:hiiden" disabled={providers.length > 0}>
          <Text className="text-gray-900 font-bold">Neues Tagespflegeperson-Profil</Text>
        </Pressable>

        <View className="h-4" />
        <Text className="font-bold mb-2">Kindertagesstätte-Profil</Text>
        {exchanges.map((e) => (
          <Pressable key={e._id} onPress={() => activateExchange(e._id)} className="py-3 px-3 rounded-lg border border-gray-200 mb-2">
            <Text>{e.city}</Text>
          </Pressable>
        ))}
        <Pressable onPress={() => router.push("/(exchange)/profile/new")} className="bg-gray-200 py-3 px-3 rounded-lg items-center mt-1 disabled:hidden" disabled={exchanges.length > 0}>
          <Text className="text-gray-900 font-bold">Neues Kindertagesstätte-Profil</Text>
        </Pressable>
      </View>
    </Container>
  );
}
