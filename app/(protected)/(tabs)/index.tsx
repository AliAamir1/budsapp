import React, { useState } from 'react';
import { Alert, Dimensions, Image, Text, View } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, {
  Extrapolate,
  interpolate,
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { Box } from '@/components/ui/box';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { useAuth } from '@/lib/auth-context';
import { useCreateMatch, usePotentialMatches } from '@/lib/queries';

const { width: screenWidth } = Dimensions.get('window');
const SWIPE_THRESHOLD = screenWidth * 0.3;

interface UserCardProps {
  user: {
    id: string;
    user_id: string;
    exam_id: string;
    study_start_date: string;
    study_end_date: string;
    daily_study_time: string;
    intensity: string;
    created_at: string;
    match_score: number;
    exam_match: boolean;
    intensity_match: boolean;
    date_overlap: boolean;
    overlap_days: number;
    full_name: string;
    gender: string | null;
  };
  index: number;
  onSwipe: (direction: 'left' | 'right', userId: string) => void;
  isTop: boolean;
}

const UserCard: React.FC<UserCardProps> = ({ user, index, onSwipe, isTop }) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(isTop ? 1 : 0.95);

  const handleSwipe = (direction: 'left' | 'right') => {
    onSwipe(direction, user.user_id);
  };

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, context: any) => {
      context.startX = translateX.value;
    },
    onActive: (event, context) => {
      if (!isTop) return;
      translateX.value = context.startX + event.translationX;
      translateY.value = event.translationY * 0.1;
    },
    onEnd: (event) => {
      if (!isTop) return;
      
      const velocity = event.velocityX;
      const translation = translateX.value;
      
      if (Math.abs(velocity) > 500 || Math.abs(translation) > SWIPE_THRESHOLD) {
        // Swipe detected
        const direction = translation > 0 ? 'right' : 'left';
        const endX = direction === 'right' ? screenWidth * 1.5 : -screenWidth * 1.5;
        
        translateX.value = withSpring(endX, { damping: 15 });
        translateY.value = withSpring(0);
        
        // Call swipe handler after animation
        runOnJS(handleSwipe)(direction);
      } else {
        // Return to center
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    },
  });

  const animatedStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      translateX.value,
      [-screenWidth / 2, 0, screenWidth / 2],
      [-15, 0, 15],
      Extrapolate.CLAMP
    );

    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate}deg` },
        { scale: scale.value },
      ],
      zIndex: isTop ? 10 : index,
    };
  });

  return (
    <PanGestureHandler onGestureEvent={gestureHandler}>
      <Animated.View
        style={[
          {
            position: 'absolute',
            width: screenWidth * 0.85,
            height: 420,
            alignSelf: 'center',
            top: 120,
          },
          animatedStyle,
        ]}
      >
        <Box className="bg-background-950 rounded-3xl p-6 border-4 border-primary-400 shadow-lg">
          {/* Chick Avatar */}
          <VStack space="md" className="items-center">
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: '#4AC3C7',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 16,
              }}
            >
              <Image
                source={require('@/assets/images/chick.png')}
                style={{ width: 60, height: 60 }}
              />
            </View>

            {/* User Info */}
            <VStack space="sm" className="w-full">
              <HStack className="justify-between items-center border-b border-typography-300 pb-2">
                <Text className="text-typography-900 font-semibold text-base">Name:</Text>
                <Text className="text-typography-600 text-base">{user.full_name}</Text>
              </HStack>

              <HStack className="justify-between items-center border-b border-typography-300 pb-2">
                <Text className="text-typography-900 font-semibold text-base">Match Score:</Text>
                <Text className="text-typography-600 text-base">{user.match_score}%</Text>
              </HStack>

              <HStack className="justify-between items-center border-b border-typography-300 pb-2">
                <Text className="text-typography-900 font-semibold text-base">Study Period:</Text>
                <Text className="text-typography-600 text-base">
                  {new Date(user.study_start_date).toLocaleDateString()} - {new Date(user.study_end_date).toLocaleDateString()}
                </Text>
              </HStack>

              <HStack className="justify-between items-center border-b border-typography-300 pb-2">
                <Text className="text-typography-900 font-semibold text-base">Daily Study:</Text>
                <Text className="text-typography-600 text-base">
                  {user.daily_study_time.split(':')[0]}h {user.daily_study_time.split(':')[1]}m
                </Text>
              </HStack>

              <HStack className="justify-between items-center border-b border-typography-300 pb-2">
                <Text className="text-typography-900 font-semibold text-base">Intensity:</Text>
                <Text className="text-typography-600 text-base capitalize">{user.intensity}</Text>
              </HStack>

              {user.gender && (
                <HStack className="justify-between items-center border-b border-typography-300 pb-2">
                  <Text className="text-typography-900 font-semibold text-base">Gender:</Text>
                  <Text className="text-typography-600 text-base capitalize">{user.gender}</Text>
                </HStack>
              )}

              <HStack className="justify-between items-center pt-2">
                <Text className="text-typography-900 font-semibold text-base">Overlap:</Text>
                <Text className="text-typography-600 text-base">{user.overlap_days} days</Text>
              </HStack>
            </VStack>

            {/* Decorative Chick */}
            <View style={{ position: 'absolute', bottom: -10, right: 10 }}>
              <Image
                source={require('@/assets/images/chick-thumbs-up.png')}
                style={{ width: 50, height: 50 }}
              />
              <Text style={{ fontSize: 20, position: 'absolute', top: -5, right: -5 }}>✨</Text>
            </View>
          </VStack>
        </Box>
      </Animated.View>
    </PanGestureHandler>
  );
};

export default function HomeScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const createMatchMutation = useCreateMatch();
  const { getCurrentUserId } = useAuth();
  
  // Get current user ID from auth context
  const currentUserId = getCurrentUserId();
  
  // Fetch potential matches from API
  const { data: potentialMatches, isLoading, error } = usePotentialMatches(currentUserId || '', { page: 1, limit: 20 }, !!currentUserId);
  
  const handleSwipe = (direction: 'left' | 'right', userId: string) => {
    if (direction === 'right' && currentUserId) {
      // Match - create match via API
      createMatchMutation.mutate(
        { user1Id: currentUserId, user2Id: userId },
        {
          onSuccess: () => {
            Alert.alert('Match!', 'You have a new study buddy! 🎉');
          },
          onError: (error) => {
            console.error('Failed to create match:', error);
            Alert.alert('Error', 'Failed to create match. Please try again.');
          },
        }
      );
    }

    // Move to next card
    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
    }, 300);
  };

  // Show loading state
  if (isLoading) {
    return (
      <Box className="flex-1 bg-background-0 justify-center items-center px-6">
        <VStack space="lg" className="items-center">
          <Image
            source={require('@/assets/images/chick.png')}
            style={{ width: 100, height: 100 }}
          />
          <Heading size="2xl" className="text-primary-500 text-center">
            Finding Buds...
          </Heading>
          <Text className="text-typography-0 text-center text-lg">
            Looking for your perfect study partners
          </Text>
        </VStack>
      </Box>
    );
  }

  // Show error state
  if (error) {
    return (
      <Box className="flex-1 bg-background-0 justify-center items-center px-6">
        <VStack space="lg" className="items-center">
          <Image
            source={require('@/assets/images/chick.png')}
            style={{ width: 100, height: 100 }}
          />
          <Heading size="2xl" className="text-primary-500 text-center">
            Oops!
          </Heading>
          <Text className="text-typography-0 text-center text-lg">
            Failed to load potential matches. Please try again.
          </Text>
        </VStack>
      </Box>
    );
  }

  const users = potentialMatches?.data?.matches || [];
  console.log('potentialMatches', potentialMatches)
  const visibleUsers = users?.slice(currentIndex, currentIndex + 3) || [];

  if (currentIndex >= users.length || users.length === 0) {
    return (
      <Box className="flex-1 bg-background-0 justify-center items-center px-6">
        <VStack space="lg" className="items-center">
          <Image
            source={require('@/assets/images/chick-thumbs-up.png')}
            style={{ width: 100, height: 100 }}
          />
          <Heading size="2xl" className="text-primary-500 text-center">
            No More Buds!
          </Heading>
          <Text className="text-typography-0 text-center text-lg">
            You've seen all available study partners for now. Check back later for more!
          </Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box className="flex-1 bg-background-0">
      {/* Header */}
      <VStack className="pt-16 pb-4 items-center">
        <Image
          source={require('@/assets/images/chick.png')}
          style={{ width: 60, height: 60 }}
        />
        <Heading size="2xl" className="text-primary-500 mt-2">
          Add Buds!
        </Heading>
      </VStack>

      {/* Cards Stack */}
      <View style={{ flex: 1 }}>
        {visibleUsers.map((user, index) => (
          <UserCard
            key={user.user_id}
            user={user}
            index={index}
            onSwipe={handleSwipe}
            isTop={index === 0}
          />
        ))}
      </View>

      {/* Instructions */}
      <Box className="absolute bottom-20 left-0 right-0 px-6">
        <HStack className="justify-between items-center">
          <VStack className="items-center">
            <Text className="text-2xl">👈</Text>
            <Text className="text-typography-200 text-sm">Pass</Text>
          </VStack>
          <VStack className="items-center">
            <Text className="text-2xl">👉</Text>
            <Text className="text-typography-200 text-sm">Match</Text>
          </VStack>
        </HStack>
      </Box>
    </Box>
  );
}