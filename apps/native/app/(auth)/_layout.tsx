import { Stack } from "expo-router";
import { i18n } from "@/i18n";
import { useConvexAuth } from "convex/react";
import { Redirect } from "expo-router";
const DrawerLayout = () => {
  const { isLoading, isAuthenticated } = useConvexAuth();
  if (isLoading) {
    return null;
  }
  if (isAuthenticated) {
    console.log("isAuthenticated");
    return <Redirect href={"/(drawer)"} />;
  }
  return (
    <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ title: i18n.t("auth.signIn") }} />
        <Stack.Screen name="account-type" options={{ title: i18n.t("auth.chooseAccountType") }} />
        <Stack.Screen name="register" options={{ title: i18n.t("auth.signUp") }} />
        <Stack.Screen name="forgot-password" options={{ headerShown: true, title: i18n.t("auth.forgotPassword") }} />
    </Stack>
  );
};

export default DrawerLayout;
