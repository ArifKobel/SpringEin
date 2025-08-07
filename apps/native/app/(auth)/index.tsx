import { View, Text, ScrollView, Pressable, TextInput } from "react-native";
import { Container } from "@/components/container";
import { i18n } from "@/i18n";
import { Link, router } from "expo-router";
import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { signIn } = useAuthActions();
  const handleSubmit = async () => {
    await signIn("password", {
      email,
      password,
      flow: "signIn",
    });
  };

  return (
    <Container>
      <ScrollView className="flex-1 p-6">
        <Text className="text-4xl font-bold text-foreground mb-2">{i18n.t("auth.signIn")}</Text>
        <TextInput
          placeholder={i18n.t("auth.email")}
          className="border-2 border-gray-300 rounded-md p-2 py-4 mb-2 mt-5"
          autoComplete="email"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          placeholder={i18n.t("auth.password")}
          className="border-2 border-gray-300 rounded-md p-2 py-4 mb-2"
          secureTextEntry
          autoComplete="password"
          keyboardType="visible-password"
          autoCapitalize="none"
          value={password}
          onChangeText={setPassword}
        />
        <Pressable onPress={handleSubmit} className="bg-primary rounded-md p-2 py-4 active:bg-primary/90">
          <Text className="text-primary-foreground text-center">{i18n.t("auth.signIn")}</Text>
        </Pressable>
        <View className="flex-row justify-between mt-4">
          <Link href="/(auth)/account-type" className="text-primary">
            <Text className="text-primary">{i18n.t("auth.noAccount")}</Text>
          </Link>
          <Link href="/(auth)/forgot-password" className="text-primary">
            <Text className="text-primary">{i18n.t("auth.forgotPassword")}</Text>
          </Link>
        </View>
      </ScrollView>
    </Container>
  );
}
