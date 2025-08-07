import { View, Text, ScrollView, Pressable } from "react-native";
import { useQuery } from "convex/react";
import { api } from "@SpringEin/backend/convex/_generated/api";
import { Container } from "@/components/container";
import { Link } from "expo-router";

export default function ApplicationsList() {
  const applications = useQuery(api.applications.myApplications) ?? [];

  return (
    <Container>
      <ScrollView style={{ padding: 16 }}>
        <Text style={{ fontSize: 22, fontWeight: "800", marginBottom: 12 }}>
          Alle Bewerbungen
        </Text>
        <Text style={{ color: "#6b7280", marginBottom: 16 }}>
          Bewerbungen für alle Ihre Vertretungsanfragen
        </Text>

        {applications.map((item: any) => (
          <View key={item.application._id} style={styles.card}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>
                  {item.request.startDate} - {item.request.endDate}
                </Text>
                <Text style={{ color: "#6b7280", marginBottom: 4 }}>
                  {item.request.timeFrom} - {item.request.timeTo}
                </Text>
                <Text style={{ marginBottom: 8 }}>
                  Altersgruppen: {item.request.ageGroups.join(", ")}
                </Text>
                
                <Text style={{ fontWeight: "600" }}>
                  Bewerber: {item.providerProfile?.city} • {item.providerProfile?.address}
                </Text>
                <Text style={{ color: "#6b7280" }}>
                  Kapazität: {item.providerProfile?.capacity} Kinder
                </Text>
              </View>
              
              <View style={[styles.statusBadge, getStatusStyle(item.application.status)]}>
                <Text style={[styles.statusText, getStatusTextStyle(item.application.status)]}>
                  {getStatusLabel(item.application.status)}
                </Text>
              </View>
            </View>

            <Link href={`/(exchange)/applications/${item.application._id}`} style={{ marginTop: 12 }}>
              <Text style={styles.linkText}>Details ansehen</Text>
            </Link>
          </View>
        ))}

        {applications.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={{ textAlign: "center", color: "#6b7280" }}>
              Noch keine Bewerbungen eingegangen
            </Text>
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

function getStatusTextStyle(status: string) {
  return { color: "#ffffff" };
}

const styles = {
  card: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    backgroundColor: "#ffffff",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    minWidth: 80,
    alignItems: "center",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  linkText: {
    color: "#2563eb",
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  emptyState: {
    padding: 32,
    alignItems: "center",
  },
} as const;