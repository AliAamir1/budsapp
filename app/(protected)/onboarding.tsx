import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, Image, ScrollView } from "react-native";
import { z } from "zod";

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
import { Text } from "@/components/ui/text";
import { Textarea, TextareaInput } from "@/components/ui/textarea";
import { VStack } from "@/components/ui/vstack";

import { ElementDropdown } from "@/components/ui/element-dropdown";
import { communicationStyles } from "@/consts/communication";
import { countries } from "@/consts/countries";
import { studySchedules } from "@/consts/studySchedule";
import { useAuth } from "@/lib/auth-context";
import { useExams, useUpdateProfile } from "@/lib/queries";

const OnboardingSchema = z.object({
  name: z.string().min(1, "Name is required"),
  gender: z.enum(["male", "female", "other"]),
  birthdate: z.string().min(1, "Date of birth is required"),
  region: z.string().min(1, "Country is required"),
  course: z.string().min(1, "Course is required"),
  examDate: z.string().min(1, "Exam date is required"),
  study_schedule: z.string().min(1, "Study schedule is required"),
  communication_style: z.string().min(1, "Communication style is required"),
  bio: z.string().min(1, "Bio is required"),
  exam_id: z.string().optional(),
  study_start_date: z.string().optional(),
  study_end_date: z.string().optional(),
  daily_study_time: z.string().optional(),
  intensity: z.enum(["light", "moderate", "intense"]).optional(),
});

type OnboardingData = z.infer<typeof OnboardingSchema>;

const TOTAL_STEPS = 5;

