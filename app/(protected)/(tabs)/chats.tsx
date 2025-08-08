import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  RefreshControl,
  View,
} from "react-native";

import { Box } from "@/components/ui/box";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/lib/auth-context";
import { ChatService } from "@/lib/chat-service";
import { useMatchedUsers, useUpdateMatchStatus } from "@/lib/queries";
import { Match } from "@/lib/types";
import { useQueryClient } from "@tanstack/react-query";

type TabType = "conversations" | "new-matches";

export default function ChatsScreen() {
  const router = useRouter();
  const { getCurrentUserId, user } = useAuth();
  const currentUserId = getCurrentUserId();
  const { colors } = useTheme();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabType>("conversations");
  const [isUpdatingMatch, setIsUpdatingMatch] = useState<string | null>(null);

  // Use the useMatchedUsers query instead of manual state management
  const {
    data: matchesData,
    isLoading,
    error,
    refetch,
  } = useMatchedUsers(currentUserId || "", !!currentUserId);

  const updateMatchStatusMutation = useUpdateMatchStatus();

  const matches = matchesData?.data?.matches || [];

  // Refetch when tab becomes focused
  useFocusEffect(
    React.useCallback(() => {
      if (currentUserId) {
        refetch();
      }
    }, [currentUserId, refetch])
  );

  // Set up real-time subscription for match updates
  useEffect(() => {
    if (!currentUserId) return;

    const matchUpdateSubscription = ChatService.subscribeToMatchUpdates(
      currentUserId,
      (updatedMatch) => {
        console.log("Real-time match update received:", updatedMatch);

        // Update the query cache directly instead of managing local state
        refetch();

        // Also invalidate the query to ensure fresh data
        queryClient.invalidateQueries({
          queryKey: ["matches", "matched", currentUserId],
        });
      }
    );

    const chatUpdateSubscription = ChatService.subscribeToChatUpdates(
      currentUserId,
      (updatedChat) => {
        console.log("Chat update received:", updatedChat);
        refetch();
      }
    );

    // Cleanup subscription on unmount
    return () => {
      matchUpdateSubscription.unsubscribe();
      chatUpdateSubscription.unsubscribe();
    };
  }, [currentUserId, queryClient]);

  // Filter matches based on active tab
  const getFilteredMatches = () => {
    if (!currentUserId) return [];

    return matches.filter((match) => {
      const isCurrentUserInitiator = match.user1_id === currentUserId;
      const isPending = match.status === "pending";
      const isMatched = match.status === "matched";

      if (activeTab === "conversations") {
        // Show accepted matches (conversations)
        return isMatched;
      } else {
        // Show pending matches where current user is NOT the initiator (new matches)
        return isPending && !isCurrentUserInitiator;
      }
    });
  };

  const handleMatchPress = (match: Match) => {
    // Only allow navigation for matched conversations
    if (match.status !== "matched") return;

    // Get the partner's ID (the other user in the match)
    const partnerId =
      match.user1_id === currentUserId ? match.user2_id : match.user1_id;
    const partnerProfile =
      match.user1_id === currentUserId
        ? match.user2_profile
        : match.user1_profile;

    // Navigate to the chat screen with the match ID as chat ID
    router.push({
      pathname: "/(protected)/chat/[id]",
      params: {
        id: match.id,
        partnerId: partnerId,
        partnerName: partnerProfile.full_name,
      },
    });
  };

  const handleMatchAction = async (
    match: Match,
    action: "accept" | "reject"
  ) => {
    if (!currentUserId || isUpdatingMatch) return;

    try {
      setIsUpdatingMatch(match.id);

      const newStatus = action === "accept" ? "matched" : "rejected";

      await updateMatchStatusMutation.mutateAsync({
        matchId: match.id,
        status: newStatus,
      });

      // If accepted, create a chat and navigate to it
      if (action === "accept") {
        const partnerId =
          match.user1_id === currentUserId ? match.user2_id : match.user1_id;
        const partnerProfile =
          match.user1_id === currentUserId
            ? match.user2_profile
            : match.user1_profile;

        try {
          // Create or get the chat between the two users
          const chat = await ChatService.getOrCreateChat(
            currentUserId,
            partnerId
          );
          console.log("Created/found chat:", chat);

          // Navigate to the chat screen with the chat ID
          router.push({
            pathname: "/(protected)/chat/[id]",
            params: {
              id: chat.id, // Use chat ID instead of match ID
              partnerId: partnerId,
              partnerName: partnerProfile.full_name,
            },
          });
        } catch (chatError) {
          console.error("Failed to create/get chat:", chatError);
          // Still navigate but with match ID as fallback
          router.push({
            pathname: "/(protected)/chat/[id]",
            params: {
              id: match.id,
              partnerId: partnerId,
              partnerName: partnerProfile.full_name,
            },
          });
        }
      }
    } catch (err) {
      console.error("Failed to update match status:", err);
      // You might want to show a toast notification here
    } finally {
      setIsUpdatingMatch(null);
    }
  };

  const renderMatchItem = ({ item: match }: { item: Match }) => {
    const partnerProfile =
      match.user1_id === currentUserId
        ? match.user2_profile
        : match.user1_profile;
    const isPending = match.status === "pending";
    const isMatched = match.status === "matched";

    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <Pressable onPress={() => handleMatchPress(match)} disabled={isPending}>
          <Box className="bg-background-0 rounded-xl p-4 border border-outline-200 mb-3">
            <HStack space="md" className="items-center">
              {/* Profile Avatar */}
              <View
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                  backgroundColor: colors.primary[500],
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Image
                  source={require("@/assets/images/chick.png")}
                  style={{ width: 40, height: 40 }}
                />
              </View>

              {/* Match Info */}
              <VStack space="xs" className="flex-1">
                <Text className="text-typography-0 text-lg font-semibold">
                  {partnerProfile.full_name || "Study Partner"}
                </Text>
                <Text className="text-typography-500 text-sm">
                  Matched on {new Date(match.matched_at).toLocaleDateString()}
                </Text>
                <Text className="text-typography-400 text-xs">
                  Status: {match.status}
                </Text>
              </VStack>

              {/* Action Buttons or Arrow */}
              {activeTab === "new-matches" && isPending ? (
                <HStack space="sm">
                  <Pressable
                    onPress={() => handleMatchAction(match, "reject")}
                    disabled={isUpdatingMatch === match.id}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: colors.error[500],
                      justifyContent: "center",
                      alignItems: "center",
                      opacity: isUpdatingMatch === match.id ? 0.5 : 1,
                    }}
                  >
                    <Ionicons name="close" size={20} color="white" />
                  </Pressable>
                  <Pressable
                    onPress={() => handleMatchAction(match, "accept")}
                    disabled={isUpdatingMatch === match.id}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: colors.success[500],
                      justifyContent: "center",
                      alignItems: "center",
                      opacity: isUpdatingMatch === match.id ? 0.5 : 1,
                    }}
                  >
                    <Ionicons name="checkmark" size={20} color="white" />
                  </Pressable>
                </HStack>
              ) : (
                <Text className="text-typography-400 text-xl">›</Text>
              )}
            </HStack>
          </Box>
        </Pressable>
      </KeyboardAvoidingView>
    );
  };

  const renderTabButton = (tab: TabType, label: string, count: number) => (
    <Pressable
      onPress={() => setActiveTab(tab)}
      style={{
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        backgroundColor:
          activeTab === tab ? colors.primary[500] : "transparent",
        borderWidth: 1,
        borderColor:
          activeTab === tab ? colors.primary[500] : colors.outline[200],
        marginHorizontal: 4,
      }}
    >
      <VStack space="xs" className="items-center">
        <Text
          style={{
            color: activeTab === tab ? "white" : colors.typography[500],
            fontWeight: "600",
            fontSize: 16,
          }}
        >
          {label}
        </Text>
        <Text
          style={{
            color: activeTab === tab ? "white" : colors.typography[400],
            fontSize: 12,
          }}
        >
          {count}
        </Text>
      </VStack>
    </Pressable>
  );

  const filteredMatches = getFilteredMatches();
  const conversationsCount = matches.filter(
    (m) => m.status === "matched"
  ).length;
  const newMatchesCount = matches.filter(
    (m) => m.status === "pending" && m.user1_id !== currentUserId
  ).length;

  if (isLoading) {
    return (
      <Box className="flex-1 bg-background-0 px-6 pt-16">
        <VStack space="lg" className="items-center">
          <Image
            source={require("@/assets/images/chick.png")}
            style={{ width: 100, height: 100 }}
          />
          <ActivityIndicator size="large" color={colors.primary[500]} />
          <Text className="text-typography-400 text-lg">
            Loading matches...
          </Text>
        </VStack>
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="flex-1 bg-background-0 px-6 pt-16">
        <VStack space="lg" className="items-center">
          <Image
            source={require("@/assets/images/chick.png")}
            style={{ width: 100, height: 100 }}
          />
          <Heading size="xl" className="text-error-500">
            Oops!
          </Heading>
          <Text className="text-typography-400 text-lg text-center">
            Failed to load matches. Please try again.
          </Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box className="flex-1 bg-background-0 px-6 pt-16">
      <VStack space="lg" className="flex-1">
        {/* Header */}
        <Heading size="2xl" className="text-typography-0">
          Matches
        </Heading>

        {/* Tab Buttons */}
        <HStack space="sm">
          {renderTabButton(
            "conversations",
            "Conversations",
            conversationsCount
          )}
          {renderTabButton("new-matches", "New Matches", newMatchesCount)}
        </HStack>

        {/* Matches List */}
        {filteredMatches.length === 0 ? (
          <VStack space="lg" className="flex-1 items-center justify-center">
            <Image
              source={require("@/assets/images/chick.png")}
              style={{ width: 100, height: 100 }}
            />
            <Heading size="xl" className="text-typography-400">
              {activeTab === "conversations"
                ? "No Conversations Yet"
                : "No New Matches"}
            </Heading>
            <Text className="text-typography-400 text-lg text-center">
              {activeTab === "conversations"
                ? "Start accepting matches to begin conversations!"
                : "Start swiping to find study partners!"}
            </Text>
          </VStack>
        ) : (
          <FlatList
            data={filteredMatches}
            renderItem={renderMatchItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={isLoading} onRefresh={refetch} />
            }
            contentContainerStyle={{ paddingBottom: 100 }}
          />
        )}
      </VStack>
    </Box>
  );
}
