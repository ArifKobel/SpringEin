import { View, Text, ScrollView, Pressable } from "react-native";
import { Container } from "@/components/container";
import { useQuery } from "convex/react";
import { api } from "@SpringEin/backend/convex/_generated/api";
import { AccountTypeRouter } from "@/components/account-type-router";
import { i18n } from "@/i18n";
import { Ionicons } from "@expo/vector-icons";
import { useAuthActions } from "@convex-dev/auth/react";

export default function Profile() {
  const account = useQuery(api.accounts.getCurrent);
  const personProfile = useQuery(api.personProfiles.getCurrent);
  const teamProfile = useQuery(api.teamProfiles.getCurrent);
  const { signOut } = useAuthActions();

  // Show account type router if no account
  if (account === undefined) {
    return <AccountTypeRouter />;
  }

  if (!account) {
    return <AccountTypeRouter />;
  }

  const isTeam = account.accountType === "team";
  const profile = isTeam ? teamProfile : personProfile;

  return (
    <Container>
      <ScrollView className="flex-1 p-6">
        <View className="mb-6">
          <Text className="text-3xl font-bold text-foreground mb-2">
            {i18n.t("profile.title")}
          </Text>
          <Text className="text-lg text-muted-foreground">
            {isTeam ? "Team-Account" : "Person-Account"}
          </Text>
        </View>

        {profile ? (
          <View className="space-y-4">
            {/* Profile Info Card */}
            <View className="bg-white rounded-xl p-6 border border-gray-200">
              <View className="flex-row items-center mb-4">
                <View className="w-16 h-16 bg-primary/10 rounded-full items-center justify-center mr-4">
                  <Ionicons 
                    name={isTeam ? "business" : "person"} 
                    size={32} 
                    color="#3b82f6" 
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-xl font-semibold text-foreground">
                    {isTeam ? teamProfile?.facilityName : personProfile?.name}
                  </Text>
                  <Text className="text-muted-foreground">
                    PLZ: {isTeam ? teamProfile?.postalCode : personProfile?.postalCode}
                  </Text>
                </View>
              </View>

              {(isTeam ? teamProfile?.description : personProfile?.bio) && (
                <Text className="text-muted-foreground mb-4">
                  {isTeam ? teamProfile?.description : personProfile?.bio}
                </Text>
              )}

              {isTeam && teamProfile && (
                <View className="space-y-2">
                  <View className="flex-row items-center">
                    <Ionicons name="location-outline" size={16} color="#6b7280" />
                    <Text className="text-muted-foreground ml-2">{teamProfile.address}</Text>
                  </View>
                  <View className="flex-row items-center">
                    <Ionicons name="call-outline" size={16} color="#6b7280" />
                    <Text className="text-muted-foreground ml-2">{teamProfile.phone}</Text>
                  </View>
                  <View className="flex-row items-center">
                    <Ionicons name="person-outline" size={16} color="#6b7280" />
                    <Text className="text-muted-foreground ml-2">{teamProfile.contactPersonName}</Text>
                  </View>
                </View>
              )}

              {!isTeam && personProfile && (
                <View className="space-y-2">
                  {personProfile.phone && personProfile.sharePhone && (
                    <View className="flex-row items-center">
                      <Ionicons name="call-outline" size={16} color="#6b7280" />
                      <Text className="text-muted-foreground ml-2">{personProfile.phone}</Text>
                    </View>
                  )}
                  <View className="flex-row items-center">
                    <Ionicons name="car-outline" size={16} color="#6b7280" />
                    <Text className="text-muted-foreground ml-2">
                      Max. {personProfile.maxTravelDistance} km Reiseentfernung
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <Ionicons name="people-outline" size={16} color="#6b7280" />
                    <Text className="text-muted-foreground ml-2">
                      Altersgruppen: {personProfile.ageGroups.join(", ")}
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {/* Actions */}
            <View className="space-y-3">
              <Pressable className="bg-primary/10 rounded-xl p-4 flex-row items-center active:bg-primary/20">
                <Ionicons name="pencil" size={20} color="#3b82f6" />
                <Text className="text-primary font-medium ml-3">
                  {i18n.t("profile.editProfile")}
                </Text>
              </Pressable>

              <Pressable 
                onPress={() => signOut()}
                className="bg-red-50 rounded-xl p-4 flex-row items-center active:bg-red-100"
              >
                <Ionicons name="log-out-outline" size={20} color="#ef4444" />
                <Text className="text-red-600 font-medium ml-3">
                  Abmelden
                </Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <View className="bg-gray-50 rounded-xl p-6 items-center">
            <Ionicons name="person-outline" size={48} color="#9ca3af" />
            <Text className="text-muted-foreground text-center mt-2">
              Profil wird geladen...
            </Text>
          </View>
        )}
      </ScrollView>
    </Container>
  );
}