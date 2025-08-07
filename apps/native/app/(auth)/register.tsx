import { View, Text, ScrollView, Pressable, TextInput, Alert } from "react-native";
import { Container } from "@/components/container";
import { i18n } from "@/i18n";
import { Link, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useMutation } from "convex/react";
import { api } from "@SpringEin/backend/convex/_generated/api";

export default function Register() {
  const { accountType } = useLocalSearchParams<{ accountType?: "person" | "team" }>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); 
  const [step, setStep] = useState<"signUp" | "email-verification">("signUp");
  const [code, setCode] = useState("");
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const { signIn } = useAuthActions();
  const createAccount = useMutation(api.accounts.create);
  const handleSubmit = async () => {
    if (password !== confirmPassword) {
      Alert.alert(i18n.t("auth.passwordsDoNotMatch"));
      return;
    }
    await signIn("password", {
      email,
      password,
      flow: step,
    }).then(() => setStep("email-verification"));
  };
  const onPressVerify = async () => {
    setIsButtonLoading(true);
    try {
      await signIn("password", {
        email,
        code,
        flow: step,
      });

      // Create account immediately after successful verification if accountType is provided
      if (accountType) {
        await createAccount({ accountType });
      }
    } catch (error) {
      console.error("Error during verification:", error);
    }
    setIsButtonLoading(false);
  };
  return (
    <Container>
      <ScrollView className="flex-1 p-6">
        <Text className="text-4xl font-bold text-foreground mb-2">{i18n.t("auth.signUp")}</Text>
        {accountType && (
          <View className="mb-4 p-3 bg-primary/10 rounded-lg">
            <Text className="text-primary font-medium">
              {accountType === "person" ? i18n.t("auth.personAccount") : i18n.t("auth.teamAccount")}
            </Text>
          </View>
        )}
        {step === "signUp" ? (
          <>
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
        <TextInput
          placeholder={i18n.t("auth.confirmPassword")}
          className="border-2 border-gray-300 rounded-md p-2 py-4 mb-2"
          secureTextEntry
          autoComplete="password"
          keyboardType="visible-password"
          autoCapitalize="none"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
          </>
        ):(
          <>
          <TextInput
            placeholder={i18n.t("auth.code")}
            className="border-2 border-gray-300 rounded-md p-2 py-4 mb-2 mt-5"
            autoComplete="one-time-code"
            keyboardType="number-pad"
            value={code}
            onChangeText={setCode}
          />
          </>
        )}
        {step === "signUp" && (
          <Pressable onPress={handleSubmit} className="bg-primary rounded-md p-2 py-4 active:bg-primary/90">
            <Text className="text-primary-foreground text-center">{i18n.t("auth.register")}</Text>
          </Pressable>
        )}
        {step === "email-verification" && (
          <Pressable onPress={onPressVerify} className="bg-primary rounded-md p-2 py-4 active:bg-primary/90">
            <Text className="text-primary-foreground text-center">{isButtonLoading ? i18n.t("auth.verifying") : i18n.t("auth.verify")}</Text>
          </Pressable>
        )}
        <View className="flex-row justify-between mt-4">
          <Link href="/(auth)" className="text-primary">
            <Text className="text-primary">{i18n.t("auth.alreadyHaveAccount")}</Text>
          </Link>
        </View>
      </ScrollView>
    </Container>
  );
}
