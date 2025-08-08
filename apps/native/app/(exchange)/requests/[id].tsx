import { View, Text, ScrollView } from "react-native";
import { useQuery } from "convex/react";
import { api } from "@SpringEin/backend/convex/_generated/api";
import { Container } from "@/components/container";
import { Link, useLocalSearchParams } from "expo-router";

export default function RequestApplications() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const applications = useQuery(api.requests.listApplicationsForRequest, { requestId: id as any });

  if (!applications) {
    return (
      <Container>
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-600">Bewerbungen werden geladen...</Text>
        </View>
      </Container>
    );
  }

  return (
    <Container>
      <ScrollView>
        <View className="p-4">
          <Text className="text-2xl font-extrabold mb-3">Bewerbungen</Text>
          <Text className="text-gray-500 mb-4">Alle Bewerbungen für diese Anfrage</Text>

          {applications.map((item: any) => (
            <View key={item.application._id} className="border border-gray-200 rounded-xl p-4 mb-3 bg-white">
              <View className="flex-row items-center justify-between">
                <View className="flex-1 pr-2">
                  <Text className="text-base font-bold mb-1">{item.providerProfile?.city} • {item.providerProfile?.address}</Text>
                  <Text className="text-gray-500">Kapazität: {item.providerProfile?.capacity} Kinder</Text>
                  <Text className="mt-1">Altersgruppen: {item.providerProfile?.ageGroups?.join(", ")}</Text>
                </View>
                <View className={`py-1 px-2 rounded-md min-w-20 items-center ${getStatusClass(item.application.status)}`}>
                  <Text className="text-white font-semibold text-xs">{getStatusLabel(item.application.status)}</Text>
                </View>
              </View>

              <View className="mt-3">
                <Link href={`/(exchange)/applications/${item.application._id}`}>
                  <Text className="text-blue-600 font-semibold underline">Details & Entscheidung</Text>
                </Link>
              </View>
            </View>
          ))}

          {applications.length === 0 && (
            <View className="p-6 items-center">
              <Text className="text-gray-500">Noch keine Bewerbungen vorhanden</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </Container>
  );
}

function getStatusLabel(status: string) {
  switch (status) {
    case "applied": return "Neu";
    case "accepted": return "Angenommen";
    case "declined": return "Abgelehnt";
    default: return status;
  }
}

function getStatusClass(status: string) {
  switch (status) {
    case "applied": return "bg-amber-400";
    case "accepted": return "bg-emerald-500";
    case "declined": return "bg-red-500";
    default: return "bg-gray-500";
  }
}

