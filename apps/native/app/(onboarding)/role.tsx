import { View, Text, Pressable } from "react-native";
import { Container } from "@/components/container";
import { useMutation, useQuery } from "convex/react";
import { api } from "@SpringEin/backend/convex/_generated/api";
import { router } from "expo-router";

export default function Role() {
  const setActive = useMutation(api.profiles.setActiveProfile);
  const myProviders = useQuery(api.profiles.myProviderProfiles) ?? [];
  const myExchanges = useQuery(api.profiles.myExchangeProfiles) ?? [];

  const onSelectProvider = async () => {
    const first = myProviders[0]?._id;
    await setActive({ role: "provider", providerProfileId: first });
    router.replace("/(provider)/home");
  };
  const onSelectExchange = async () => {
    const first = myExchanges[0]?._id;
    await setActive({ role: "exchange", exchangeProfileId: first });
    router.replace("/(exchange)/home");
  };

  return (
    <Container>
      <View className="flex-1 items-center justify-center p-6 gap-3">
        <Text className="text-xl font-extrabold">Wähle deine Rolle</Text>
        <Pressable onPress={onSelectProvider} className="bg-gray-900 py-3 px-4 rounded-xl w-full items-center">
          <Text className="text-white font-bold">Ich biete Betreuung an</Text>
        </Pressable>
        <Pressable onPress={onSelectExchange} className="bg-gray-200 py-3 px-4 rounded-xl w-full items-center">
          <Text className="text-gray-900 font-bold">Ich suche Vertretung</Text>
        </Pressable>
      </View>
    </Container>
  );
}

 

