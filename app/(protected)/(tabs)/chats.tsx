import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
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
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { Match } from "@/lib/types";

export default function ChatsScreen() {
  const router = useRouter();
  const { getCurrentUserId, user } = useAuth();
  const currentUserId = getCurrentUserId();
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMatches = async () => {
    if (!currentUserId) return;

    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.findMatchedUsers(currentUserId);
      console.log("currentUserId", user?.id);
      console.log('matches', response.data.matches , 'matches count', response.data.matches.length);
      setMatches(response.data.matches);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load matches");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMatches();
  }, [currentUserId]);

  const handleMatchPress = (match: Match) => {
    // Get the partner's ID (the other user in the match)
    const partnerId = match.user1_id === currentUserId ? match.user2_id : match.user1_id;
    const partnerProfile = match.user1_id === currentUserId ? match.user2_profile : match.user1_profile;

    // Navigate to the chat screen with the match ID as chat ID
    router.push({
      pathname: "/(protected)/chat/[id]",
      params: { 
        id: match.id, 
        partnerId: partnerId,
        partnerName: partnerProfile.full_name
      },
    });
  };

  const renderMatchItem = ({ item: match }: { item: Match }) => {
    const partnerProfile = match.user1_id === currentUserId ? match.user2_profile : match.user1_profile;

    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <Pressable onPress={() => handleMatchPress(match)}>
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

              {/* Match Info */}
              <VStack space="xs" className="flex-1">
                <Text className="text-typography-0 text-lg font-semibold">
                  {partnerProfile.full_name || "Study Partner"}
                </Text>
                <Text className="text-typography-400 text-sm">
                  Matched on {new Date(match.matched_at).toLocaleDateString()}
                </Text>
                <Text className="text-typography-400 text-xs">
                  Status: {match.status}
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
          Matches
        </Heading>

        {/* Matches List */}
        {matches.length === 0 ? (
          <VStack space="lg" className="flex-1 items-center justify-center">
            <Image
              source={require("@/assets/images/chick.png")}
              style={{ width: 100, height: 100 }}
            />
            <Heading size="xl" className="text-typography-400">
              No Matches Yet
            </Heading>
            <Text className="text-typography-400 text-lg text-center">
              Start swiping to find study partners!
            </Text>
          </VStack>
        ) : (
          <FlatList
            data={matches}
            renderItem={renderMatchItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={isLoading} onRefresh={loadMatches} />
            }
            contentContainerStyle={{ paddingBottom: 100 }}
          />
        )}
      </VStack>
    </Box>
  );
}
