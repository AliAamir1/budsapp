import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StatusBar,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useAuth } from "@/lib/auth-context";
import { ChatService } from "@/lib/chat-service";
import { Message } from "@/lib/supabase";

interface ChatMessage {
  id: string;
  text: string;
  createdAt: Date;
  senderId: string;
  isOwn: boolean;
}

export default function ChatScreen() {
  const { id: matchId, partnerId, partnerName } = useLocalSearchParams<{
    id: string;
    partnerId?: string;
    partnerName?: string;
  }>();
  const router = useRouter();
  const { getCurrentUserId } = useAuth();
  const currentUserId = getCurrentUserId();
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [actualChatId, setActualChatId] = useState<string | null>(null);

  // Convert Supabase message to ChatMessage
  const convertMessage = (message: Message): ChatMessage => ({
    id: message.id,
    text: message.content,
    createdAt: new Date(message.created_at),
    senderId: message.sender_id,
    isOwn: message.sender_id === currentUserId,
  });

  // Load initial messages and get actual chat ID
  const loadMessages = useCallback(async () => {
    if (!currentUserId || !partnerId) return;

    try {
      setIsLoading(true);

      // Get or create the actual chat
      const chat = await ChatService.getOrCreateChat(currentUserId, partnerId);
      setActualChatId(chat.id);

      // Get messages
      const chatMessages = await ChatService.getChatMessages(chat.id);
      const giftedMessages = chatMessages.map(convertMessage);
      setMessages(giftedMessages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load messages");
    } finally {
      setIsLoading(false);
    }
  }, [currentUserId, partnerId]);

  // Subscribe to real-time messages
  useEffect(() => {
    if (!actualChatId || !currentUserId) return;

    const subscription = ChatService.subscribeToChatMessages(
      actualChatId,
      (newMessage) => {
        setMessages((prevMessages) => [
          convertMessage(newMessage),
          ...prevMessages,
        ]);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [actualChatId, currentUserId]);

  // Load messages when chat ID is available
  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  // Send a message
  const sendMessage = async () => {
    if (!actualChatId || !currentUserId || !newMessage.trim() || !partnerId) return;

    const messageText = newMessage.trim();
    setNewMessage(""); // Clear input immediately

    try {
      // Optimistically add the message to the UI
      const optimisticMessage: ChatMessage = {
        id: Date.now().toString(), // Temporary ID
        text: messageText,
        createdAt: new Date(),
        senderId: currentUserId,
        isOwn: true,
      };
      setMessages((prevMessages) => [optimisticMessage, ...prevMessages]);

      // Send the message to Supabase
      await ChatService.sendMessage(
        actualChatId,
        currentUserId,
        partnerId,
        messageText
      );
    } catch (err) {
      console.error("Failed to send message:", err);
      // Remove the optimistic message on error
      setMessages((prevMessages) =>
        prevMessages.filter((m) => m.id !== Date.now().toString())
      );
    }
  };

  const handleBackPress = () => {
    Keyboard.dismiss();
    router.back();
  };

  if (isLoading) {
    return (
      <Box className="flex-1 bg-background-0 justify-center items-center">
        <ActivityIndicator size="large" color="#4AC3C7" />
        <Text className="text-typography-400 mt-4">Loading chat...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="flex-1 bg-background-0 justify-center items-center px-6">
        <Text className="text-error-500 text-lg text-center mb-4">
          Failed to load chat
        </Text>
        <Text className="text-typography-400 text-center">{error}</Text>
      </Box>
    );
  }

  const renderMessage = ({ item }: { item: ChatMessage }) => (
    <Box className={`px-4 py-2 ${item.isOwn ? "items-end" : "items-start"}`}>
      <Box
        className={`rounded-lg px-3 py-2 max-w-[80%] ${
          item.isOwn ? "bg-primary-500" : "bg-background-950"
        }`}
      >
        <Text
          className={`text-sm ${
            item.isOwn ? "text-white" : "text-typography-0"
          }`}
        >
          {item.text}
        </Text>
        <Text
          className={`text-xs mt-1 ${
            item.isOwn ? "text-primary-100" : "text-typography-400"
          }`}
        >
          {item.createdAt.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </Box>
    </Box>
  );

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <Box className="flex-1 bg-background-950">
        <StatusBar barStyle="light-content" backgroundColor="#1f2937" />

        {/* Header with proper safe area handling */}
        <Box
          className="bg-background-950 border-b border-outline-200"
          style={{
            paddingTop: insets.top,
            paddingBottom: 16,
            paddingHorizontal: 16,
          }}
        >
          <HStack space="md" className="items-center">
            {/* Back button with proper icon */}
            <Pressable
              onPress={handleBackPress}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 20, color: "#ffffff" }}>‹</Text>
            </Pressable>

            {/* User avatar */}
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: "#4AC3C7",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 16, color: "white" }}>👤</Text>
            </View>

            {/* User info */}
            <VStack space="xs" className="flex-1">
              <Text className="text-typography-0 text-lg font-semibold">
                {partnerName || "Study Partner"}
              </Text>
              {/* <Text className="text-typography-400 text-sm">
                Online
              </Text> */}
            </VStack>
          </HStack>
        </Box>

        {/* Messages with proper keyboard handling */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === "ios" ? 12 : 0}
        >
          <FlatList
            ref={flatListRef}
            data={messages.reverse()}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            inverted
            className="flex-1 bg-background-0"
            contentContainerStyle={{
              paddingVertical: 10,
              flexGrow: 1,
            }}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => {
              if (messages.length > 0) {
                flatListRef.current?.scrollToOffset({
                  offset: 0,
                  animated: true,
                });
              }
            }}
          />

          {/* Input with proper keyboard handling */}
          <Box
            className="bg-background-950 border-t border-outline-200"
            style={{
              paddingHorizontal: 16,
              paddingTop: 12,
              paddingBottom: insets.bottom + 12,
            }}
          >
            <HStack className="items-center">
              <TextInput
                ref={inputRef}
                value={newMessage}
                onChangeText={setNewMessage}
                placeholder="Type a message..."
                placeholderTextColor="#9CA3AF"
                style={{
                  flex: 1,
                  backgroundColor: "#1f2937",
                  color: "#ffffff",
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 20,
                  minHeight: 40,
                  maxHeight: 100,
                  textAlignVertical: "center",
                  fontSize: 16,
                  borderWidth: 1,
                  borderColor: "#374151",
                }}
                multiline
                maxLength={500}
                returnKeyType="send"
                onSubmitEditing={sendMessage}
                blurOnSubmit={false}
              />
              <Pressable
                onPress={sendMessage}
                disabled={!newMessage.trim()}
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: "50%",
                  padding: 10,
                  backgroundColor: newMessage.trim() ? "#4AC3C7" : "#374151",
                  justifyContent: "center",
                  alignItems: "center",
                  marginLeft: 8,
                }}
              >
                <Ionicons name="send" size={25} color="white" />
              </Pressable>
            </HStack>
          </Box>
        </KeyboardAvoidingView>
      </Box>
    </TouchableWithoutFeedback>
  );
}
