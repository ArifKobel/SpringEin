import { View, Text, ScrollView, Pressable, TextInput, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Container } from "@/components/container";
import { i18n } from "@/i18n";
import { Link, router } from "expo-router";
import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuthActions();
  
  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Fehler", "Bitte füllen Sie alle Felder aus.");
      return;
    }

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
      <ScrollView className="flex-1 p-6">
        <View className="mb-6">
          <Text className="text-4xl font-bold text-foreground mb-2">
            {i18n.t("auth.signIn")}
          </Text>
          <Text className="text-lg text-muted-foreground">
            Melden Sie sich mit Ihrem Account an
          </Text>
        </View>
        <Text className="text-sm font-semibold mb-1">E-Mail</Text>
        <View className="flex-row items-center border-2 border-gray-300 rounded-md px-3 py-3 mb-3 bg-white">
          <Ionicons name="mail-outline" size={18} color="#6b7280" />
          <TextInput
            placeholder={i18n.t("auth.email")}
            className="ml-2 flex-1"
            autoComplete="email"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            editable={!isLoading}
          />
        </View>
        <Text className="text-sm font-semibold mb-1">Passwort</Text>
        <View className="flex-row items-center border-2 border-gray-300 rounded-md px-3 py-3 mb-1 bg-white">
          <Ionicons name="lock-closed-outline" size={18} color="#6b7280" />
          <TextInput
            placeholder={i18n.t("auth.password")}
            className="ml-2 flex-1"
            secureTextEntry={!showPassword}
            autoComplete="password"
            autoCapitalize="none"
            value={password}
            onChangeText={setPassword}
            editable={!isLoading}
          />
          <Pressable onPress={() => setShowPassword((v) => !v)} className="pl-2">
            <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={18} color="#6b7280" />
          </Pressable>
        </View>
        <Text className="text-xs text-gray-500 mb-4">Mindestens 6 Zeichen.</Text>
        
        <Pressable 
          onPress={handleSubmit} 
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
      </ScrollView>
    </Container>
  );
}
