import { View, Text, ScrollView } from "react-native";
import { Container } from "@/components/container";
import { useQuery } from "convex/react";
import { api } from "@SpringEin/backend/convex/_generated/api";
import { AccountTypeRouter } from "@/components/account-type-router";
import { i18n } from "@/i18n";
import { Ionicons } from "@expo/vector-icons";

export default function Chat() {
  const account = useQuery(api.accounts.getCurrent);

  // Show account type router if no account
  if (account === undefined) {
    return <AccountTypeRouter />;
  }

  if (!account) {
    return <AccountTypeRouter />;
  }

  return (
    <Container>
      <ScrollView className="flex-1 p-6">
        <View className="mb-6">
          <Text className="text-3xl font-bold text-foreground mb-2">
            {i18n.t("chat.title")}
          </Text>
          <Text className="text-lg text-muted-foreground">
            Ihre Nachrichten und Unterhaltungen
          </Text>
        </View>

        {/* Coming Soon */}
        <View className="bg-gray-50 rounded-xl p-8 items-center">
          <Ionicons name="chatbubble-outline" size={64} color="#9ca3af" />
          <Text className="text-xl font-semibold text-foreground mt-4 text-center">
            Chat-System kommt bald
          </Text>
          <Text className="text-muted-foreground text-center mt-2">
            Hier können Sie bald direkt mit anderen Nutzern kommunizieren
          </Text>
        </View>
      </ScrollView>
    </Container>
  );
}