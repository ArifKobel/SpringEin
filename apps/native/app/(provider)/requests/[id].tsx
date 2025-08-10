import { View, Text, ScrollView, Pressable, Alert, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useQuery, useMutation } from "convex/react";
import { api } from "@SpringEin/backend/convex/_generated/api";
import { Container } from "@/components/container";
import { useLocalSearchParams, router } from "expo-router";
import { useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

export default function RequestDetailsForProvider() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const details = useQuery(api.requests.getRequestDetailsForProvider, { requestId: id as any });
  const myProviders = useQuery(api.profiles.myProviderProfiles) ?? [];
  const settings = useQuery(api.profiles.mySettings);

  const providerProfileId = useMemo(() => {
    return settings?.activeProviderProfileId ?? myProviders[0]?._id;
  }, [settings, myProviders]);

  const apply = useMutation(api.requests.applyToRequest);
  type FormValues = { coverNote?: string; sharePhone: boolean; initialMessage?: string };
  const schema: yup.ObjectSchema<FormValues> = yup.object({
    coverNote: yup.string().max(200, 'Max. 200 Zeichen').optional(),
    sharePhone: yup.boolean().required(),
    initialMessage: yup.string().max(500, 'Max. 500 Zeichen').optional(),
  });
  const { control, handleSubmit } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: { coverNote: '', sharePhone: true, initialMessage: '' },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onApply = async ({ coverNote, sharePhone, initialMessage }: FormValues) => {
    try {
      if (!providerProfileId) return Alert.alert("Fehler", "Kein Tagespflegeperson-Profil gefunden.");
      if (!details) return;
      setIsSubmitting(true);
      await apply({ requestId: details.request._id as any, providerProfileId: providerProfileId as any, coverNote, sharePhone, initialMessage });
      Alert.alert("Gesendet", "Bewerbung gesendet");
      // Zur Anfrage zurück
      router.replace(`/(provider)/requests/${details.request._id}`);
    } catch (e) {
      Alert.alert("Fehler", String(e));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!details) {
    return (
      <Container>
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-600">Details werden geladen...</Text>
        </View>
      </Container>
    );
  }

  const { request, exchangeProfile, myApplication } = details as any;

  return (
    <Container>
      <ScrollView>
        <View className="p-4">
          <Text className="text-2xl font-extrabold mb-4">Anfrage-Details</Text>

          <View className="mb-6 p-5 bg-gray-50 rounded-2xl">
            <Text className="text-base font-bold mb-2 text-gray-900">Zeitraum & Zeiten</Text>
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

          <View className="mb-6 p-5 bg-gray-50 rounded-2xl">
            <Text className="text-base font-bold mb-2 text-gray-900">Kindertagesstätte</Text>
            <Text className="text-base font-semibold">{exchangeProfile?.facilityName}</Text>
            <Text>{exchangeProfile?.address}</Text>
            <Text>{exchangeProfile?.postalCode} {exchangeProfile?.city}</Text>
            {exchangeProfile?.bio && <Text className="mt-2">{exchangeProfile.bio}</Text>}
          </View>

          {myApplication ? (
            <View className="mb-6 p-5 bg-gray-50 rounded-2xl">
              <Text className="text-base font-bold mb-2 text-gray-900">Bewerbungsstatus</Text>
              <View className={`self-start py-1.5 px-2.5 rounded-full ${getStatusClass(myApplication.status)}`}><Text className="text-white font-bold">{getStatusLabel(myApplication.status)}</Text></View>
              {myApplication.decisionAt && (
                <Text className="mt-1 text-gray-500">Entschieden am: {new Date(myApplication.decisionAt).toLocaleDateString()}</Text>
              )}
              {myApplication.decisionMessage && (
                <Text className="mt-2">Grund: {myApplication.decisionMessage}</Text>
              )}
              {(myApplication.exchangeSharedPhone || myApplication.exchangeSharedEmail) && (
                <View className="mt-2">
                  <Text className="font-bold mb-1">Kontakt der Kindertagesstätte</Text>
                  {myApplication.exchangeSharedPhone && <Text>Telefon: {myApplication.exchangeSharedPhone}</Text>}
                  {myApplication.exchangeSharedEmail && <Text>E-Mail: {myApplication.exchangeSharedEmail}</Text>}
                </View>
              )}
            </View>
          ) : (
            <View className="mb-6 p-5 bg-gray-50 rounded-2xl">
              <Text className="text-base font-bold mb-2 text-gray-900">Bewerben</Text>
              <Controller control={control} name="coverNote" render={({ field: { onChange, onBlur, value } }) => (
                <TextInput placeholder="Kurze Notiz" value={value} onChangeText={onChange} onBlur={onBlur} className="border border-gray-300 rounded-lg p-3 mb-2 bg-white" />
              )} />
              <View className="flex-row gap-2 mb-2">
                <Controller control={control} name="sharePhone" render={({ field: { value, onChange } }) => (
                  <Pressable onPress={() => onChange(!value)} className={`px-3 py-2 rounded-full border ${value ? "bg-gray-900 border-gray-900" : "border-gray-300"}`}>
                    <Text className={`${value ? "text-white" : "text-gray-900"}`}>Telefon teilen</Text>
                  </Pressable>
                )} />
              </View>
              <Controller control={control} name="initialMessage" render={({ field: { onChange, onBlur, value } }) => (
                <TextInput placeholder="Nachricht" value={value} onChangeText={onChange} onBlur={onBlur} className="border border-gray-300 rounded-lg p-3 h-20 bg-white" multiline />
              )} />
              <Pressable disabled={isSubmitting} onPress={handleSubmit(onApply)} className={`bg-gray-900 py-3 rounded-lg items-center mt-2 ${isSubmitting ? "opacity-60" : ""}`}>
                <Text className="text-white font-bold">Bewerbung senden</Text>
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>
    </Container>
  );
}

function getStatusLabel(status: string) {
  switch (status) {
    case "applied": return "Beworben";
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

 

