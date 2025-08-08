import { View, Text, ScrollView, Pressable, Alert, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useQuery, useMutation } from "convex/react";
import { api } from "@SpringEin/backend/convex/_generated/api";
import { Container } from "@/components/container";
import { useLocalSearchParams, router, Link } from "expo-router";
import { useState } from "react";

export default function ApplicationDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const details = useQuery(api.applications.getApplicationDetails, { applicationId: id as any });
  const decide = useMutation(api.applications.decideApplication);
  
  const [message, setMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [sharePhone, setSharePhone] = useState(true);
  const [shareEmail, setShareEmail] = useState(false);

  const handleDecision = async (status: "accepted" | "declined") => {
    if (!details) return;
    
    setIsProcessing(true);
    try {
      await decide({
        applicationId: details.application._id as any,
        status,
        message: message.trim() || undefined,
        sharePhone,
        shareEmail,
      });
      
      Alert.alert("Entscheidung gespeichert", status === "accepted" ? "Bewerbung angenommen" : "Bewerbung abgelehnt");
      // Zur zugehörigen Anfrage zurück
      router.replace(`/(exchange)/requests/${details.request._id}`);
    } catch (e) {
      Alert.alert("Fehler", String(e));
    } finally {
      setIsProcessing(false);
    }
  };

  if (!details) {
    return (
      <Container>
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-600">Bewerbung wird geladen...</Text>
        </View>
      </Container>
    );
  }

  const { application, request, providerProfile } = details;
  const isDecided = application.status !== "applied";

  return (
    <Container>
      <ScrollView>
        <View className="p-4">
          <Text className="text-2xl font-extrabold mb-4">Bewerbungsdetails</Text>

          {/* Anfrage-Info */}
          <View className="mb-6 p-5 bg-gray-50 rounded-2xl">
            <Text className="text-base font-bold mb-2 text-gray-900">Ihre Anfrage</Text>
            <View className="flex-row items-center mb-1">
              <Ionicons name="calendar-outline" size={16} color="#6b7280" />
              <Text className="ml-2">{request.startDate} bis {request.endDate}</Text>
            </View>
            <View className="flex-row items-center mb-2">
              <Ionicons name="time-outline" size={16} color="#6b7280" />
              <Text className="ml-2">{request.timeFrom} - {request.timeTo}</Text>
            </View>
            <View className="flex-row items-center mb-1">
              <Ionicons name="people-outline" size={16} color="#6b7280" />
              <Text className="ml-2 font-semibold">Altersgruppen</Text>
            </View>
            <View className="flex-row flex-wrap gap-2">
              {request.ageGroups.map((ag: string) => (
                <View key={ag} className="bg-gray-200 px-2 py-1 rounded-xl">
                  <Text className="text-xs font-medium text-gray-700">{ag}</Text>
                </View>
              ))}
            </View>
            {request.notes && <Text className="mt-2">Notizen: {request.notes}</Text>}
          </View>

          {/* Bewerber-Info */}
          <View className="mb-6 p-5 bg-gray-50 rounded-2xl">
            <Text className="text-base font-bold mb-2 text-gray-900">Bewerber</Text>
            <Text className="text-base font-semibold mb-1">{providerProfile?.city} • {providerProfile?.address}</Text>
            <Text>Kapazität: {providerProfile?.capacity} Kinder</Text>
            <Text>Altersgruppen: {providerProfile?.ageGroups.join(", ")}</Text>
            <Text>Verfügbare Tage: {providerProfile?.availableDays.join(", ")}</Text>
            <Text>Zeiten: {providerProfile?.availableTimeFrom} - {providerProfile?.availableTimeTo}</Text>
            {providerProfile?.bio && (
              <Text className="mt-2">Bio: {providerProfile?.bio}</Text>
            )}

            <Link href={`/(exchange)/provider/${providerProfile?._id}`} className="mt-3">
              <Text className="text-blue-600 font-semibold underline">Vollständiges Profil ansehen</Text>
            </Link>
          </View>

          {/* Kontakte vom Bewerber */}
          {application.sharedPhone && (
            <View className="mb-6 p-5 bg-gray-50 rounded-2xl">
              <Text className="text-base font-bold mb-2 text-gray-900">Kontakt</Text>
              <Text>Telefon: {application.sharedPhone}</Text>
            </View>
          )}
          {/* Geteilte Kontakte der Kindertagesstätte */}
          {(application.exchangeSharedPhone || application.exchangeSharedEmail) && (
            <View className="mb-6 p-5 bg-gray-50 rounded-2xl">
              <Text className="text-base font-bold mb-2 text-gray-900">Kontakt der Kindertagesstätte</Text>
              {application.exchangeSharedPhone && <Text>Telefon: {application.exchangeSharedPhone}</Text>}
              {application.exchangeSharedEmail && <Text>E-Mail: {application.exchangeSharedEmail}</Text>}
            </View>
          )}

          {/* Bewerbungstext */}
          {(application.coverNote || application.initialMessage) && (
            <View className="mb-6 p-5 bg-gray-50 rounded-2xl">
              <Text className="text-base font-bold mb-2 text-gray-900">Bewerbung</Text>
              {application.coverNote && <Text>Notiz: {application.coverNote}</Text>}
              {application.initialMessage && <Text>Nachricht: {application.initialMessage}</Text>}
            </View>
          )}

          {/* Status & Entscheidung */}
          <View className="mb-6 p-5 bg-gray-50 rounded-2xl">
            <Text className="text-base font-bold mb-2 text-gray-900">Status</Text>
            <View className={`self-start py-1.5 px-3 rounded-md ${getStatusClass(application.status)}`}>
              <Text className="text-white font-semibold text-xs">{getStatusLabel(application.status)}</Text>
            </View>
            {application.decisionAt && (
              <Text className="mt-1 text-gray-500">Entschieden am: {new Date(application.decisionAt).toLocaleDateString()}</Text>
            )}
            {application.decisionMessage && (
              <Text className="mt-1">Grund: {application.decisionMessage}</Text>
            )}
          </View>

          {/* Entscheidung */}
          {!isDecided && (
            <View className="mb-6 p-5 bg-gray-50 rounded-2xl">
              <Text className="text-base font-bold mb-2 text-gray-900">Entscheidung</Text>
              <TextInput
                placeholder="Nachricht an den Bewerber (optional)"
                value={message}
                onChangeText={setMessage}
                className="border border-gray-300 rounded-lg p-3 bg-white h-20"
                multiline
              />
              <View className="flex-row gap-2 mt-2">
                <Pressable onPress={() => setSharePhone(v => !v)} className={`px-3 py-2 rounded-full border ${sharePhone ? "bg-gray-900 border-gray-900" : "border-gray-300"}`}>
                  <Text className={`${sharePhone ? "text-white" : "text-gray-900"}`}>Telefon teilen</Text>
                </Pressable>
                <Pressable onPress={() => setShareEmail(v => !v)} className={`px-3 py-2 rounded-full border ${shareEmail ? "bg-gray-900 border-gray-900" : "border-gray-300"}`}>
                  <Text className={`${shareEmail ? "text-white" : "text-gray-900"}`}>E-Mail teilen</Text>
                </Pressable>
              </View>

              <View className="flex-row gap-3 mt-3">
                <Pressable onPress={() => handleDecision("accepted")} disabled={isProcessing} className="flex-1 py-3 rounded-lg items-center bg-emerald-500 disabled:opacity-60">
                  <Text className="text-white font-bold">Annehmen</Text>
                </Pressable>
                <Pressable onPress={() => handleDecision("declined")} disabled={isProcessing} className="flex-1 py-3 rounded-lg items-center bg-red-500 disabled:opacity-60">
                  <Text className="text-white font-bold">Ablehnen</Text>
                </Pressable>
              </View>
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