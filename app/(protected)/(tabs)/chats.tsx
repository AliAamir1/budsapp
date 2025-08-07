import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
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
import { useAuth } from "@/lib/auth-context";
import { ChatService } from "@/lib/chat-service";
import { useMatchedUsers } from "@/lib/queries";
import { Chat } from "@/lib/supabase";

export default function ChatsScreen() {
  const router = useRouter();
  const { getCurrentUserId } = useAuth();
  const currentUserId = getCurrentUserId();
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewChatModal, setShowNewChatModal] = useState(false);

  // Get matched users for new chat
  const { data: matchedUsersData, isLoading: matchedUsersLoading } =
    useMatchedUsers(currentUserId || "", !!currentUserId);
  const matchedUsers = matchedUsersData?.data?.matches || [];

  const loadChats = async () => {
    if (!currentUserId) return;

    try {
      setIsLoading(true);
      setError(null);
      const userChats = await ChatService.getUserChats(currentUserId);
      setChats(userChats);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load chats");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadChats();
  }, [currentUserId]);

  const handleChatPress = async (chat: Chat) => {
    try {
      // Navigate to the chat screen
      router.push({
        pathname: "/(protected)/chat/[id]",
        params: { id: chat.id },
      });
    } catch (err) {
      console.error("Failed to navigate to chat:", err);
    }
  };

  const handleNewChatPress = (matchedUser: any) => {
    // Get the partner's user ID (the other user in the match)
    const partnerId =
      matchedUser.user1_id === currentUserId
        ? matchedUser.user2_id
        : matchedUser.user1_id;

    // Navigate to a new chat with the matched user
    // We'll use a temporary ID that will be replaced when the first message is sent
    const tempChatId = `temp_${currentUserId}_${partnerId}`;
    router.push({
      pathname: "/(protected)/chat/[id]",
      params: { id: tempChatId, userId: partnerId },
    });
    setShowNewChatModal(false);
  };

  const renderChatItem = ({ item: chat }: { item: Chat }) => {
    const otherUserId =
      chat.recipient_one === currentUserId
        ? chat.recipient_two
        : chat.recipient_one;

    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <Pressable onPress={() => handleChatPress(chat)}>
          <Box className="bg-background-950 rounded-xl p-4 border border-outline-200 mb-3">
            <HStack space="md" className="items-center">
              {/* Profile Avatar */}
              <View
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                  backgroundColor: "#4AC3C7",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Image
                  source={require("@/assets/images/chick.png")}
                  style={{ width: 40, height: 40 }}
                />
              </View>

              {/* Chat Info */}
              <VStack space="xs" className="flex-1">
                <Text className="text-typography-0 text-lg font-semibold">
                  {chat.recipient_one_name ||
                    chat.recipient_two_name ||
                    "Study Partner"}
                </Text>
                <Text className="text-typography-400 text-sm" numberOfLines={1}>
                  {chat.last_message || "Start a conversation!"}
                </Text>
                <Text className="text-typography-400 text-xs">
                  {chat.updated_at
                    ? new Date(chat.updated_at).toLocaleDateString()
                    : ""}
                </Text>
              </VStack>

              {/* Arrow indicator */}
              <Text className="text-typography-400 text-xl">›</Text>
            </HStack>
          </Box>
        </Pressable>
      </KeyboardAvoidingView>
    );
  };

  if (isLoading) {
    return (
      <Box className="flex-1 bg-background-0 px-6 pt-16">
        <VStack space="lg" className="items-center">
          <Image
            source={require("@/assets/images/chick.png")}
            style={{ width: 100, height: 100 }}
          />
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
          Chats
        </Heading>

        {/* Chats List */}
        {chats.length === 0 ? (
          <VStack space="lg" className="flex-1 items-center justify-center">
            <Image
              source={require("@/assets/images/chick.png")}
              style={{ width: 100, height: 100 }}
            />
            <Heading size="xl" className="text-typography-400">
              No Chats Yet
            </Heading>
            <Text className="text-typography-400 text-lg text-center">
              Start matching to begin conversations!
            </Text>
          </VStack>
        ) : (
          <FlatList
            data={chats}
            renderItem={renderChatItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={isLoading} onRefresh={loadChats} />
            }
            contentContainerStyle={{ paddingBottom: 100 }}
          />
        )}
      </VStack>

      {/* Floating Action Button */}
      <Pressable
        onPress={() => setShowNewChatModal(true)}
        style={{
          position: "absolute",
          bottom: 100,
          right: 20,
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: "#4AC3C7",
          justifyContent: "center",
          alignItems: "center",
          elevation: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
        }}
      >
        <Text style={{ fontSize: 24, color: "white" }}>+</Text>
      </Pressable>

      {/* New Chat Modal */}
      <Modal
        visible={showNewChatModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowNewChatModal(false)}
      >
        <Box className="flex-1 bg-background-0">
          {/* Header */}
          <Box className="bg-background-950 px-4 py-3 border-b border-outline-200">
            <HStack className="items-center justify-between">
              <Text className="text-typography-0 text-lg font-semibold">
                New Chat
              </Text>
              <Pressable onPress={() => setShowNewChatModal(false)}>
                <Text className="text-typography-400 text-lg">✕</Text>
              </Pressable>
            </HStack>
          </Box>

          {/* Matched Users List */}
          {matchedUsersLoading ? (
            <Box className="flex-1 justify-center items-center">
              <Text className="text-typography-400">Loading matches...</Text>
            </Box>
          ) : matchedUsers.length === 0 ? (
            <Box className="flex-1 justify-center items-center px-6">
              <Text className="text-typography-400 text-center">
                No matches found. Start swiping to find study partners!
              </Text>
            </Box>
          ) : (
            <FlatList
              data={matchedUsers}
              renderItem={({ item: matchedUser }) => {
                // Get the partner's profile (the other user in the match)
                const partnerProfile =
                  matchedUser.user1_id === currentUserId
                    ? matchedUser.user2_profile
                    : matchedUser.user1_profile;

                return (
                  <Pressable onPress={() => handleNewChatPress(matchedUser)}>
                    <Box className="bg-background-950 border-b border-outline-200 p-4">
                      <HStack space="md" className="items-center">
                        {/* Profile Avatar */}
                        <View
                          style={{
                            width: 50,
                            height: 50,
                            borderRadius: 25,
                            backgroundColor: "#4AC3C7",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <Image
                            source={require("@/assets/images/chick.png")}
                            style={{ width: 30, height: 30 }}
                          />
                        </View>

                        {/* User Info */}
                        <VStack space="xs" className="flex-1">
                          <Text className="text-typography-0 text-lg font-semibold">
                            {partnerProfile.full_name || "Unknown User"}
                          </Text>
                          <Text className="text-typography-400 text-sm">
                            Matched on{" "}
                            {new Date(
                              matchedUser.matched_at
                            ).toLocaleDateString()}
                          </Text>
                          <Text className="text-typography-400 text-sm">
                            Status: {matchedUser.status}
                          </Text>
                        </VStack>

                        {/* Arrow indicator */}
                        <Text className="text-typography-400 text-xl">›</Text>
                      </HStack>
                    </Box>
                  </Pressable>
                );
              }}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
            />
          )}
        </Box>
      </Modal>
    </Box>
  );
}
