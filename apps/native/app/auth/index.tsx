import { View, Text, ScrollView } from "react-native";
import { Container } from "@/components/container";
import { useQuery } from "convex/react";
import { api } from "@SpringEin/backend/convex/_generated/api";

export default function SignIn() {
  const healthCheck = useQuery(api.healthCheck.get);

  return (
    <Container>
      <ScrollView className="flex-1 p-6">
        <Text className="text-3xl font-bold text-foreground mb-2">
          Sign In
        </Text>
      </ScrollView>
    </Container>
  );
}
