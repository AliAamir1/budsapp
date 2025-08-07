import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, Image, Pressable, RefreshControl, View } from 'react-native';

import { Box } from '@/components/ui/box';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useAuth } from '@/lib/auth-context';
import { useMatchedUsers } from '@/lib/queries';

export default function MatchesScreen() {
  const router = useRouter();
  const { getCurrentUserId } = useAuth();
  const currentUserId = getCurrentUserId();

  const { data: matchesData, isLoading, error, refetch } = useMatchedUsers(
    currentUserId || '',
    !!currentUserId
  );

  const matches = matchesData?.data?.matches || [];

  const handleMatchPress = (match: any) => {
    // TODO: Navigate to chat screen when implemented
    console.log('Navigate to chat with:', match);
    // router.push(`/(protected)/chat/${match.id}`);
  };

  const renderMatchItem = ({ item: match }: { item: any }) => (
    <Pressable onPress={() => handleMatchPress(match)}>
      <Box className="bg-background-950 rounded-xl p-4 border border-outline-200 mb-3">
        <HStack space="md" className="items-center">
          {/* Profile Avatar */}
          <View
            style={{
              width: 60,
              height: 60,
              borderRadius: 30,
              backgroundColor: '#4AC3C7',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Image
              source={require('@/assets/images/chick.png')}
              style={{ width: 40, height: 40 }}
            />
          </View>

          {/* Match Info */}
          <VStack space="xs" className="flex-1">
            <Text className="text-typography-0 text-lg font-semibold">
              {match.full_name || 'Unknown User'}
            </Text>
            <Text className="text-typography-400 text-sm">
              Match Score: {match.match_score || 0}%
            </Text>
            <Text className="text-typography-400 text-sm">
              {match.exam_name || 'Unknown Exam'}
            </Text>
          </VStack>

          {/* Arrow indicator */}
          <Text className="text-typography-400 text-xl">›</Text>
        </HStack>
      </Box>
    </Pressable>
  );

  if (isLoading) {
    return (
      <Box className="flex-1 bg-background-0 px-6 pt-16">
        <VStack space="lg" className="items-center">
          <Image
            source={require('@/assets/images/chick.png')}
            style={{ width: 100, height: 100 }}
          />
          <Text className="text-typography-400 text-lg">Loading matches...</Text>
        </VStack>
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="flex-1 bg-background-0 px-6 pt-16">
        <VStack space="lg" className="items-center">
          <Image
            source={require('@/assets/images/chick.png')}
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
              source={require('@/assets/images/chick.png')}
              style={{ width: 100, height: 100 }}
            />
            <Heading size="xl" className="text-typography-400">
              No Matches Yet
            </Heading>
            <Text className="text-typography-400 text-lg text-center">
              Start swiping to find your study partners!
            </Text>
          </VStack>
        ) : (
          <FlatList
            data={matches}
            renderItem={renderMatchItem}
            keyExtractor={(item) => item.id || (item.user1_id + item.user2_id)}
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