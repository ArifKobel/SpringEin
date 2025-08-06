import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Link, Redirect } from "expo-router";
import { Drawer } from "expo-router/drawer";
import { i18n } from "@/i18n";
import { HeaderButton } from "@/components/header-button";
import { useConvexAuth } from "convex/react";
const DrawerLayout = () => {
  const { isLoading, isAuthenticated } = useConvexAuth();
  if (isLoading) {
    return null;
  }
  if (!isAuthenticated) {
    return <Redirect href={"/auth"} />;
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
