import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, Image, KeyboardAvoidingView, ScrollView } from "react-native";

import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import {
  FormControl,
  FormControlError,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
} from "@/components/ui/form-control";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Input, InputField } from "@/components/ui/input";

import { ElementDropdown } from "@/components/ui/element-dropdown";
import { Text } from "@/components/ui/text";
import { Textarea, TextareaInput } from "@/components/ui/textarea";
import { VStack } from "@/components/ui/vstack";

import { communicationStyles } from "@/consts/communication";
import { countries } from "@/consts/countries";
import { courses } from "@/consts/courses";
import { studySchedules } from "@/consts/studySchedule";
import { useAuth } from "@/lib/auth-context";
import { useExams, useUpdateProfile } from "@/lib/queries";
import { UpdateProfileData, UpdateProfileSchema } from "@/lib/types";

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, setAuthState } = useAuth();
  const updateProfileMutation = useUpdateProfile();
  const { data: examsData } = useExams();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateProfileData>({
    resolver: zodResolver(UpdateProfileSchema),
    defaultValues: {
      name: user?.name || "",
      gender: (user?.gender as "male" | "female" | "other") || undefined,
      birthdate: user?.birthdate || "",
      region: user?.region || "",
      course: user?.course || "",
      examDate: user?.examDate || "",
      partner_preferences: {
        study_schedule:
          (user?.partner_preferences as any)?.study_schedule || "",
        communication_style:
          (user?.partner_preferences as any)?.communication_style || "",
      },
      bio: user?.bio || "",
      is_premium: user?.is_premium || false,
      examPreferences: (user?.examPreferences as any) || undefined,
    },
  });

  const onSubmit = async (data: UpdateProfileData) => {
    try {
      await updateProfileMutation.mutateAsync(data);

      // Update auth context with new user data
      if (user) {
        setAuthState(true, { ...user, ...data });
      }

      Alert.alert("Success", "Profile updated successfully!", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to update profile");
    }
  };

  return (
    <Box className="flex-1 bg-background-0">
      <KeyboardAvoidingView behavior="padding" className="flex-1">
        <ScrollView className="flex-1 px-6 pt-16">
          <VStack space="xl" className="pb-8">
            {/* Header */}
            <VStack space="md" className="items-center">
              <Image
                source={require("@/assets/images/logo.png")}
                alt="Buds Logo"
                style={{ width: 120, height: 60 }}
              />
              <Heading size="3xl" className="text-primary-500">
                Edit Profile
              </Heading>
              <Text size="lg" className="text-typography-200 text-center">
                Update your profile to find better study partners
              </Text>
            </VStack>

            {/* Form */}
            <VStack space="2xl">
              {/* Name */}
              <FormControl isInvalid={!!errors.name}>
                <FormControlLabel>
                  <FormControlLabelText className="text-typography-0 text-lg">
                    Name
                  </FormControlLabelText>
                </FormControlLabel>
                <Controller
                  control={control}
                  name="name"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input size="xl" className="px-4 rounded-xl">
                      <InputField
                        placeholder="Enter your name"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        className="text-lg"
                      />
                    </Input>
                  )}
                />
                <FormControlError>
                  <FormControlErrorText className="text-lg">
                    {errors.name?.message}
                  </FormControlErrorText>
                </FormControlError>
              </FormControl>

              {/* Gender */}
              <FormControl isInvalid={!!errors.gender}>
                <FormControlLabel>
                  <FormControlLabelText className="text-typography-0 text-lg">
                    Gender
                  </FormControlLabelText>
                </FormControlLabel>
                <Controller
                  control={control}
                  name="gender"
                  render={({ field: { onChange, value } }) => (
                    <HStack space="md" className="flex-wrap">
                      {["male", "female", "other"].map((option) => (
                        <Button
                          key={option}
                          variant={value === option ? "solid" : "outline"}
                          onPress={() => onChange(option)}
                          className={`flex-1 min-w-[100px] ${
                            value === option
                              ? "bg-primary-500"
                              : "bg-transparent border-primary-300"
                          }`}
                          size="lg"
                        >
                          <ButtonText
                            className={`text-lg capitalize ${
                              value === option
                                ? "text-white"
                                : "text-primary-500"
                            }`}
                          >
                            {option}
                          </ButtonText>
                        </Button>
                      ))}
                    </HStack>
                  )}
                />
                <FormControlError>
                  <FormControlErrorText className="text-lg">
                    {errors.gender?.message}
                  </FormControlErrorText>
                </FormControlError>
              </FormControl>

              {/* Date of Birth */}
              <FormControl isInvalid={!!errors.birthdate}>
                <FormControlLabel>
                  <FormControlLabelText className="text-typography-0 text-lg">
                    Date of Birth
                  </FormControlLabelText>
                </FormControlLabel>
                <Controller
                  control={control}
                  name="birthdate"
                  render={({ field: { onChange, value } }) => (
                    <DatePicker
                      value={value}
                      onDateChange={onChange}
                      placeholder="Select your date of birth"
                      size="xl"
                      className="px-4 rounded-xl"
                      maximumDate={new Date()} // Can't select future dates
                      minimumDate={new Date(1900, 0, 1)} // Reasonable minimum
                    />
                  )}
                />
                <FormControlError>
                  <FormControlErrorText className="text-lg">
                    {errors.birthdate?.message}
                  </FormControlErrorText>
                </FormControlError>
              </FormControl>

              {/* Region */}
              <FormControl isInvalid={!!errors.region}>
                <FormControlLabel>
                  <FormControlLabelText className="text-typography-0 text-lg">
                    Country
                  </FormControlLabelText>
                </FormControlLabel>
                <Controller
                  control={control}
                  name="region"
                  render={({ field: { onChange, value } }) => (
                    <ElementDropdown
                      value={value}
                      onValueChange={onChange}
                      placeholder="Select your country"
                      items={countries.map((country) => ({
                        label: country.name,
                        value: country.name,
                      }))}
                      size="lg"
                      zIndex={5000}
                    />
                  )}
                />
                <FormControlError>
                  <FormControlErrorText className="text-lg">
                    {errors.region?.message}
                  </FormControlErrorText>
                </FormControlError>
              </FormControl>

              {/* Course */}
              <FormControl isInvalid={!!errors.course}>
                <FormControlLabel>
                  <FormControlLabelText className="text-typography-0 text-lg">
                    Course/Exam
                  </FormControlLabelText>
                </FormControlLabel>
                <Controller
                  control={control}
                  name="course"
                  render={({ field: { onChange, value } }) => (
                    <ElementDropdown
                      value={value}
                      onValueChange={onChange}
                      placeholder="Select your course"
                      items={courses.map((course) => ({
                        label: course.label,
                        value: course.value,
                      }))}
                      size="xl"
                      zIndex={4000}
                    />
                  )}
                />
                <FormControlError>
                  <FormControlErrorText className="text-lg">
                    {errors.course?.message}
                  </FormControlErrorText>
                </FormControlError>
              </FormControl>

              {/* Exam Date */}
              <FormControl isInvalid={!!errors.examDate}>
                <FormControlLabel>
                  <FormControlLabelText className="text-typography-0 text-lg">
                    Exam Date
                  </FormControlLabelText>
                </FormControlLabel>
                <Controller
                  control={control}
                  name="examDate"
                  render={({ field: { onChange, value } }) => (
                    <DatePicker
                      value={value}
                      onDateChange={onChange}
                      placeholder="Select your exam date"
                      size="xl"
                      className="px-4 rounded-xl"
                      minimumDate={new Date()} // Can't select past dates for exams
                      maximumDate={new Date(2030, 11, 31)} // Reasonable maximum
                    />
                  )}
                />
                <FormControlError>
                  <FormControlErrorText className="text-lg">
                    {errors.examDate?.message}
                  </FormControlErrorText>
                </FormControlError>
              </FormControl>

              {/* Study Schedule Preference */}
              <FormControl
                isInvalid={!!errors.partner_preferences?.study_schedule}
              >
                <FormControlLabel>
                  <FormControlLabelText className="text-typography-0 text-lg">
                    Preferred Study Schedule
                  </FormControlLabelText>
                </FormControlLabel>
                <Controller
                  control={control}
                  name="partner_preferences.study_schedule"
                  render={({ field: { onChange, value } }) => (
                    <ElementDropdown
                      value={value}
                      onValueChange={onChange}
                      placeholder="Select study schedule"
                      items={studySchedules.map((schedule) => ({
                        label: schedule.label,
                        value: schedule.value,
                      }))}
                      size="xl"
                      zIndex={3000}
                    />
                  )}
                />
                <FormControlError>
                  <FormControlErrorText className="text-lg">
                    {errors.partner_preferences?.study_schedule?.message}
                  </FormControlErrorText>
                </FormControlError>
              </FormControl>

              {/* Communication Style */}
              <FormControl
                isInvalid={!!errors.partner_preferences?.communication_style}
              >
                <FormControlLabel>
                  <FormControlLabelText className="text-typography-0 text-lg">
                    Communication Style
                  </FormControlLabelText>
                </FormControlLabel>
                <Controller
                  control={control}
                  name="partner_preferences.communication_style"
                  render={({ field: { onChange, value } }) => (
                    <ElementDropdown
                      value={value}
                      onValueChange={onChange}
                      placeholder="Select communication style"
                      items={communicationStyles.map((style) => ({
                        label: style.label,
                        value: style.value,
                      }))}
                      size="xl"
                      zIndex={2000}
                    />
                  )}
                />
                <FormControlError>
                  <FormControlErrorText className="text-lg">
                    {errors.partner_preferences?.communication_style?.message}
                  </FormControlErrorText>
                </FormControlError>
              </FormControl>

              {/* Bio */}
              <FormControl isInvalid={!!errors.bio}>
                <FormControlLabel>
                  <FormControlLabelText className="text-typography-0 text-lg">
                    Bio
                  </FormControlLabelText>
                </FormControlLabel>
                <Controller
                  control={control}
                  name="bio"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Textarea size="xl" className="rounded-xl min-h-[20px] ">
                      <TextareaInput
                        placeholder="Tell others about yourself and your study goals..."
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        multiline
                      />
                    </Textarea>
                  )}
                />
                <FormControlError>
                  <FormControlErrorText className="text-lg">
                    {errors.bio?.message}
                  </FormControlErrorText>
                </FormControlError>
              </FormControl>

              {/* Action Buttons */}
              <VStack space="md" className="mt-8 mb-14">
                <Button
                  onPress={handleSubmit(onSubmit)}
                  isDisabled={updateProfileMutation.isPending}
                  className="bg-primary-500 rounded-xl"
                  size="lg"
                >
                  <ButtonText className="text-white font-semibold text-lg">
                    {updateProfileMutation.isPending
                      ? "Updating..."
                      : "Update Profile"}
                  </ButtonText>
                </Button>

                <Button
                  onPress={() => router.back()}
                  variant="outline"
                  className="border-typography-300 rounded-xl"
                  size="lg"
                >
                  <ButtonText className="text-typography-0">Cancel</ButtonText>
                </Button>
              </VStack>
            </VStack>
          </VStack>
        </ScrollView>
      </KeyboardAvoidingView>
    </Box>
  );
}
