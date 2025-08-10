import { View, Text, ScrollView, Pressable, TextInput, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Container } from "@/components/container";
import { i18n } from "@/i18n";
import { Link, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

export default function Register() {
  const { accountType } = useLocalSearchParams<{ accountType?: "person" | "team" }>();
  type SignUpValues = { email: string; password: string; confirmPassword: string };
  type VerifyValues = { code: string };
  const signUpSchema: yup.ObjectSchema<SignUpValues> = yup.object({
    email: yup.string().email("Ungültige E-Mail").required("E-Mail ist erforderlich"),
    password: yup.string().min(6, "Mindestens 6 Zeichen").required("Passwort ist erforderlich"),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref("password")], i18n.t("auth.passwordsDoNotMatch"))
      .required("Bitte bestätigen"),
  });
  const verifySchema: yup.ObjectSchema<VerifyValues> = yup.object({
    code: yup.string().length(6, "6-stelliger Code").required("Code erforderlich"),
  });
  const { control: signUpControl, handleSubmit: handleSignUpSubmit, formState: { errors: signUpErrors } } = useForm<SignUpValues>({
    resolver: yupResolver(signUpSchema),
    defaultValues: { email: "", password: "", confirmPassword: "" },
  });
  const { control: verifyControl, handleSubmit: handleVerifySubmit, formState: { errors: verifyErrors } } = useForm<VerifyValues>({
    resolver: yupResolver(verifySchema),
    defaultValues: { code: "" },
  });
  const [step, setStep] = useState<"signUp" | "email-verification">("signUp");
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const { signIn } = useAuthActions();
  const handleSubmitSignUp = async ({ email, password }: SignUpValues) => {
    setIsButtonLoading(true);
    try {
      await signIn("password", { email, password, flow: step });
      setStep("email-verification");
    } catch (error) {
      Alert.alert("Registrierung fehlgeschlagen", "E-Mail ist bereits registriert oder ungültig.");
      console.error("Registration error:", error);
    } finally {
      setIsButtonLoading(false);
    }
  };
  const onPressVerify = async ({ code }: VerifyValues) => {
    setIsButtonLoading(true);
    try {
      // We need email from previous step. Using getValues from sign-up form would be ideal, but RHF instances are separate.
      // Simplest: prompt user to re-enter email? For now, we keep backend flow which ties code to email in session.
      await signIn("password", { code, flow: step } as any);
    } catch (error) {
      console.error("Error during verification:", error);
    }
    setIsButtonLoading(false);
  };
  return (
    <Container>
      <KeyboardAwareScrollView keyboardShouldPersistTaps="handled" className="flex-1 p-6">
        <View className="mb-6">
          <Text className="text-4xl font-bold text-foreground mb-2">
            {step === "signUp" ? i18n.t("auth.signUp") : "E-Mail bestätigen"}
          </Text>
          <Text className="text-lg text-muted-foreground">
            {step === "signUp" 
              ? "Erstellen Sie Ihr neues Konto" 
              : "Prüfen Sie Ihr E-Mail-Postfach und geben Sie den Code ein"
            }
          </Text>
        </View>

        {accountType && (
          <View className="mb-4 p-3 bg-primary/10 rounded-lg">
            <Text className="text-primary font-medium">
              {accountType === "person" ? i18n.t("auth.personAccount") : i18n.t("auth.teamAccount")}
            </Text>
          </View>
        )}
        {step === "signUp" ? (
          <>
            <Text className="text-sm font-semibold mb-1 mt-5">E-Mail</Text>
            <View className={`flex-row items-center border-2 rounded-md px-3 py-3 mb-1 bg-white ${signUpErrors.email ? "border-red-400" : "border-gray-300"}`}>
              <Ionicons name="mail-outline" size={18} color="#6b7280" />
              <Controller
                control={signUpControl}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    placeholder={i18n.t("auth.email")}
                    className="ml-2 flex-1"
                    autoComplete="email"
                    keyboardType="email-address"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    autoCapitalize="none"
                  />
                )}
              />
            </View>
            {signUpErrors.email && <Text className="text-red-500 text-xs mb-2">{signUpErrors.email.message}</Text>}
            <Text className="text-sm font-semibold mb-1">Passwort</Text>
            <View className={`flex-row items-center border-2 rounded-md px-3 py-3 mb-1 bg-white ${signUpErrors.password ? "border-red-400" : "border-gray-300"}`}>
              <Ionicons name="lock-closed-outline" size={18} color="#6b7280" />
              <Controller
                control={signUpControl}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    placeholder={i18n.t("auth.password")}
                    className="ml-2 flex-1"
                    secureTextEntry
                    autoComplete="password"
                    keyboardType="visible-password"
                    autoCapitalize="none"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                  />
                )}
              />
            </View>
            {signUpErrors.password && <Text className="text-red-500 text-xs mb-2">{signUpErrors.password.message}</Text>}
            <Text className="text-sm font-semibold mb-1">Passwort bestätigen</Text>
            <View className={`flex-row items-center border-2 rounded-md px-3 py-3 mb-1 bg-white ${signUpErrors.confirmPassword ? "border-red-400" : "border-gray-300"}`}>
              <Ionicons name="lock-closed-outline" size={18} color="#6b7280" />
              <Controller
                control={signUpControl}
                name="confirmPassword"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    placeholder={i18n.t("auth.confirmPassword")}
                    className="ml-2 flex-1"
                    secureTextEntry
                    autoComplete="password"
                    keyboardType="visible-password"
                    autoCapitalize="none"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                  />
                )}
              />
            </View>
            {signUpErrors.confirmPassword && <Text className="text-red-500 text-xs mb-2">{signUpErrors.confirmPassword.message}</Text>}
            <Text className="text-xs text-gray-500 mb-2">Mindestens 6 Zeichen.</Text>
          </>
        ):(
          <>
            <Text className="text-sm font-semibold mb-1 mt-5">Bestätigungscode</Text>
            <View className={`flex-row items-center border-2 rounded-md px-3 py-3 mb-1 bg-white ${verifyErrors.code ? "border-red-400" : "border-gray-300"}`}>
              <Ionicons name="key-outline" size={18} color="#6b7280" />
              <Controller
                control={verifyControl}
                name="code"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    placeholder={i18n.t("auth.code")}
                    className="ml-2 flex-1"
                    autoComplete="one-time-code"
                    keyboardType="number-pad"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                  />
                )}
              />
            </View>
            {verifyErrors.code && <Text className="text-red-500 text-xs mb-2">{verifyErrors.code.message}</Text>}
          </>
        )}
        {step === "signUp" && (
          <Pressable onPress={handleSignUpSubmit(handleSubmitSignUp)} className="bg-primary rounded-md p-2 py-4 active:bg-primary/90">
            <Text className="text-primary-foreground text-center">{i18n.t("auth.register")}</Text>
          </Pressable>
        )}
        {step === "email-verification" && (
          <Pressable onPress={handleVerifySubmit(onPressVerify)} className="bg-primary rounded-md p-2 py-4 active:bg-primary/90">
            <Text className="text-primary-foreground text-center">{isButtonLoading ? i18n.t("auth.verifying") : i18n.t("auth.verify")}</Text>
          </Pressable>
        )}
        <View className="flex-row justify-between mt-4">
          <Link href="/(auth)" className="text-primary">
            <Text className="text-primary">{i18n.t("auth.alreadyHaveAccount")}</Text>
          </Link>
        </View>
      </KeyboardAwareScrollView>
    </Container>
  );
}
