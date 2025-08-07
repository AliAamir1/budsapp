import { Box } from "@/components/ui/box";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/lib/auth-context";
import { ChatService } from "@/lib/chat-service";
import { useCreateMatch, usePotentialMatches } from "@/lib/queries";
import AntDesign from "@expo/vector-icons/AntDesign";
import Entypo from "@expo/vector-icons/Entypo";
import React, { useState } from "react";
import { Dimensions, Image, Text, View } from "react-native";
import { PanGestureHandler } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

const { width: screenWidth } = Dimensions.get("window");
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
  onSwipe: (direction: "left" | "right", userId: string) => void;
  isTop: boolean;
}

const UserCard: React.FC<UserCardProps> = ({ user, index, onSwipe, isTop }) => {
  const { colors } = useTheme();
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(isTop ? 1 : 0.95);
  const opacity = useSharedValue(1);
  const rotation = useSharedValue(0);
  const circleScale = useSharedValue(0);
  const circleOpacity = useSharedValue(0);
  const cardColor = useSharedValue(colors.background[0]); // Default white color
  const leftCircleOpacity = useSharedValue(0);
  const rightCircleOpacity = useSharedValue(0);

  const handleSwipe = (direction: "left" | "right") => {
    // Right swipe = match, Left swipe = pass
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

      // Show visual feedback during swipe
      const progress = Math.abs(translateX.value) / SWIPE_THRESHOLD;
      const isRightSwipe = translateX.value > 0;
      const isLeftSwipe = translateX.value < 0;

      if (progress > 0.3) {
        circleScale.value = withSpring(Math.min(progress, 1), { damping: 15 });

        // Show only relevant icon based on direction
        if (isRightSwipe) {
          leftCircleOpacity.value = withSpring(1, { damping: 15 }); // Love icon on left
          rightCircleOpacity.value = withSpring(0, { damping: 15 });
          // Progressive green color for right swipe (match)
          const greenIntensity = Math.min(progress, 1);
          // Blend from white to green
          const r = Math.round(255 + (16 - 255) * greenIntensity);
          const g = Math.round(255 + (185 - 255) * greenIntensity);
          const b = Math.round(255 + (129 - 255) * greenIntensity);
          cardColor.value = `rgb(${r}, ${g}, ${b})`;
        } else if (isLeftSwipe) {
          rightCircleOpacity.value = withSpring(1, { damping: 15 }); // Cross icon on right
          leftCircleOpacity.value = withSpring(0, { damping: 15 });
          // Progressive red color for left swipe (pass)
          const redIntensity = Math.min(progress, 1);
          // Blend from white to red
          const r = Math.round(255 + (239 - 255) * redIntensity);
          const g = Math.round(255 + (68 - 255) * redIntensity);
          const b = Math.round(255 + (68 - 255) * redIntensity);
          cardColor.value = `rgb(${r}, ${g}, ${b})`;
        }

        // Rotate based on direction
        if (isRightSwipe) {
          rotation.value = withSpring(15, { damping: 15 });
        } else if (isLeftSwipe) {
          rotation.value = withSpring(-15, { damping: 15 });
        }
      } else {
        circleScale.value = withSpring(0, { damping: 15 });
        leftCircleOpacity.value = withSpring(0, { damping: 15 });
        rightCircleOpacity.value = withSpring(0, { damping: 15 });
        rotation.value = withSpring(0, { damping: 15 });
        cardColor.value = colors.background[0]; // Reset to default white color
      }
    },
    onEnd: (event) => {
      if (!isTop) return;

      const velocity = event.velocityX;
      const translation = translateX.value;

      if (Math.abs(velocity) > 500 || Math.abs(translation) > SWIPE_THRESHOLD) {
        // Swipe detected
        const direction = translation > 0 ? "right" : "left";
        const endX =
          direction === "right" ? screenWidth * 1.5 : -screenWidth * 1.5;

        // Complete the circle animation
        circleScale.value = withSpring(1.2, { damping: 15 });
        circleOpacity.value = withSpring(1, { damping: 15 });

        // Animate card off screen
        translateX.value = withSpring(endX, { damping: 15 });
        translateY.value = withSpring(0);
        opacity.value = withSpring(0, { damping: 15 });

        // Call swipe handler after animation
        runOnJS(handleSwipe)(direction);
      } else {
        // Return to center
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        circleScale.value = withSpring(0);
        leftCircleOpacity.value = withSpring(0);
        rightCircleOpacity.value = withSpring(0);
        rotation.value = withSpring(0);
        cardColor.value = withSpring(colors.background[0]);
      }
    },
  });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotation.value}deg` },
        { scale: scale.value },
      ],
      opacity: opacity.value,
      zIndex: isTop ? 10 : index,
    };
  });

  const cardAnimatedStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: cardColor.value,
      borderRadius: 24,
      overflow: "hidden",
    };
  });

  const leftCircleAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: circleScale.value }],
      opacity: leftCircleOpacity.value,
    };
  });

  const rightCircleAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: circleScale.value }],
      opacity: rightCircleOpacity.value,
    };
  });

  return (
    <PanGestureHandler onGestureEvent={gestureHandler}>
      <Animated.View
        style={[
          {
            position: "absolute",
            width: screenWidth * 0.875,
            height: 420,
            alignSelf: "center",
            top: 50,
          },
          animatedStyle,
        ]}
      >
        <Animated.View style={[cardAnimatedStyle]}>
          <Box className="rounded-3xl p-6 border-4   shadow-lg">
            {/* Swipe Feedback Circles */}
            <Animated.View
              style={[
                {
                  position: "absolute",
                  top: 20,
                  left: 20,
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  backgroundColor: colors.success[500],
                  justifyContent: "center",
                  alignItems: "center",
                  zIndex: 20,
                },
                leftCircleAnimatedStyle,
              ]}
            >
              <Entypo name="heart" size={35} color="white" />
            </Animated.View>

            <Animated.View
              style={[
                {
                  position: "absolute",
                  top: 20,
                  right: 20,
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  backgroundColor: colors.error[500],
                  justifyContent: "center",
                  alignItems: "center",
                  zIndex: 20,
                },
                rightCircleAnimatedStyle,
              ]}
            >
              <AntDesign name="close" size={35} color="white" />
            </Animated.View>

            {/* Chick Avatar */}
            <VStack space="md" className="items-center rounded-xl p-2">
              <View
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  backgroundColor: colors.primary[500],
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <Image
                  source={require("@/assets/images/chick.png")}
                  style={{ width: 60, height: 60 }}
                />
              </View>

              {/* User Info */}
              <VStack space="sm" className="w-full ">
                <HStack className="justify-between items-center border-b border-typography-300 pb-2">
                  <Text className="text-primary-500 font-semibold text-lg">
                    Name:
                  </Text>
                  <Text className="text-typography-0 text-lg font-semibold">
                    {user.full_name}
                  </Text>
                </HStack>

                <HStack className="justify-between items-center border-b border-typography-300 pb-2">
                  <Text className="text-primary-500 font-semibold text-lg">
                    Match Score:
                  </Text>
                  <Text className="text-typography-0 text-lg font-semibold">
                    {user.match_score}%
                  </Text>
                </HStack>

                <HStack className="justify-between items-center border-b border-typography-300 pb-2">
                  <Text className="text-primary-500 text-lg font-semibold">
                    Study Period:
                  </Text>
                  <Text className="text-typography-0 text-md text-md font-semibold">
                    {new Date(user.study_start_date).toLocaleDateString()} -{" "}
                    {new Date(user.study_end_date).toLocaleDateString()}
                  </Text>
                </HStack>

                <HStack className="justify-between items-center border-b border-typography-300 pb-2">
                  <Text className="text-primary-500 font-semibold text-lg">
                    Daily Study:
                  </Text>
                  <Text className="text-typography-0 text-lg font-semibold">
                    {user.daily_study_time.split(":")[0]}h{" "}
                    {user.daily_study_time.split(":")[1]}m
                  </Text>
                </HStack>

                <HStack className="justify-between items-center border-b border-typography-300 pb-2">
                  <Text className="text-primary-500 font-semibold text-lg">
                    Intensity:
                  </Text>
                  <Text className="text-typography-0 text-lg capitalize font-semibold">
                    {user.intensity}
                  </Text>
                </HStack>

                {user.gender && (
                  <HStack className="justify-between items-center border-b border-typography-300 pb-2">
                    <Text className="text-primary-500 font-semibold text-lg">
                      Gender:
                    </Text>
                    <Text className="text-typography-0 text-lg capitalize font-semibold">
                      {user.gender}
                    </Text>
                  </HStack>
                )}

                <HStack className="justify-between items-center pt-2">
                  <Text className="text-primary-500 font-semibold text-lg">
                    Overlap:
                  </Text>
                  <Text className="text-typography-0 text-base font-semibold">
                    {user.overlap_days} days
                  </Text>
                </HStack>
              </VStack>

              {/* Decorative Chick */}
              {/* <View style={{ position: "absolute", bottom: -10, right: '50%' }}>
                <Image
                  source={require("@/assets/images/chick-thumbs-up.png")}
                  style={{ width: 50, height: 50 }}
                />
                <Text
                  style={{
                    fontSize: 20,
                    position: "absolute",
                    top: -5,
                    right: -5,
                  }}
                >
                  ✨
                </Text>
              </View> */}
            </VStack>
          </Box>
        </Animated.View>
      </Animated.View>
    </PanGestureHandler>
  );
};

export default function HomeScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const createMatchMutation = useCreateMatch();
  const { getCurrentUserId } = useAuth();
  const { colors } = useTheme();

  // Get current user ID from auth context
  const currentUserId = getCurrentUserId();

  // Fetch potential matches from API
  const {
    data: potentialMatches,
    isLoading,
    error,
  } = usePotentialMatches(
    currentUserId || "",
    { page: 1, limit: 20 },
    !!currentUserId
  );

  const handleSwipe = (direction: "left" | "right", userId: string) => {
    if (direction === "right" && currentUserId) {
      // Match - create match via API
      createMatchMutation.mutate(
        { user1Id: currentUserId, user2Id: userId },
        {
          onSuccess: async () => {
            console.log("Match created successfully");

            // Create a chat for the new match
            try {
              await ChatService.getChat(currentUserId, userId);
              console.log("Chat created for new match");
            } catch (error) {
              console.error("Failed to create chat:", error);
            }
          },
          onError: (error) => {
            console.error("Failed to create match:", error);
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
            source={require("@/assets/images/chick.png")}
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
            source={require("@/assets/images/chick.png")}
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
  console.log("potentialMatches", potentialMatches);
  const visibleUsers = users?.slice(currentIndex, currentIndex + 3) || [];

  if (currentIndex >= users.length || users.length === 0) {
    return (
      <Box className="flex-1 bg-background-0 justify-center items-center px-6">
        <VStack space="lg" className="items-center">
          <Image
            source={require("@/assets/images/chick-thumbs-up.png")}
            style={{ width: 100, height: 100 }}
          />
          <Heading size="2xl" className="text-primary-500 text-center">
            No More Buds!
          </Heading>
          <Text className="text-typography-0 text-center text-lg">
            You've seen all available study partners for now. Check back later
            for more!
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
          source={require("@/assets/images/chick.png")}
          style={{ width: 60, height: 60 }}
        />
        <Heading size="2xl" className="text-primary-500 mt-2">
          Add Buds!
        </Heading>
      </VStack>

      {/* Cards Stack */}
      <View style={{ flex: 1, height: "100%" }}>
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
      <Box className="absolute bottom-10 left-0 right-0 px-6">
        <HStack className="justify-between items-center">
          <VStack className="items-center">
            <Text className="text-5xl">👈</Text>
            <Text className="text-typography-200 text-sm">Pass</Text>
          </VStack>
          <VStack className="items-center">
            <Text className="text-5xl">👉</Text>
            <Text className="text-typography-200 text-sm">Match</Text>
          </VStack>
        </HStack>
      </Box>
    </Box>
  );
}
