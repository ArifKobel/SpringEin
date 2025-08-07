import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Link, Redirect } from "expo-router";
import { Drawer } from "expo-router/drawer";
import { i18n } from "@/i18n";
import { HeaderButton } from "@/components/header-button";
import { useConvexAuth } from "convex/react";
import { AccountTypeRouter } from "@/components/account-type-router";

const DrawerLayout = () => {
  const { isLoading, isAuthenticated } = useConvexAuth();
  
  if (isLoading) {
    return null;
  }
  
  if (!isAuthenticated) {
    return <Redirect href={"/(auth)"} />;
  }

  return (
    <Drawer>
      <Drawer.Screen
        name="index"
        options={{
          headerTitle: "Home",
          drawerLabel: "Home",
          drawerIcon: ({ size, color }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="jobs"
        options={{
          headerTitle: i18n.t('jobs.title'),
          drawerLabel: i18n.t('jobs.title'),
          drawerIcon: ({ size, color }) => (
            <Ionicons name="briefcase-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="chat"
        options={{
          headerTitle: i18n.t('chat.title'),
          drawerLabel: i18n.t('chat.title'),
          drawerIcon: ({ size, color }) => (
            <Ionicons name="chatbubble-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="profile"
        options={{
          headerTitle: i18n.t('profile.title'),
          drawerLabel: i18n.t('profile.title'),
          drawerIcon: ({ size, color }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="settings"
        options={{
          headerTitle: i18n.t('settings.title'),
          drawerLabel: i18n.t('settings.title'),
          drawerIcon: ({ size, color }) => (
            <MaterialIcons name="settings" size={size} color={color} />
          ),
        }}
      />
    </Drawer>
  );
};

export default DrawerLayout;
