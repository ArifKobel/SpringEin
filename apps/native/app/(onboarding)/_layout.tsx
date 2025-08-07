import { Stack } from "expo-router";
import { useConvexAuth } from "convex/react";
import { Redirect } from "expo-router";
import { i18n } from "@/i18n";

const OnboardingLayout = () => {
  const { isLoading, isAuthenticated } = useConvexAuth();
  
  if (isLoading) {
    return null;
  }
  
  if (!isAuthenticated) {
    return <Redirect href={"/(auth)"} />;
  }

  return (
    <Stack>
      <Stack.Screen 
        name="welcome" 
        options={{ 
          headerShown: false, 
          title: i18n.t("onboarding.welcome") 
        }} 
      />
      <Stack.Screen 
        name="person-profile" 
        options={{ 
          headerShown: false, 
          title: i18n.t("profile.createProfile") 
        }} 
      />
      <Stack.Screen 
        name="team-profile" 
        options={{ 
          headerShown: false, 
          title: i18n.t("profile.createProfile") 
        }} 
      />
    </Stack>
  );
};

export default OnboardingLayout;