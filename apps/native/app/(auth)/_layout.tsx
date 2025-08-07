import { Stack } from "expo-router";
import { i18n } from "@/i18n";
import { useConvexAuth } from "convex/react";
import { Redirect } from "expo-router";
import { useQuery } from "convex/react";
import { api } from "@SpringEin/backend/convex/_generated/api";
const DrawerLayout = () => {
  const { isLoading, isAuthenticated } = useConvexAuth();
  if (isLoading) {
    return null;
  }
  if (isAuthenticated) {
    return <Redirect href={"/hub"} />;
  }
  return (
    <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ title: i18n.t("auth.signIn") }} />
        <Stack.Screen name="register" options={{ title: i18n.t("auth.signUp") }} />
    </Stack>
  );
};

export default DrawerLayout;
