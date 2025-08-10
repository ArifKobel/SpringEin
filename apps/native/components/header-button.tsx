import FontAwesome from "@expo/vector-icons/FontAwesome";
import { forwardRef } from "react";
import { Pressable, View, Text } from "react-native";
import { Link, usePathname } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export const HeaderButton = forwardRef<
  typeof Pressable,
  { onPress?: () => void }
>(({ onPress }, ref) => {
  return (
    <Pressable
      onPress={onPress}
      className="p-2 mr-2 rounded-lg bg-secondary/50 active:bg-secondary"
    >
      {({ pressed }) => (
        <FontAwesome
          name="info-circle"
          size={20}
          className="text-secondary-foreground"
          style={{
            opacity: pressed ? 0.7 : 1,
          }}
        />
      )}
    </Pressable>
  );
});

export function BrandLogo({ size = 20 }: { size?: number }) {
  const path = usePathname();
  const isHub = path === "/hub";
  return (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
      <View style={{ flexDirection: "row", alignItems: "center", marginRight: "auto" }}>
        <View
          style={{
            width: size + 8,
            height: size + 8,
            backgroundColor: "#111827",
            borderRadius: 8,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: "white", fontWeight: "900" }}>S</Text>
        </View>
        <Text style={{ marginLeft: 8, fontWeight: "800" }}>SpringEin</Text>
      </View>
      {!isHub && (
        <Link href="/hub" asChild>
          <Pressable className="p-2 mr-2 rounded-lg bg-secondary/50 active:bg-secondary" style={{ marginLeft: "auto" }}>
            <Ionicons name="person-circle-outline" size={20} className="text-secondary-foreground" />
          </Pressable>
        </Link>
      )}
    </View>
  );
}