export default function OnboardingScreen() {
  const router = useRouter();
  const { user, setAuthState } = useAuth();
  const updateProfileMutation = useUpdateProfile();
  const [currentStep, setCurrentStep] = useState(1);

  // Fetch exams from API
  const {
    data: examsData,
    isLoading: examsLoading,
    error: examsError,
  } = useExams();

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    trigger,
    setValue,
  } = useForm<OnboardingData>({
    resolver: zodResolver(OnboardingSchema),
    defaultValues: {
      name: user?.name || "",
      gender: (user?.gender as "male" | "female" | "other") || "male",
      birthdate: user?.birthdate || "",
      region: user?.region || "",
      course: user?.course || "",
      examDate: user?.examDate || "",
      study_schedule: user?.partner_preferences?.study_schedule || "",
      communication_style: user?.partner_preferences?.communication_style || "",
      bio: user?.bio || "",
      study_start_date: user?.examPreferences?.study_start_date || "",
      study_end_date: user?.examPreferences?.study_end_date || "",
      daily_study_time: user?.examPreferences?.daily_study_time || "04:00:00",
      intensity: user?.examPreferences?.intensity || "moderate",
    },
  });

  const nextStep = async () => {
    const fieldsToValidate = getFieldsForStep(currentStep);
    const isValid = await trigger(fieldsToValidate);

    if (isValid) {
      if (currentStep < TOTAL_STEPS) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getFieldsForStep = (step: number) => {
    switch (step) {
      case 1:
        return ["name", "gender", "birthdate"] as const;
      case 2:
        return ["region", "course", "examDate"] as const;
      case 3:
        return ["study_schedule", "communication_style"] as const;
      case 4:
        return ["bio"] as const;
      case 5:
        return [
          "study_start_date",
          "study_end_date",
          "daily_study_time",
          "intensity",
        ] as const;
      default:
        return [] as const;
    }
  };

  const onSubmit = async (data: OnboardingData) => {
    try {
      const profileData = {
        name: data.name,
        gender: data.gender,
        birthdate: data.birthdate,
        region: data.region,
        course: data.course,
        examDate: data.examDate,
        partner_preferences: {
          study_schedule: data.study_schedule,
          communication_style: data.communication_style,
        },
        bio: data.bio,
        examPreferences: data.exam_id
          ? {
              exam_id: data.exam_id,
              study_start_date: data.study_start_date || "",
              study_end_date: data.study_end_date || "",
              daily_study_time: data.daily_study_time || "04:00:00",
              intensity: data.intensity || "moderate",
            }
          : undefined,
      };

      const response = await updateProfileMutation.mutateAsync(profileData);

      // Update auth context with new user data
      if (user) {
        setAuthState(true, { ...user, ...profileData });
      }

      Alert.alert(
        "Welcome to Buds!",
        "Your profile has been set up successfully.",
        [
          {
            text: "Continue",
            onPress: () => router.replace("/(protected)"),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert("Error", error.message || "Something went wrong");
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <VStack space="lg">
            <Heading size="2xl" className="text-primary-500 text-center mb-4">
              Tell us about you
            </Heading>

            {/* Name Field */}
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
                      placeholder="Enter your full name"
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

            {/* Gender Selection */}
            <FormControl isInvalid={!!errors.gender}>
              <FormControlLabel>
                <FormControlLabelText className="text-typography-0 text-lg">
                  Select your gender
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
                            value === option ? "text-white" : "text-primary-500"
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
          </VStack>
        );

      case 2:
        return (
          <VStack space="lg">
            <Heading size="2xl" className="text-primary-500 text-center mb-4">
              Study Details
            </Heading>

            {/* Country */}
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
                    key={`region-${currentStep}`}
                    value={value}
                    onValueChange={onChange}
                    placeholder="Select your country"
                    items={
                      Array.isArray(countries)
                        ? countries.map((country) => ({
                            label: country.name,
                            value: country.name,
                          }))
                        : []
                    }
                    size="xl"
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
                    key={`course-${currentStep}`}
                    value={value}
                    onValueChange={(selectedCourse) => {
                      onChange(selectedCourse);
                      // Also set the exam_id when course is selected
                      const selectedExam = examsData?.data?.find(
                        (exam) => exam.name === selectedCourse
                      );
                      if (selectedExam) {
                        // Update the exam_id field using setValue from useForm
                        setValue("exam_id", selectedExam.id);
                      }
                    }}
                    placeholder={
                      examsLoading ? "Loading courses..." : "Select your course"
                    }
                    items={
                      Array.isArray(examsData?.data)
                        ? examsData.data.map((exam) => ({
                            label: exam.name,
                            value: exam.name,
                          }))
                        : []
                    }
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
          </VStack>
        );

      case 3:
        return (
          <VStack space="lg">
            <Heading size="2xl" className="text-primary-500 text-center mb-4">
              Study Preferences
            </Heading>

            {/* Study Schedule */}
            <FormControl isInvalid={!!errors.study_schedule}>
              <FormControlLabel>
                <FormControlLabelText className="text-typography-0 text-lg">
                  Preferred Study Time
                </FormControlLabelText>
              </FormControlLabel>
              <Controller
                control={control}
                name="study_schedule"
                render={({ field: { onChange, value } }) => (
                  <ElementDropdown
                    key={`study_schedule-${currentStep}`}
                    value={value}
                    onValueChange={onChange}
                    placeholder="When do you prefer to study?"
                    items={
                      Array.isArray(studySchedules)
                        ? studySchedules.map((schedule) => ({
                            label: schedule.label,
                            value: schedule.value,
                          }))
                        : []
                    }
                    size="xl"
                    zIndex={3000}
                  />
                )}
              />
              <FormControlError>
                <FormControlErrorText className="text-lg">
                  {errors.study_schedule?.message}
                </FormControlErrorText>
              </FormControlError>
            </FormControl>

            {/* Communication Style */}
            <FormControl isInvalid={!!errors.communication_style}>
              <FormControlLabel>
                <FormControlLabelText className="text-typography-0 text-lg">
                  Preferred Communication
                </FormControlLabelText>
              </FormControlLabel>
              <Controller
                control={control}
                name="communication_style"
                render={({ field: { onChange, value } }) => (
                  <ElementDropdown
                    key={`communication_style-${currentStep}`}
                    value={value}
                    onValueChange={onChange}
                    placeholder="How do you like to communicate?"
                    items={
                      Array.isArray(communicationStyles)
                        ? communicationStyles.map((style) => ({
                            label: style.label,
                            value: style.value,
                          }))
                        : []
                    }
                    size="xl"
                    zIndex={2000}
                  />
                )}
              />
              <FormControlError>
                <FormControlErrorText className="text-lg">
                  {errors.communication_style?.message}
                </FormControlErrorText>
              </FormControlError>
            </FormControl>
          </VStack>
        );

      case 4:
        return (
          <VStack space="lg">
            <Heading size="2xl" className="text-primary-500 text-center mb-4">
              Tell us about yourself
            </Heading>

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
                  <Textarea size="xl" className="rounded-xl min-h-[120px]">
                    <TextareaInput
                      placeholder="Tell us about yourself and what you're looking for in a study partner..."
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      className="text-lg"
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
          </VStack>
        );

      case 5:
        return (
          <VStack space="lg">
            <Heading size="2xl" className="text-primary-500 text-center mb-4">
              Study Preferences
            </Heading>

            {/* Study Start Date */}
            <FormControl isInvalid={!!errors.study_start_date}>
              <FormControlLabel>
                <FormControlLabelText className="text-typography-0 text-lg">
                  Study Start Date
                </FormControlLabelText>
              </FormControlLabel>
              <Controller
                control={control}
                name="study_start_date"
                render={({ field: { onChange, value } }) => (
                  <DatePicker
                    value={value}
                    onDateChange={onChange}
                    placeholder="When do you want to start studying?"
                    size="xl"
                    className="px-4 rounded-xl"
                    minimumDate={new Date()}
                    maximumDate={new Date(2030, 11, 31)}
                  />
                )}
              />
              <FormControlError>
                <FormControlErrorText className="text-lg">
                  {errors.study_start_date?.message}
                </FormControlErrorText>
              </FormControlError>
            </FormControl>

            {/* Study End Date */}
            <FormControl isInvalid={!!errors.study_end_date}>
              <FormControlLabel>
                <FormControlLabelText className="text-typography-0 text-lg">
                  Study End Date
                </FormControlLabelText>
              </FormControlLabel>
              <Controller
                control={control}
                name="study_end_date"
                render={({ field: { onChange, value } }) => (
                  <DatePicker
                    value={value}
                    onDateChange={onChange}
                    placeholder="When do you want to finish studying?"
                    size="xl"
                    className="px-4 rounded-xl"
                    minimumDate={new Date()}
                    maximumDate={new Date(2030, 11, 31)}
                  />
                )}
              />
              <FormControlError>
                <FormControlErrorText className="text-lg">
                  {errors.study_end_date?.message}
                </FormControlErrorText>
              </FormControlError>
            </FormControl>

            {/* Daily Study Time */}
            <FormControl isInvalid={!!errors.daily_study_time}>
              <FormControlLabel>
                <FormControlLabelText className="text-typography-0 text-lg">
                  Daily Study Time (Hours)
                </FormControlLabelText>
              </FormControlLabel>
              <Controller
                control={control}
                name="daily_study_time"
                render={({ field: { onChange, value } }) => (
                  <ElementDropdown
                    key={`daily_study_time-${currentStep}`}
                    value={value}
                    onValueChange={onChange}
                    placeholder="How many hours per day?"
                    items={[
                      { label: "1 hour", value: "01:00:00" },
                      { label: "2 hours", value: "02:00:00" },
                      { label: "3 hours", value: "03:00:00" },
                      { label: "4 hours", value: "04:00:00" },
                      { label: "5 hours", value: "05:00:00" },
                      { label: "6 hours", value: "06:00:00" },
                      { label: "7 hours", value: "07:00:00" },
                      { label: "8 hours", value: "08:00:00" },
                    ]}
                    size="xl"
                    zIndex={1000}
                  />
                )}
              />
              <FormControlError>
                <FormControlErrorText className="text-lg">
                  {errors.daily_study_time?.message}
                </FormControlErrorText>
              </FormControlError>
            </FormControl>

            {/* Study Intensity */}
            <FormControl isInvalid={!!errors.intensity}>
              <FormControlLabel>
                <FormControlLabelText className="text-typography-0 text-lg">
                  Study Intensity
                </FormControlLabelText>
              </FormControlLabel>
              <Controller
                control={control}
                name="intensity"
                render={({ field: { onChange, value } }) => (
                  <HStack space="md" className="flex-wrap">
                    {["light", "moderate", "intense"].map((option) => (
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
                          className={`text-sm capitalize ${
                            value === option ? "text-white" : "text-primary-500"
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
                  {errors.intensity?.message}
                </FormControlErrorText>
              </FormControlError>
            </FormControl>
          </VStack>
        );

      default:
        return null;
    }
  };

  return (
    <Box className="flex-1 bg-background-0 relative">
      <ScrollView className="flex-1 px-6">
        <VStack space="xl" className="py-12">
          {/* Header with Logo */}
          <VStack space="md" className="items-center">
            <Image
              source={require("@/assets/images/logo.png")}
              alt="Buds Logo"
              style={{ width: 120, height: 60 }}
            />
            <Text size="lg" className="text-center text-secondary-100">
              Step {currentStep} of {TOTAL_STEPS}
            </Text>

            {/* Progress Bar */}
            <Box className="w-full bg-gray-300 rounded-full h-2 mt-2">
              <Box
                className="bg-primary-500 h-2 rounded-full"
                style={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}
              />
            </Box>
          </VStack>

          {/* Current Step Content */}
          {renderStep()}
        </VStack>
      </ScrollView>
      {/* Navigation Buttons */}
      <HStack
        space="md"
        className="mt-8 absolute bottom-10 left-0 right-0 px-6"
      >
        {currentStep > 1 && (
          <Button
            variant="outline"
            onPress={prevStep}
            className="flex-1 border-primary-300 rounded-xl"
            size="lg"
          >
            <ButtonText className="text-primary-500 text-lg">Back</ButtonText>
          </Button>
        )}

        <Button
          onPress={
            currentStep === TOTAL_STEPS ? handleSubmit(onSubmit) : nextStep
          }
          className="flex-1 bg-primary-500 rounded-xl"
          isDisabled={updateProfileMutation.isPending}
          size="lg"
        >
          <ButtonText className="text-white text-lg font-semibold">
            {currentStep === TOTAL_STEPS
              ? updateProfileMutation.isPending
                ? "Completing..."
                : "Complete"
              : "Next"}
          </ButtonText>
        </Button>
      </HStack>
    </Box>
  );
}
