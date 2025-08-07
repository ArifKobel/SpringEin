import { View, Text, ScrollView, Pressable } from "react-native";
import { useQuery } from "convex/react";
import { api } from "@SpringEin/backend/convex/_generated/api";
import { Container } from "@/components/container";
import { Link } from "expo-router";

export default function MyRequests() {
  const reqs = useQuery(api.requests.myRequests) ?? [];
  return (
    <Container>
      <ScrollView style={{ padding: 16 }}>
        <Text style={{ fontSize: 22, fontWeight: "700", marginBottom: 12 }}>Meine Anfragen</Text>
        <Text style={{ color: "#6b7280", marginBottom: 16 }}>
          Übersicht Ihrer Vertretungsanfragen
        </Text>
        
        {reqs.map((r: any) => (
          <View key={r._id} style={styles.card}>
            <Text style={styles.title}>
              {r.startDate} - {r.endDate}
            </Text>
            <Text style={{ color: "#6b7280", marginBottom: 4 }}>
              {r.timeFrom} - {r.timeTo}
            </Text>
            <Text style={{ marginBottom: 8 }}>
              Altersgruppen: {r.ageGroups.join(", ")}
            </Text>
            <View style={[styles.statusBadge, getStatusStyle(r.status)]}>
              <Text style={styles.statusText}>
                {getStatusLabel(r.status)}
              </Text>
            </View>
            {r.notes && (
              <Text style={{ marginTop: 8, fontStyle: "italic" }}>
                "{r.notes}"
              </Text>
            )}
          </View>
        ))}
        
        {!reqs.length && (
          <View style={styles.emptyState}>
            <Text style={{ textAlign: "center", color: "#6b7280" }}>
              Noch keine Anfragen erstellt
            </Text>
            <Link href="/(exchange)/requests/new" style={{ marginTop: 12 }}>
              <Text style={styles.linkText}>Erste Anfrage erstellen</Text>
            </Link>
          </View>
        )}
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

function getStatusStyle(status: string) {
  switch (status) {
    case "open": return { backgroundColor: "#fbbf24" };
    case "fulfilled": return { backgroundColor: "#10b981" };
    case "cancelled": return { backgroundColor: "#ef4444" };
    default: return { backgroundColor: "#6b7280" };
  }
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
  title: { 
    fontSize: 16,
    fontWeight: "700", 
    marginBottom: 4,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  statusText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 12,
  },
  emptyState: {
    padding: 32,
    alignItems: "center",
  },
  linkText: {
    color: "#2563eb",
    fontWeight: "600",
    textDecorationLine: "underline",
  },
} as const;

