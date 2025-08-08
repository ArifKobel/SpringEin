import { View, Text, ScrollView } from "react-native";
import { useQuery } from "convex/react";
import { api } from "@SpringEin/backend/convex/_generated/api";
import { Container } from "@/components/container";
import { useLocalSearchParams } from "expo-router";

export default function ProviderProfile() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const profile = useQuery(api.applications.getProviderProfile, { profileId: id as any });

  if (!profile) {
    return (
      <Container>
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-600">Profil wird geladen...</Text>
        </View>
      </Container>
    );
  }

  return (
    <Container>
      <ScrollView>
        <View className="p-4">
          <Text className="text-2xl font-extrabold mb-4">Anbieter-Profil</Text>

          <View className="mb-5 p-4 bg-gray-50 rounded-lg">
            <Text className="text-base font-bold mb-2 text-gray-900">Standort</Text>
            <Text className="text-base font-semibold">{profile.address}</Text>
            <Text>{profile.city} {profile.postalCode}</Text>
          </View>

          <View className="mb-5 p-4 bg-gray-50 rounded-lg">
            <Text className="text-base font-bold mb-2 text-gray-900">Betreuungskapazität</Text>
            <Text>Kapazität: {profile.capacity} Kinder</Text>
            <Text>Max. Pendelstrecke: {profile.maxCommuteKm} km</Text>
          </View>

          <View className="mb-5 p-4 bg-gray-50 rounded-lg">
            <Text className="text-base font-bold mb-2 text-gray-900">Altersgruppen</Text>
            <View className="flex-row flex-wrap gap-2">
              {profile.ageGroups.map((group: string) => (
                <View key={group} className="bg-gray-200 py-1 px-2 rounded-xl">
                  <Text className="text-xs font-semibold text-gray-700">{group}</Text>
                </View>
              ))}
            </View>
          </View>

          <View className="mb-5 p-4 bg-gray-50 rounded-lg">
            <Text className="text-base font-bold mb-2 text-gray-900">Verfügbarkeit</Text>
            <Text>Tage: {profile.availableDays.join(", ")}</Text>
            <Text>Zeiten: {profile.availableTimeFrom} - {profile.availableTimeTo}</Text>
          </View>

          {profile.phone && profile.sharePhone && (
            <View className="mb-5 p-4 bg-gray-50 rounded-lg">
              <Text className="text-base font-bold mb-2 text-gray-900">Kontakt</Text>
              <Text>Telefon: {profile.phone}</Text>
            </View>
          )}

          {profile.bio && (
            <View className="mb-5 p-4 bg-gray-50 rounded-lg">
              <Text className="text-base font-bold mb-2 text-gray-900">Über mich</Text>
              <Text>{profile.bio}</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </Container>
  );
}

 