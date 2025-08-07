import { View, Text, ScrollView, Pressable, RefreshControl, Alert, TextInput, Modal } from "react-native";
import { Container } from "@/components/container";
import { useQuery, useMutation } from "convex/react";
import { api } from "@SpringEin/backend/convex/_generated/api";
import { AccountTypeRouter } from "@/components/account-type-router";
import { i18n } from "@/i18n";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

export default function Jobs() {
  const [refreshing, setRefreshing] = useState(false);
  const [applicationModal, setApplicationModal] = useState<{
    visible: boolean;
    jobId: string | null;
    jobTitle: string;
  }>({
    visible: false,
    jobId: null,
    jobTitle: "",
  });
  const [applicationMessage, setApplicationMessage] = useState("");
  const [isApplying, setIsApplying] = useState(false);

  const account = useQuery(api.accounts.getCurrent);
  const myJobs = useQuery(api.jobPostings.getMy);
  const availableJobs = useQuery(api.jobPostings.getAvailable);
  const myApplications = useQuery(api.applications.getMy);
  
  const applyToJob = useMutation(api.applications.create);

  // Show account type router if no account
  if (account === undefined) {
    return <AccountTypeRouter />;
  }

  if (!account) {
    return <AccountTypeRouter />;
  }

  const onRefresh = async () => {
    setRefreshing(true);
    // Trigger refetch by updating state
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleApplyToJob = (jobId: string, jobTitle: string) => {
    setApplicationModal({
      visible: true,
      jobId,
      jobTitle,
    });
  };

  const submitApplication = async () => {
    if (!applicationModal.jobId) return;

    setIsApplying(true);
    try {
      await applyToJob({
        jobPostingId: applicationModal.jobId as any,
        message: applicationMessage || undefined,
      });

      Alert.alert("Erfolg", "Bewerbung wurde erfolgreich eingereicht!");
      setApplicationModal({ visible: false, jobId: null, jobTitle: "" });
      setApplicationMessage("");
    } catch (error) {
      Alert.alert("Fehler", "Bewerbung konnte nicht eingereicht werden.");
      console.error("Error applying to job:", error);
    } finally {
      setIsApplying(false);
    }
  };

  const isTeam = account.accountType === "team";

  return (
    <Container>
      <ScrollView 
        className="flex-1 p-6"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="mb-6">
          <Text className="text-3xl font-bold text-foreground mb-2">
            {i18n.t("jobs.title")}
          </Text>
          <Text className="text-lg text-muted-foreground">
            {isTeam ? "Verwalten Sie Ihre Stellenanzeigen" : "Finden Sie passende Stellen"}
          </Text>
        </View>

        {isTeam ? (
          <TeamJobsView myJobs={myJobs} />
        ) : (
          <PersonJobsView 
            availableJobs={availableJobs} 
            myApplications={myApplications}
            onApply={handleApplyToJob}
          />
        )}
      </ScrollView>

      {/* Application Modal */}
      <Modal
        visible={applicationModal.visible}
        transparent
        animationType="slide"
        onRequestClose={() => setApplicationModal({ visible: false, jobId: null, jobTitle: "" })}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6 max-h-96">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xl font-semibold text-foreground">
                Bewerbung senden
              </Text>
              <Pressable
                onPress={() => setApplicationModal({ visible: false, jobId: null, jobTitle: "" })}
                className="p-2"
              >
                <Ionicons name="close" size={24} color="#6b7280" />
              </Pressable>
            </View>

            <Text className="text-base text-muted-foreground mb-4">
              Bewerbung für: {applicationModal.jobTitle}
            </Text>

            <TextInput
              value={applicationMessage}
              onChangeText={setApplicationMessage}
              placeholder="Nachricht an den Arbeitgeber (optional)"
              multiline
              numberOfLines={4}
              className="border-2 border-gray-200 rounded-xl p-4 bg-white text-foreground mb-4"
              textAlignVertical="top"
            />

            <View className="flex-row space-x-3">
              <Pressable
                onPress={() => setApplicationModal({ visible: false, jobId: null, jobTitle: "" })}
                className="flex-1 bg-gray-100 rounded-xl p-4 active:bg-gray-200"
              >
                <Text className="text-gray-700 text-center font-medium">
                  Abbrechen
                </Text>
              </Pressable>

              <Pressable
                onPress={submitApplication}
                disabled={isApplying}
                className={`flex-1 rounded-xl p-4 ${
                  isApplying
                    ? "bg-gray-300"
                    : "bg-primary active:bg-primary/90"
                }`}
              >
                <Text className={`text-center font-medium ${
                  isApplying ? "text-gray-500" : "text-primary-foreground"
                }`}>
                  {isApplying ? "Wird gesendet..." : "Bewerben"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </Container>
  );
}

// Team view - showing their job postings
function TeamJobsView({ myJobs }: { myJobs: any[] | undefined }) {
  return (
    <>
      {/* Create Job Button */}
      <Pressable
        onPress={() => router.push("/(drawer)/create-job" as any)}
        className="bg-primary rounded-xl p-4 mb-6 flex-row items-center justify-center active:bg-primary/90"
      >
        <Ionicons name="add" size={24} color="white" className="mr-2" />
        <Text className="text-primary-foreground text-lg font-semibold ml-2">
          {i18n.t("jobs.createJob")}
        </Text>
      </Pressable>

      {/* My Jobs */}
      <View className="mb-6">
        <Text className="text-xl font-semibold text-foreground mb-4">
          {i18n.t("jobs.myJobs")}
        </Text>
        
        {myJobs === undefined ? (
          <View className="bg-gray-50 rounded-xl p-6 items-center">
            <Text className="text-muted-foreground">Laden...</Text>
          </View>
        ) : myJobs.length === 0 ? (
          <View className="bg-gray-50 rounded-xl p-6 items-center">
            <Ionicons name="briefcase-outline" size={48} color="#9ca3af" />
            <Text className="text-muted-foreground text-center mt-2">
              Sie haben noch keine Stellenanzeigen erstellt
            </Text>
          </View>
        ) : (
          <View className="space-y-3">
            {myJobs.map((job) => (
              <JobCard key={job._id} job={job} isOwner={true} />
            ))}
          </View>
        )}
      </View>
    </>
  );
}

// Person view - showing available jobs and applications
function PersonJobsView({ 
  availableJobs, 
  myApplications,
  onApply 
}: { 
  availableJobs: any[] | undefined;
  myApplications: any[] | undefined;
  onApply: (jobId: string, jobTitle: string) => void;
}) {
  return (
    <>
      {/* My Applications */}
      <View className="mb-6">
        <Text className="text-xl font-semibold text-foreground mb-4">
          Meine Bewerbungen
        </Text>
        
        {myApplications === undefined ? (
          <View className="bg-gray-50 rounded-xl p-6 items-center">
            <Text className="text-muted-foreground">Laden...</Text>
          </View>
        ) : myApplications.length === 0 ? (
          <View className="bg-gray-50 rounded-xl p-6 items-center">
            <Ionicons name="document-outline" size={48} color="#9ca3af" />
            <Text className="text-muted-foreground text-center mt-2">
              Sie haben noch keine Bewerbungen eingereicht
            </Text>
          </View>
        ) : (
          <View className="space-y-3">
            {myApplications.slice(0, 3).map((application) => (
              <ApplicationCard key={application._id} application={application} />
            ))}
            {myApplications.length > 3 && (
              <Pressable className="bg-gray-100 rounded-xl p-3 items-center active:bg-gray-200">
                <Text className="text-muted-foreground">
                  +{myApplications.length - 3} weitere Bewerbungen anzeigen
                </Text>
              </Pressable>
            )}
          </View>
        )}
      </View>

      {/* Available Jobs */}
      <View className="mb-6">
        <Text className="text-xl font-semibold text-foreground mb-4">
          Verfügbare Stellen
        </Text>
        
        {availableJobs === undefined ? (
          <View className="bg-gray-50 rounded-xl p-6 items-center">
            <Text className="text-muted-foreground">Laden...</Text>
          </View>
        ) : availableJobs.length === 0 ? (
          <View className="bg-gray-50 rounded-xl p-6 items-center">
            <Ionicons name="search-outline" size={48} color="#9ca3af" />
            <Text className="text-muted-foreground text-center mt-2">
              Keine verfügbaren Stellen gefunden
            </Text>
          </View>
        ) : (
          <View className="space-y-3">
            {availableJobs.map((job) => (
              <JobCard 
                key={job._id} 
                job={job} 
                isOwner={false} 
                onApply={onApply}
                hasApplied={myApplications?.some(app => app.jobPostingId === job._id)}
              />
            ))}
          </View>
        )}
      </View>
    </>
  );
}

// Application Card Component
function ApplicationCard({ application }: { application: any }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "accepted": return "bg-green-100 text-green-800";
      case "rejected": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending": return "Ausstehend";
      case "accepted": return "Angenommen";
      case "rejected": return "Abgelehnt";
      default: return status;
    }
  };

  return (
    <View className="bg-white border border-gray-200 rounded-xl p-4">
      <View className="flex-row justify-between items-start mb-2">
        <Text className="text-lg font-semibold text-foreground flex-1 mr-2">
          {application.job?.title || "Unbekannte Stelle"}
        </Text>
        <View className={`px-3 py-1 rounded-full ${getStatusColor(application.status)}`}>
          <Text className="text-xs font-medium">
            {getStatusText(application.status)}
          </Text>
        </View>
      </View>

      {application.teamProfile && (
        <Text className="text-muted-foreground mb-2">
          {application.teamProfile.facilityName}
        </Text>
      )}

      <Text className="text-sm text-muted-foreground">
        Beworben am: {new Date(application.appliedAt).toLocaleDateString('de-DE')}
      </Text>

      {application.respondedAt && (
        <Text className="text-sm text-muted-foreground">
          Antwort am: {new Date(application.respondedAt).toLocaleDateString('de-DE')}
        </Text>
      )}
    </View>
  );
}

