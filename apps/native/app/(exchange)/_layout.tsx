import { Drawer } from "expo-router/drawer";
import { api } from "@SpringEin/backend/convex/_generated/api";
import { useQuery } from "convex/react";
import { Redirect, usePathname } from "expo-router";
import { BrandLogo } from "@/components/header-button";
import { DrawerContentScrollView, DrawerItemList, DrawerItem } from "@react-navigation/drawer";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

export default function ExchangeDrawer() {
  const profiles = useQuery(api.profiles.myExchangeProfiles);
  const path = usePathname();
  const insets = useSafeAreaInsets();
  if (profiles === undefined) {
    return null;
  }
  if (!profiles.length && !path.includes("profile/new") && !path.includes("hub")) {
    return <Redirect href="/(exchange)/profile/new" />;
  } 
  return (
    <Drawer
      screenOptions={{ headerTitle: () => <BrandLogo /> }}
      drawerContent={(props) => {
        // hub ans untere Ende verschieben
        const filteredRoutes = props.state.routes.filter((r) => r.name !== "hub");
        const filteredState = {
          ...props.state,
          routes: filteredRoutes,
          index: Math.min(props.state.index, filteredRoutes.length - 1),
        } as typeof props.state;
        return (
          <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1, paddingTop: insets.top }}>
            <View style={{ flex: 1 }}>
              <View style={{ paddingHorizontal: 16, paddingBottom: 12 }}>
                <BrandLogo />
              </View>
              <DrawerItemList {...props} state={filteredState} />
              <View style={{ flex: 1 }} />
              <DrawerItem
                label="Einstellungen"
                onPress={() => props.navigation.navigate("settings" as never)}
                labelStyle={{ fontWeight: "600" }}
                icon={({ color, size }) => (
                  <Ionicons name="settings-outline" size={size} color={color} />
                )}
              />
              <DrawerItem
                label="Profil Wechseln"
                onPress={() => props.navigation.navigate("hub" as never)}
                labelStyle={{ fontWeight: "600" }}
                icon={({ color, size }) => (
                  <Ionicons name="people-outline" size={size} color={color} />
                )}
              />
            </View>
          </DrawerContentScrollView>
        );
      }}
    >
      <Drawer.Screen name="home" options={{ headerTitle: "Übersicht", drawerLabel: "Übersicht", drawerIcon: ({ color, size }) => (<Ionicons name="home-outline" size={size} color={color} />) }} />
      <Drawer.Screen name="profile/new" options={{ headerTitle: "Kindertagesstätte-Profil anlegen", drawerItemStyle: { display: "none" } }} />
      <Drawer.Screen name="profile/edit" options={{ headerTitle: "Kindertagesstätte-Profil bearbeiten", drawerItemStyle: { display: "none" } }} />
      <Drawer.Screen name="requests/new" options={{ headerTitle: "Vertretung anfragen", drawerLabel: "Vertretung anfragen", drawerIcon: ({ color, size }) => (<Ionicons name="add-circle-outline" size={size} color={color} />) }} />
      <Drawer.Screen name="requests/index" options={{ headerTitle: "Meine Anfragen", drawerLabel: "Meine Anfragen", drawerIcon: ({ color, size }) => (<Ionicons name="list-outline" size={size} color={color} />) }} />
      <Drawer.Screen name="requests/[id]" options={{ headerTitle: "Anfrage", drawerItemStyle: { display: "none" } }} />
      <Drawer.Screen name="applications/[id]" options={{ headerTitle: "Bewerbungsdetails", drawerItemStyle: { display: "none" } }} />
      <Drawer.Screen name="provider/[id]" options={{ headerTitle: "Anbieter-Profil", drawerItemStyle: { display: "none" } }} />   
      <Drawer.Screen name="hub" options={{ headerTitle: "Profile", drawerLabel: "Profile", drawerItemStyle: { marginTop: 'auto' } }} />
    </Drawer>
  );
}
