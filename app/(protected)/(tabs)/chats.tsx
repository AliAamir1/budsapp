import { Box } from "@/components/ui/box";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/lib/auth-context";
import { ChatService } from "@/lib/chat-service";
import {
  useMatchedUsers,
  useUpdateMatchStatus,
  useUserChats,
} from "@/lib/queries";
import { Match } from "@/lib/types";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

type TabType = "conversations" | "new-matches";

export default function ChatsScreen() {
  const router = useRouter();
  const { getCurrentUserId, user } = useAuth();
  const currentUserId = getCurrentUserId();
  const { colors } = useTheme();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabType>("conversations");
  const [isUpdatingMatch, setIsUpdatingMatch] = useState<string | null>(null);

  // Queries for counts & data
  const {
    data: matchesData,
    isLoading: isLoadingMatches,
    error: matchesError,
    refetch: refetchMatches,
  } = useMatchedUsers(currentUserId || "", !!currentUserId);
  const {
    data: chatsData,
    isLoading: isLoadingChats,
    error: chatsError,
    refetch: refetchChats,
  } = useUserChats(currentUserId || "", !!currentUserId);

  const updateMatchStatusMutation = useUpdateMatchStatus();

  const matches = matchesData?.data?.matches || [];
  const chats = chatsData || [];

  // Refetch when tab becomes focused
  useFocusEffect(
    React.useCallback(() => {
      if (currentUserId) {
        refetchMatches();
        refetchChats();
      }
    }, [currentUserId, refetchMatches, refetchChats])
  );

  // Top-level subscriptions so counts update regardless of active tab
  useEffect(() => {
    if (!currentUserId) return;

    const matchUpdateSubscription = ChatService.subscribeToMatchUpdates(
      currentUserId,
      (updatedMatch) => {
        console.log("Real-time match update received:", updatedMatch);
        // Refresh new matches data and counts
        refetchMatches();
        queryClient.invalidateQueries({
          queryKey: ["matches", "matched", currentUserId],
        });
      }
    );

    const chatUpdateSubscription = ChatService.subscribeToChatUpdates(
      currentUserId,
      (updatedChat) => {
        console.log("Chat update received:", updatedChat);
        // Refresh conversations data and counts
        refetchChats();
      }
    );

    // Cleanup subscription on unmount
    return () => {
      matchUpdateSubscription.unsubscribe();
      chatUpdateSubscription.unsubscribe();
    };
  }, [currentUserId, queryClient]);

  // Derived counts
  const conversationsCount = chats.length;
  const newMatchesCount = matches.filter(
    (m) => m.status === "pending" && m.user1_id !== currentUserId
  ).length;

  // Navigation helpers
  const openChatByPartner = (
    partnerId: string,
    partnerName?: string,
    chatId?: string
  ) => {
    router.push({
      pathname: "/(protected)/chat/[id]",
      params: { id: chatId || "", partnerId, partnerName: partnerName || "" },
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
            partnerId,
            user?.name || undefined,
            partnerProfile.full_name || undefined
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

  // New Matches list item
  const renderNewMatchItem = ({ item: match }: { item: Match }) => {
    const partnerProfile =
      match.user1_id === currentUserId
        ? match.user2_profile
        : match.user1_profile;
    const isPending = match.status === "pending";
    const isMatched = match.status === "matched";

    return (
      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
        enableOnAndroid={true}
        extraScrollHeight={20}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable
          onPress={() => {
            if (!isMatched) return;
            const partnerId =
              match.user1_id === currentUserId
                ? match.user2_id
                : match.user1_id;
            openChatByPartner(partnerId, partnerProfile.full_name, match.id);
          }}
          disabled={isPending}
        >
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
              {isPending ? (
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
      </KeyboardAwareScrollView>
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

  // Component bodies for each tab
  const NewMatchesList = () => {
    const pendingMatches = matches.filter(
      (m) => m.status === "pending" && m.user1_id !== currentUserId
    );

    if (isLoadingMatches) {
      return (
        <VStack space="lg" className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary[500]} />
          <Text className="text-typography-400 text-lg">
            Loading new matches...
          </Text>
        </VStack>
      );
    }

    if (matchesError) {
      return (
        <VStack space="lg" className="flex-1 items-center justify-center">
          <Heading size="xl" className="text-error-500">
            Oops!
          </Heading>
          <Text className="text-typography-400 text-lg text-center">
            Failed to load matches.
          </Text>
        </VStack>
      );
    }

    if (pendingMatches.length === 0) {
      return (
        <VStack space="lg" className="flex-1 items-center justify-center">
          <Image
            source={require("@/assets/images/chick.png")}
            style={{ width: 100, height: 100 }}
          />
          <Heading size="xl" className="text-typography-400">
            No New Matches
          </Heading>
          <Text className="text-typography-400 text-lg text-center">
            Start swiping to find study partners!
          </Text>
        </VStack>
      );
    }

    return (
      <FlatList
        data={pendingMatches}
        renderItem={renderNewMatchItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoadingMatches}
            onRefresh={refetchMatches}
          />
        }
        contentContainerStyle={{ paddingBottom: 100 }}
      />
    );
  };

  const ConversationsList = () => {
    if (isLoadingChats) {
      return (
        <VStack space="lg" className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary[500]} />
          <Text className="text-typography-400 text-lg">
            Loading conversations...
          </Text>
        </VStack>
      );
    }

    if (chatsError) {
      return (
        <VStack space="lg" className="flex-1 items-center justify-center">
          <Heading size="xl" className="text-error-500">
            Oops!
          </Heading>
          <Text className="text-typography-400 text-lg text-center">
            Failed to load conversations.
          </Text>
        </VStack>
      );
    }

    if (chats.length === 0) {
      return (
        <VStack space="lg" className="flex-1 items-center justify-center">
          <Image
            source={require("@/assets/images/chick.png")}
            style={{ width: 100, height: 100 }}
          />
          <Heading size="xl" className="text-typography-400">
            No Conversations Yet
          </Heading>
          <Text className="text-typography-400 text-lg text-center">
            Start accepting matches to begin conversations!
          </Text>
        </VStack>
      );
    }

    return (
      <FlatList
        data={chats}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoadingChats}
            onRefresh={refetchChats}
          />
        }
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item }) => {
          const isRecipientOne = item.recipient_one === currentUserId;
          const partnerId = isRecipientOne
            ? item.recipient_two
            : item.recipient_one;
          const partnerName = isRecipientOne
            ? item.recipient_two_name
            : item.recipient_one_name;
          return (
            <Pressable
              onPress={() => openChatByPartner(partnerId, partnerName, item.id)}
            >
              <Box className="bg-background-0 rounded-xl p-4 border border-outline-200 mb-3">
                <HStack space="md" className="items-center">
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
                  <VStack space="xs" className="flex-1">
                    <Text className="text-typography-0 text-lg font-semibold">
                      {partnerName || "Conversation"}
                    </Text>
                    {!!item.last_message && (
                      <Text
                        className="text-typography-500 text-sm"
                        numberOfLines={1}
                      >
                        {item.last_message}
                      </Text>
                    )}
                    {!!item.updated_at && (
                      <Text className="text-typography-400 text-xs">
                        {new Date(item.updated_at).toLocaleString()}
                      </Text>
                    )}
                  </VStack>
                  <Text className="text-typography-400 text-xl">›</Text>
                </HStack>
              </Box>
            </Pressable>
          );
        }}
      />
    );
  };

  if (isLoadingMatches && isLoadingChats) {
    return (
      <Box className="flex-1 bg-background-0 px-6 pt-16">
        <VStack space="lg" className="items-center">
          <Image
            source={require("@/assets/images/chick.png")}
            style={{ width: 100, height: 100 }}
          />
          <ActivityIndicator size="large" color={colors.primary[500]} />
          <Text className="text-typography-400 text-lg">Loading...</Text>
        </VStack>
      </Box>
    );
  }

  if (matchesError || chatsError) {
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
            Failed to load data. Please try again.
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

        {activeTab === "conversations" ? (
          <ConversationsList />
        ) : (
          <NewMatchesList />
        )}
      </VStack>
    </Box>
  );
}
