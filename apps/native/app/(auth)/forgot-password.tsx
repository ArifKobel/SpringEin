import { View, Text, ScrollView, TextInput, Pressable } from "react-native";
import { Container } from "@/components/container";
import { i18n } from "@/i18n";
import { Link } from "expo-router";

export default function ForgotPassword() {
  return (
    <Container>
      <ScrollView className="flex-1 p-6">
        <TextInput
          placeholder="Email"
          className="border-2 border-gray-300 rounded-md p-2 py-4 mb-2"
          autoComplete="email"
          keyboardType="email-address"
        />
        <Pressable onPress={() => {}} className="bg-primary rounded-md p-2 py-4 active:bg-primary/90">
          <Text className="text-primary-foreground text-center">{i18n.t("auth.sendResetEmail")}</Text>
        </Pressable>
      </ScrollView>
    </Container>
  );
}