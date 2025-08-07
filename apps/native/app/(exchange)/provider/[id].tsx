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
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text>Profil wird geladen...</Text>
        </View>
      </Container>
    );
  }

  return (
    <Container>
      <ScrollView style={{ padding: 16 }}>
        <Text style={{ fontSize: 22, fontWeight: "800", marginBottom: 16 }}>
          Anbieter-Profil
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Standort</Text>
          <Text style={{ fontSize: 16, fontWeight: "600" }}>
            {profile.address}
          </Text>
          <Text>{profile.city} {profile.postalCode}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Betreuungskapazität</Text>
          <Text>Kapazität: {profile.capacity} Kinder</Text>
          <Text>Max. Pendelstrecke: {profile.maxCommuteKm} km</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Altersgruppen</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {profile.ageGroups.map((group: string) => (
              <View key={group} style={styles.chip}>
                <Text style={styles.chipText}>{group}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Verfügbarkeit</Text>
          <Text>Tage: {profile.availableDays.join(", ")}</Text>
          <Text>Zeiten: {profile.availableTimeFrom} - {profile.availableTimeTo}</Text>
        </View>

        {profile.phone && profile.sharePhone && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Kontakt</Text>
            <Text>Telefon: {profile.phone}</Text>
          </View>
        )}

        {profile.bio && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Über mich</Text>
            <Text>{profile.bio}</Text>
          </View>
        )}
      </ScrollView>
    </Container>
  );
}

const styles = {
  section: {
    marginBottom: 20,
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
  chip: {
    backgroundColor: "#e5e7eb",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  chipText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
  },
} as const;