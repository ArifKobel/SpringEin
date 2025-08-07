import { View, Text, ScrollView, Pressable, Alert, TextInput } from "react-native";
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

  const handleDecision = async (status: "accepted" | "declined") => {
    if (!details) return;
    
    setIsProcessing(true);
    try {
      await decide({
        applicationId: details.application._id as any,
        status,
        message: message.trim() || undefined,
      });
      
      Alert.alert(
        "Entscheidung gespeichert",
        status === "accepted" ? "Bewerbung angenommen" : "Bewerbung abgelehnt",
        [{ text: "OK", onPress: () => router.back() }]
      );
    } catch (e) {
      Alert.alert("Fehler", String(e));
    } finally {
      setIsProcessing(false);
    }
  };

  if (!details) {
    return (
      <Container>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text>Bewerbung wird geladen...</Text>
        </View>
      </Container>
    );
  }

  const { application, request, providerProfile } = details;
  const isDecided = application.status !== "applied";

  return (
    <Container>
      <ScrollView style={{ padding: 16 }}>
        <Text style={{ fontSize: 22, fontWeight: "800", marginBottom: 16 }}>
          Bewerbungsdetails
        </Text>

        {/* Anfrage-Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ihre Anfrage</Text>
          <Text>Zeitraum: {request.startDate} bis {request.endDate}</Text>
          <Text>Uhrzeiten: {request.timeFrom} - {request.timeTo}</Text>
          <Text>Altersgruppen: {request.ageGroups.join(", ")}</Text>
          {request.notes && <Text>Notizen: {request.notes}</Text>}
        </View>

        {/* Bewerber-Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bewerber</Text>
          <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 4 }}>
            {providerProfile.city} • {providerProfile.address}
          </Text>
          <Text>Kapazität: {providerProfile.capacity} Kinder</Text>
          <Text>Altersgruppen: {providerProfile.ageGroups.join(", ")}</Text>
          <Text>Verfügbare Tage: {providerProfile.availableDays.join(", ")}</Text>
          <Text>Zeiten: {providerProfile.availableTimeFrom} - {providerProfile.availableTimeTo}</Text>
          {providerProfile.bio && (
            <Text style={{ marginTop: 8 }}>Bio: {providerProfile.bio}</Text>
          )}
          
          <Link href={`/(exchange)/provider/${providerProfile._id}`} style={{ marginTop: 12 }}>
            <Text style={styles.linkText}>Vollständiges Profil ansehen</Text>
          </Link>
        </View>

        {/* Kontaktdaten */}
        {application.sharedPhone && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Kontakt</Text>
            <Text>Telefon: {application.sharedPhone}</Text>
          </View>
        )}

        {/* Bewerbungstext */}
        {(application.coverNote || application.initialMessage) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Bewerbung</Text>
            {application.coverNote && <Text>Notiz: {application.coverNote}</Text>}
            {application.initialMessage && <Text>Nachricht: {application.initialMessage}</Text>}
          </View>
        )}

        {/* Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Status</Text>
          <View style={[styles.statusBadge, getStatusStyle(application.status)]}>
            <Text style={styles.statusText}>
              {getStatusLabel(application.status)}
            </Text>
          </View>
          {application.decisionAt && (
            <Text style={{ marginTop: 4, color: "#6b7280" }}>
              Entschieden am: {new Date(application.decisionAt).toLocaleDateString()}
            </Text>
          )}
        </View>

        {/* Entscheidung */}
        {!isDecided && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Entscheidung</Text>
            <TextInput
              placeholder="Nachricht an den Bewerber (optional)"
              value={message}
              onChangeText={setMessage}
              style={[styles.input, { height: 80 }]}
              multiline
            />
            
            <View style={{ flexDirection: "row", gap: 12, marginTop: 12 }}>
              <Pressable
                onPress={() => handleDecision("accepted")}
                disabled={isProcessing}
                style={[styles.button, styles.acceptButton]}
              >
                <Text style={styles.buttonText}>Annehmen</Text>
              </Pressable>
              
              <Pressable
                onPress={() => handleDecision("declined")}
                disabled={isProcessing}
                style={[styles.button, styles.declineButton]}
              >
                <Text style={styles.buttonText}>Ablehnen</Text>
              </Pressable>
            </View>
          </View>
        )}
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

function getStatusStyle(status: string) {
  switch (status) {
    case "applied": return { backgroundColor: "#fbbf24" };
    case "accepted": return { backgroundColor: "#10b981" };
    case "declined": return { backgroundColor: "#ef4444" };
    default: return { backgroundColor: "#6b7280" };
  }
}

const styles = {
  section: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: "#f9fafb",
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
    color: "#111827",
  },
  statusBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  statusText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#ffffff",
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  acceptButton: {
    backgroundColor: "#10b981",
  },
  declineButton: {
    backgroundColor: "#ef4444",
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "700",
  },
  linkText: {
    color: "#2563eb",
    fontWeight: "600",
    textDecorationLine: "underline",
  },
} as const;