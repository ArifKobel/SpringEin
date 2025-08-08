import { View, Text, ScrollView, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import { api } from "@SpringEin/backend/convex/_generated/api";
import { Container } from "@/components/container";
import { router } from "expo-router";

export default function Inbox() {
  const items = useQuery(api.requests.providerInbox) ?? [];

  // Hinweis: Annahme/Ablehnung erfolgt durch die Kindertagesstätte auf Bewerbungen.

  return (
    <Container>
      <ScrollView>
        <View className="p-4">
          <Text className="text-2xl font-bold mb-3">Eingehende Anfragen</Text>
        {items.map((it: any) => {
          const hasApplication = Boolean(it.application);
          const statusLabel = hasApplication
            ? getAppStatusLabel(it.application.status)
            : getMatchStatusLabel(it.match.status);
          const statusStyle = hasApplication
            ? getStatusStyle(it.application.status)
            : getStatusStyle(it.match.status);

          return (
            <View key={it.match._id} className="border border-gray-200 rounded-2xl p-4 mb-4 bg-white">
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-1 pr-3">
                  {it.exchangeProfile?.facilityName && (
                    <Text className="font-bold mb-1">{it.exchangeProfile.facilityName}</Text>
                  )}
                  <View className="flex-row items-center">
                    <Ionicons name="calendar-outline" size={16} color="#6b7280" />
                    <Text className="ml-2 text-gray-500">{it.request.startDate} – {it.request.endDate}</Text>
                  </View>
                </View>
                <View className={`self-start py-1.5 px-2.5 rounded-full ${statusStyle}`}>
                  <Text className="text-white font-bold">{statusLabel}</Text>
                </View>
              </View>

              <View className="space-y-1">
                <View className="flex-row items-center">
                  <Ionicons name="time-outline" size={16} color="#6b7280" />
                  <Text className="ml-2">{it.request.timeFrom} - {it.request.timeTo}</Text>
                </View>
                <View className="flex-row items-center">
                  <Ionicons name="people-outline" size={16} color="#6b7280" />
                  <Text className="ml-2">{it.request.ageGroups.join(", ")}</Text>
                </View>
              </View>

              <View className="flex-row gap-2 mt-3">
                <Pressable onPress={() => router.push(`/(provider)/requests/${it.request._id}`)} className="bg-gray-200 py-2.5 px-3 rounded-lg">
                  <Text className="text-gray-900 font-bold">Details</Text>
                </Pressable>
              </View>

              {hasApplication && it.application.decisionAt ? (
                <Text className="mt-2 text-gray-500">Entschieden am: {new Date(it.application.decisionAt).toLocaleDateString()}</Text>
              ) : null}
            </View>
          );
        })}
        {!items.length && <Text>Keine Anfragen vorhanden.</Text>}
        </View>
      </ScrollView>
    </Container>
  );
}

function getAppStatusLabel(status: string) {
  switch (status) {
    case "applied": return "Beworben";
    case "accepted": return "Angenommen";
    case "declined": return "Abgelehnt";
    default: return status;
  }
}

function getMatchStatusLabel(status: string) {
  switch (status) {
    case "pending": return "Neu";
    case "accepted": return "Match angenommen";
    case "declined": return "Match abgelehnt";
    default: return status;
  }
}

function getStatusStyle(status: string) {
  switch (status) {
    case "applied":
    case "pending":
      return "bg-amber-400";
    case "accepted":
      return "bg-emerald-500";
    case "declined":
      return "bg-red-500";
    default:
      return "bg-gray-500";
  }
}

 


