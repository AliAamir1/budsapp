import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useTheme } from "@/hooks/useTheme";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Image,
    Pressable,
    ScrollView,
    StatusBar,
    View,
} from "react-native";

interface PartnerProfile {
  id: string;
  user_id: string;
  name: string;
  gender?: string;
  birthdate?: string;
  region?: string;
  course?: string;
  examDate?: string;
  bio?: string;
  examPreferences?: {
    study_start_date: string;
    study_end_date: string;
    daily_study_time: string;
    intensity: string;
  };
  partner_preferences?: {
    study_schedule: string;
    communication_style: string;
  };
  exam_name?: string;
  exam_category?: string;
  exam_country?: string;
  exam_field?: string;
}

export default function PartnerProfileScreen() {
  const { partnerId, partnerName } = useLocalSearchParams<{
    partnerId: string;
    partnerName?: string;
  }>();
  const router = useRouter();
  const { colors } = useTheme();
  const { getCurrentUserId } = useAuth();
  const currentUserId = getCurrentUserId();

  const [profile, setProfile] = useState<PartnerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPartnerProfile = async () => {
      if (!partnerId || !currentUserId) return;

      try {
        setIsLoading(true);
        const response = await apiClient.getUserProfile(partnerId);

        setProfile(response.data.user as any);
      } catch (err) {
        console.error("Failed to load partner profile:", err);
        setError("Failed to load profile information");
      } finally {
        setIsLoading(false);
      }
    };

    loadPartnerProfile();
  }, [partnerId, currentUserId]);

  const handleBackPress = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <Box className="flex-1 bg-background-0 justify-center items-center">
        <ActivityIndicator size="large" color={colors.primary[500]} />
        <Text className="text-typography-400 mt-4">Loading profile...</Text>
      </Box>
    );
  }

  if (error || !profile) {
    return (
      <Box className="flex-1 bg-background-0 justify-center items-center px-6">
        <VStack space="lg" className="items-center">
          <Ionicons
            name="person-circle-outline"
            size={80}
            color={colors.error[500]}
          />
          <Heading size="xl" className="text-error-500 text-center">
            Profile Not Found
          </Heading>
          <Text className="text-typography-400 text-center">
            {error || "Unable to load profile information"}
          </Text>
          <Button onPress={handleBackPress} className="mt-4">
            <ButtonText>Go Back</ButtonText>
          </Button>
        </VStack>
      </Box>
    );
  }

  return (
    <Box className="flex-1 bg-background-0">
      <StatusBar
        barStyle="dark-content"
        backgroundColor={colors.background[100]}
      />

      {/* Header */}
      <Box
        className="bg-background-100 border-b border-outline-200 py-4 px-4"
      >
        <HStack space="md" className="items-center">
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
            <Ionicons
              name="arrow-back"
              size={24}
              color={colors.typography[0]}
            />
          </Pressable>

          <Text className="text-typography-0 text-lg font-semibold flex-1">
            Profile
          </Text>
        </HStack>
      </Box>

      {/* Profile Content */}
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <VStack space="xl" className="p-6 pb-20">
          {/* Profile Header */}
          <VStack space="lg" className="items-center">
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: colors.primary[500],
                justifyContent: "center",
                alignItems: "center",
                borderWidth: 4,
                borderColor: colors.primary[300],
              }}
            >
              <Image
                source={require("@/assets/images/chick.png")}
                style={{ width: 60, height: 60 }}
              />
            </View>

            <VStack space="sm" className="items-center">
              <Heading size="2xl" className="text-primary-500 font-bold font-bold text-center">
                {profile.name}
              </Heading>
              {profile.gender && (
                <Text className="text-typography-400 text-lg capitalize">
                  {profile.gender}
                </Text>
              )}
            </VStack>
          </VStack>

          {/* Personal Information */}
          <VStack space="md">
            <Heading size="lg" className="text-typography-0">
              Personal Information
            </Heading>

            <Box className="bg-background-100 rounded-xl p-4">
              <VStack space="md">
                {profile.region && (
                  <HStack className="justify-between items-center">
                    <Text className=" text-lg text-primary-500 font-bold">Country</Text>
                    <Text className="text-typography-0 text-lg font-semibold">
                      {profile.region}
                    </Text>
                  </HStack>
                )}

                {profile.course && (
                  <HStack className="justify-between items-center">
                    <Text className=" text-lg text-primary-500 font-bold">Course</Text>
                    <Text className="text-typography-0 text-lg font-semibold">
                      {profile.course}
                    </Text>
                  </HStack>
                )}

                {profile.examDate && (
                  <HStack className="justify-between items-center">
                    <Text className=" text-lg text-primary-500 font-bold">
                      Exam Date
                    </Text>
                    <Text className="text-typography-0 text-lg font-semibold">
                      {new Date(profile.examDate).toLocaleDateString()}
                    </Text>
                  </HStack>
                )}
              </VStack>
            </Box>
          </VStack>

          {/* Exam Information */}
          {profile.exam_name && (
            <VStack space="md">
              <Heading size="lg" className="text-typography-0">
                Exam Information
              </Heading>

              <Box className="bg-background-100 rounded-xl p-4">
                <VStack space="md">
                  <HStack className="justify-between items-center">
                    <Text className=" text-lg text-primary-500 font-bold">Exam</Text>
                    <Text className="text-typography-0 text-lg font-semibold">
                      {profile.exam_name}
                    </Text>
                  </HStack>

                  {profile.exam_category && (
                    <HStack className="justify-between items-center">
                      <Text className=" text-lg text-primary-500 font-bold">
                        Category
                      </Text>
                      <Text className="text-typography-0 text-lg font-semibold">
                        {profile.exam_category}
                      </Text>
                    </HStack>
                  )}

                  {profile.exam_field && (
                    <HStack className="justify-between items-center">
                      <Text className=" text-lg text-primary-500 font-bold">Field</Text>
                      <Text className="text-typography-0 text-lg font-semibold">
                        {profile.exam_field}
                      </Text>
                    </HStack>
                  )}

                  {profile.exam_country && (
                    <HStack className="justify-between items-center">
                      <Text className=" text-lg text-primary-500 font-bold">
                        Country
                      </Text>
                      <Text className="text-typography-0 text-lg font-semibold">
                        {profile.exam_country}
                      </Text>
                    </HStack>
                  )}
                </VStack>
              </Box>
            </VStack>
          )}

          {/* Study Preferences */}
          {profile.examPreferences && (
            <VStack space="md">
              <Heading size="lg" className="text-typography-0">
                Study Preferences
              </Heading>

              <Box className="bg-background-100 rounded-xl p-4">
                <VStack space="md">
                  {profile.examPreferences.study_start_date &&
                    profile.examPreferences.study_end_date && (
                      <HStack className="justify-between items-center">
                        <Text className=" text-lg text-primary-500 font-bold">
                          Study Period
                        </Text>
                        <Text className="text-typography-0 text-lg font-semibold text-right">
                          {new Date(
                            profile.examPreferences.study_start_date
                          ).toLocaleDateString()}{" "}
                          -{" "}
                          {new Date(
                            profile.examPreferences.study_end_date
                          ).toLocaleDateString()}
                        </Text>
                      </HStack>
                    )}

                  {profile.examPreferences.daily_study_time && (
                    <HStack className="justify-between items-center">
                      <Text className=" text-lg text-primary-500 font-bold">
                        Daily Study Time
                      </Text>
                      <Text className="text-typography-0 text-lg font-semibold">
                        {profile.examPreferences.daily_study_time.split(":")[0]}
                        h{" "}
                        {profile.examPreferences.daily_study_time.split(":")[1]}
                        m
                      </Text>
                    </HStack>
                  )}

                  {profile.examPreferences.intensity && (
                    <HStack className="justify-between items-center">
                      <Text className=" text-lg text-primary-500 font-bold">
                        Intensity
                      </Text>
                      <Text className="text-typography-0 text-lg font-semibold capitalize">
                        {profile.examPreferences.intensity}
                      </Text>
                    </HStack>
                  )}
                </VStack>
              </Box>
            </VStack>
          )}

          {/* Partner Preferences */}
          {profile.partner_preferences && (
            <VStack space="md">
              <Heading size="lg" className="text-typography-0">
                Partner Preferences
              </Heading>

              <Box className="bg-background-100 rounded-xl p-4">
                <VStack space="md">
                  {profile.partner_preferences.study_schedule && (
                    <HStack className="justify-between items-center">
                      <Text className=" text-lg text-primary-500 font-bold">
                        Study Schedule
                      </Text>
                      <Text className="text-typography-0 text-lg font-semibold">
                        {profile.partner_preferences.study_schedule}
                      </Text>
                    </HStack>
                  )}

                  {profile.partner_preferences.communication_style && (
                    <HStack className="justify-between items-center">
                      <Text className=" text-lg text-primary-500 font-bold">
                        Communication Style
                      </Text>
                      <Text className="text-typography-0 text-lg font-semibold">
                        {profile.partner_preferences.communication_style}
                      </Text>
                    </HStack>
                  )}
                </VStack>
              </Box>
            </VStack>
          )}

          {/* Bio */}
          {profile.bio && (
            <VStack space="md">
              <Heading size="lg" className="text-typography-0">
                About
              </Heading>

              <Box className="bg-background-100 rounded-xl p-4">
                <Text className="text-typography-0 text-lg leading-relaxed">
                  {profile.bio}
                </Text>
              </Box>
            </VStack>
          )}
        </VStack>
      </ScrollView>
    </Box>
  );
}
