import { Container } from "@/components/container";
import { Button, ScrollView, Text, View } from "react-native";
import { useAuthActions } from "@convex-dev/auth/react";

export default function Settings() {
  const { signOut } = useAuthActions();
  return (
    <Container>
      <ScrollView className="flex-1 p-6">
        <View className="">
          <Text className="text-3xl font-bold text-foreground mb-2">
            Tab One
          </Text>
          <Text className="text-lg text-muted-foreground">
            Explore the first section of your app
          </Text>
          <Button
            title="Sign Out"
            onPress={() => {
              signOut();
            }}
          />
        </View>
      </ScrollView>
    </Container>
  );
}
