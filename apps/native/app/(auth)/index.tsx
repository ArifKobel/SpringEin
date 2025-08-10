import { View, Text, ScrollView, Pressable, TextInput, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Container } from "@/components/container";
import { i18n } from "@/i18n";
import { Link, router } from "expo-router";
import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

export default function SignIn() {
  type FormValues = { email: string; password: string };
  const schema: yup.ObjectSchema<FormValues> = yup
    .object({
      email: yup.string().email("Ungültige E-Mail").required("E-Mail ist erforderlich"),
      password: yup.string().min(6, "Mindestens 6 Zeichen").required("Passwort ist erforderlich"),
    })
    .required();
  const { control, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: { email: "", password: "" },
    mode: "onSubmit",
    reValidateMode: "onChange",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuthActions();
  
  const onValidSubmit = async ({ email, password }: FormValues) => {
    setIsLoading(true);
    try {
      await signIn("password", {
        email,
        password,
        flow: "signIn",
      });
    } catch (error) {
      Alert.alert("Anmeldung fehlgeschlagen", "E-Mail oder Passwort ist falsch.");
      console.error("Sign in error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container>
      <KeyboardAwareScrollView keyboardShouldPersistTaps="handled" className="flex-1 p-6">
        <View className="mb-6">
          <Text className="text-4xl font-bold text-foreground mb-2">
            {i18n.t("auth.signIn")}
          </Text>
          <Text className="text-lg text-muted-foreground">
            Melden Sie sich mit Ihrem Account an
          </Text>
        </View>
        <Text className="text-sm font-semibold mb-1">E-Mail</Text>
        <View className={`flex-row items-center border-2 rounded-md px-3 py-3 bg-white ${errors.email ? "border-red-400" : "border-gray-300"}`}>
          <Ionicons name="mail-outline" size={18} color="#6b7280" />
          <Controller
            control={control}
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
                editable={!isLoading}
                autoCapitalize="none"
              />
            )}
          />
        </View>
        {errors.email && (
          <Text className="text-red-500 text-xs mb-2">{errors.email.message}</Text>
        )}
        <Text className="text-sm font-semibold mb-1">Passwort</Text>
        <View className={`flex-row items-center border-2 rounded-md px-3 py-3 mb-1 bg-white ${errors.password ? "border-red-400" : "border-gray-300"}`}>
          <Ionicons name="lock-closed-outline" size={18} color="#6b7280" />
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                placeholder={i18n.t("auth.password")}
                className="ml-2 flex-1"
                secureTextEntry={!showPassword}
                autoComplete="password"
                autoCapitalize="none"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                editable={!isLoading}
              />
            )}
          />
          <Pressable onPress={() => setShowPassword((v) => !v)} className="pl-2">
            <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={18} color="#6b7280" />
          </Pressable>
        </View>
        {errors.password && (
          <Text className="text-red-500 text-xs mb-2">{errors.password.message}</Text>
        )}
        <Text className="text-xs text-gray-500 mb-4">Mindestens 6 Zeichen.</Text>
        
        <Pressable 
          onPress={handleSubmit(onValidSubmit)} 
          disabled={isLoading}
          className={`rounded-md p-2 py-4 mb-4 ${
            isLoading ? "bg-gray-300" : "bg-primary active:bg-primary/90"
          }`}
        >
          <Text className={`text-center font-medium ${
            isLoading ? "text-gray-500" : "text-primary-foreground"
          }`}>
            {isLoading ? "Wird angemeldet..." : i18n.t("auth.signIn")}
          </Text>
        </Pressable>

        <View className="flex-row justify-end mt-4">
          <Link href="/(auth)/register" className="text-primary">
            <Text className="text-primary">{i18n.t("auth.noAccount")}</Text>
          </Link>
        </View>
      </KeyboardAwareScrollView>
    </Container>
  );
}
