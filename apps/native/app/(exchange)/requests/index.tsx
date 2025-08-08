import { View, Text, ScrollView, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import { api } from "@SpringEin/backend/convex/_generated/api";
import { Container } from "@/components/container";
import { Link } from "expo-router";

export default function MyRequests() {
  const reqs = useQuery(api.requests.myRequests) ?? [];
  const counts = useQuery(api.requests.applicationCountsForMyRequests) ?? [];
  const countById = new Map<string, number>(counts.map((c: any) => [c.requestId, c.count]));
  return (
    <Container>
      <ScrollView>
        <View className="p-4">
          <Text className="text-2xl font-bold mb-3">Meine Anfragen</Text>
          <Text className="text-gray-500 mb-4">Übersicht Ihrer Vertretungsanfragen</Text>

          {reqs.map((r: any) => (
            <View key={r._id} className="border border-gray-200 rounded-2xl p-4 mb-4 bg-white">
              <View className="space-y-2">
                <View className="flex-row items-center">
                  <Ionicons name="calendar-outline" size={16} color="#6b7280" />
                  <Text className="ml-2 font-semibold">{r.startDate} - {r.endDate}</Text>
                </View>
                <View className="flex-row items-center">
                  <Ionicons name="time-outline" size={16} color="#6b7280" />
                  <Text className="ml-2 text-gray-600">{r.timeFrom} - {r.timeTo}</Text>
                </View>
                <View className="flex-row items-center">
                  <Ionicons name="people-outline" size={16} color="#6b7280" />
                  <Text className="ml-2">{r.ageGroups.join(", ")}</Text>
                </View>
              </View>
              <View className="mt-3 flex-row items-center justify-between">
                <View className={`py-1 px-2 rounded-md ${getStatusClass(r.status)}`}>
                  <Text className="text-white font-semibold text-xs">{getStatusLabel(r.status)}</Text>
                </View>
                <View className="flex-row items-center">
                  <Ionicons name="mail-outline" size={16} color="#6b7280" />
                  <Text className="ml-2 font-semibold">{countById.get(r._id) ?? 0}</Text>
                </View>
              </View>
              {r.notes && (
                <Text className="mt-2 italic">"{r.notes}"</Text>
              )}
              <View className="mt-3">
                <Link href={`/(exchange)/requests/${r._id}`}>
                  <View className="self-start flex-row items-center gap-1">
                    <Text className="text-blue-600 font-semibold underline">Bewerbungen ansehen</Text>
                    <Ionicons name="chevron-forward" size={16} color="#2563eb" />
                  </View>
                </Link>
              </View>
            </View>
          ))}

          {!reqs.length && (
            <View className="p-8 items-center">
              <Text className="text-center text-gray-500">Noch keine Anfragen erstellt</Text>
              <Link href="/(exchange)/requests/new" className="mt-3">
                <Text className="text-blue-600 font-semibold underline">Erste Anfrage erstellen</Text>
              </Link>
            </View>
          )}
        </View>
      </ScrollView>
    </Container>
  );
}

function getStatusLabel(status: string) {
  switch (status) {
    case "open": return "Offen";
    case "fulfilled": return "Erfüllt";
    case "cancelled": return "Abgebrochen";
    default: return status;
  }
}

function getStatusClass(status: string) {
  switch (status) {
    case "open": return "bg-amber-400";
    case "fulfilled": return "bg-emerald-500";
    case "cancelled": return "bg-red-500";
    default: return "bg-gray-500";
  }
}

 