// Job Card Component
function JobCard({ 
  job, 
  isOwner, 
  onApply,
  hasApplied 
}: { 
  job: any; 
  isOwner: boolean;
  onApply?: (jobId: string, jobTitle: string) => void;
  hasApplied?: boolean;
}) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "open": return "bg-green-100 text-green-800";
      case "inProgress": return "bg-blue-100 text-blue-800";
      case "completed": return "bg-gray-100 text-gray-800";
      case "expired": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "open": return "Offen";
      case "inProgress": return "In Bearbeitung";
      case "completed": return "Abgeschlossen";
      case "expired": return "Abgelaufen";
      default: return status;
    }
  };

  return (
    <Pressable
      onPress={() => {
        // Navigate to job details
        console.log("Navigate to job details:", job._id);
      }}
      className="bg-white border border-gray-200 rounded-xl p-4 active:bg-gray-50"
    >
      <View className="flex-row justify-between items-start mb-2">
        <Text className="text-lg font-semibold text-foreground flex-1 mr-2">
          {job.title}
        </Text>
        <View className={`px-3 py-1 rounded-full ${getStatusColor(job.status)}`}>
          <Text className="text-xs font-medium">
            {getStatusText(job.status)}
          </Text>
        </View>
      </View>

      {job.description && (
        <Text className="text-muted-foreground mb-3" numberOfLines={2}>
          {job.description}
        </Text>
      )}

      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Ionicons name="time-outline" size={16} color="#6b7280" />
          <Text className="text-sm text-muted-foreground ml-1">
            {job.startTime} - {job.endTime}
          </Text>
        </View>

        <View className="flex-row items-center">
          <Ionicons name="people-outline" size={16} color="#6b7280" />
          <Text className="text-sm text-muted-foreground ml-1">
            {job.currentMatches}/{job.maxPositions}
          </Text>
        </View>
      </View>

      {!isOwner && !hasApplied && onApply && (
        <Pressable
          onPress={() => onApply(job._id, job.title)}
          className="bg-primary rounded-lg p-3 mt-3 active:bg-primary/90"
        >
          <Text className="text-primary-foreground text-center font-medium">
            {i18n.t("jobs.apply")}
          </Text>
        </Pressable>
      )}

      {!isOwner && hasApplied && (
        <View className="bg-green-100 rounded-lg p-3 mt-3">
          <Text className="text-green-800 text-center font-medium">
            ✓ Bereits beworben
          </Text>
        </View>
      )}

      {isOwner && (
        <View className="flex-row mt-3 space-x-2">
          <Pressable
            onPress={() => {
              // View applications
              console.log("View applications for:", job._id);
            }}
            className="bg-blue-100 rounded-lg p-3 flex-1 active:bg-blue-200"
          >
            <Text className="text-blue-800 text-center font-medium">
              {i18n.t("jobs.applications")} ({job.currentMatches})
            </Text>
          </Pressable>
          
          <Pressable
            onPress={() => {
              // Edit job
              console.log("Edit job:", job._id);
            }}
            className="bg-gray-100 rounded-lg p-3 active:bg-gray-200"
          >
            <Ionicons name="pencil" size={16} color="#374151" />
          </Pressable>
        </View>
      )}
    </Pressable>
  );
}