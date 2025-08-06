import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, ScrollView } from 'react-native';

import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { FormControl, FormControlError, FormControlErrorText, FormControlLabel, FormControlLabelText } from '@/components/ui/form-control';
import { Heading } from '@/components/ui/heading';
import { Input, InputField } from '@/components/ui/input';
import { Select, SelectContent, SelectInput, SelectItem, SelectTrigger } from '@/components/ui/select';
import { Text } from '@/components/ui/text';
import { Textarea, TextareaInput } from '@/components/ui/textarea';
import { VStack } from '@/components/ui/vstack';

import { useExams, useUpdateProfile } from '@/lib/queries';
import { UpdateProfileData, UpdateProfileSchema } from '@/lib/types';

export default function EditProfileScreen() {
  const router = useRouter();
  const updateProfileMutation = useUpdateProfile();
  const { data: examsData } = useExams();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateProfileData>({
    resolver: zodResolver(UpdateProfileSchema),
    defaultValues: {
      name: '',
      gender: undefined,
      birthdate: '',
      region: '',
      course: '',
      examDate: '',
      partner_preferences: {
        study_schedule: '',
        communication_style: '',
      },
      bio: '',
      is_premium: false,
      examPreferences: undefined,
    },
  });

  const onSubmit = async (data: UpdateProfileData) => {
    try {
      await updateProfileMutation.mutateAsync(data);
      Alert.alert(
        'Success',
        'Profile updated successfully!',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile');
    }
  };

  return (
    <Box className="flex-1 bg-background-0">
      <ScrollView className="flex-1 px-6 pt-16">
        <VStack space="lg">
          {/* Header */}
          <VStack space="md" className="items-center">
            <Heading size="2xl" className="text-primary-500">
              Edit Profile
            </Heading>
            <Text className="text-typography-200 text-center">
              Complete your profile to find better study partners
            </Text>
          </VStack>

          {/* Form */}
          <VStack space="lg">
            {/* Name */}
            <FormControl isInvalid={!!errors.name}>
              <FormControlLabel>
                <FormControlLabelText className="text-typography-0">Name</FormControlLabelText>
              </FormControlLabel>
              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input>
                    <InputField
                      placeholder="Enter your name"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                    />
                  </Input>
                )}
              />
              <FormControlError>
                <FormControlErrorText>
                  {errors.name?.message}
                </FormControlErrorText>
              </FormControlError>
            </FormControl>

            {/* Gender */}
            <FormControl isInvalid={!!errors.gender}>
              <FormControlLabel>
                <FormControlLabelText className="text-typography-0">Gender</FormControlLabelText>
              </FormControlLabel>
              <Controller
                control={control}
                name="gender"
                render={({ field: { onChange, value } }) => (
                  <Select onValueChange={onChange} selectedValue={value}>
                    <SelectTrigger>
                      <SelectInput placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem label="Male" value="male" />
                      <SelectItem label="Female" value="female" />
                      <SelectItem label="Other" value="other" />
                    </SelectContent>
                  </Select>
                )}
              />
              <FormControlError>
                <FormControlErrorText>
                  {errors.gender?.message}
                </FormControlErrorText>
              </FormControlError>
            </FormControl>

            {/* Region */}
            <FormControl isInvalid={!!errors.region}>
              <FormControlLabel>
                <FormControlLabelText className="text-typography-0">Region</FormControlLabelText>
              </FormControlLabel>
              <Controller
                control={control}
                name="region"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input>
                    <InputField
                      placeholder="e.g., North America, Europe"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                    />
                  </Input>
                )}
              />
              <FormControlError>
                <FormControlErrorText>
                  {errors.region?.message}
                </FormControlErrorText>
              </FormControlError>
            </FormControl>

            {/* Course */}
            <FormControl isInvalid={!!errors.course}>
              <FormControlLabel>
                <FormControlLabelText className="text-typography-0">Course/Exam</FormControlLabelText>
              </FormControlLabel>
              <Controller
                control={control}
                name="course"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input>
                    <InputField
                      placeholder="e.g., SAT, GRE, MCAT"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                    />
                  </Input>
                )}
              />
              <FormControlError>
                <FormControlErrorText>
                  {errors.course?.message}
                </FormControlErrorText>
              </FormControlError>
            </FormControl>

            {/* Study Schedule Preference */}
            <FormControl isInvalid={!!errors.partner_preferences?.study_schedule}>
              <FormControlLabel>
                <FormControlLabelText className="text-typography-0">Preferred Study Schedule</FormControlLabelText>
              </FormControlLabel>
              <Controller
                control={control}
                name="partner_preferences.study_schedule"
                render={({ field: { onChange, value } }) => (
                  <Select onValueChange={onChange} selectedValue={value}>
                    <SelectTrigger>
                      <SelectInput placeholder="Select study schedule" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem label="Mornings" value="mornings" />
                      <SelectItem label="Afternoons" value="afternoons" />
                      <SelectItem label="Evenings" value="evenings" />
                      <SelectItem label="Flexible" value="flexible" />
                    </SelectContent>
                  </Select>
                )}
              />
              <FormControlError>
                <FormControlErrorText>
                  {errors.partner_preferences?.study_schedule?.message}
                </FormControlErrorText>
              </FormControlError>
            </FormControl>

            {/* Communication Style */}
            <FormControl isInvalid={!!errors.partner_preferences?.communication_style}>
              <FormControlLabel>
                <FormControlLabelText className="text-typography-0">Communication Style</FormControlLabelText>
              </FormControlLabel>
              <Controller
                control={control}
                name="partner_preferences.communication_style"
                render={({ field: { onChange, value } }) => (
                  <Select onValueChange={onChange} selectedValue={value}>
                    <SelectTrigger>
                      <SelectInput placeholder="Select communication style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem label="Video Chat" value="video chat" />
                      <SelectItem label="Voice Call" value="voice call" />
                      <SelectItem label="Text Only" value="text only" />
                      <SelectItem label="In Person" value="in person" />
                    </SelectContent>
                  </Select>
                )}
              />
              <FormControlError>
                <FormControlErrorText>
                  {errors.partner_preferences?.communication_style?.message}
                </FormControlErrorText>
              </FormControlError>
            </FormControl>

            {/* Bio */}
            <FormControl isInvalid={!!errors.bio}>
              <FormControlLabel>
                <FormControlLabelText className="text-typography-0">Bio</FormControlLabelText>
              </FormControlLabel>
              <Controller
                control={control}
                name="bio"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Textarea>
                    <TextareaInput
                      placeholder="Tell others about yourself and your study goals..."
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                    />
                  </Textarea>
                )}
              />
              <FormControlError>
                <FormControlErrorText>
                  {errors.bio?.message}
                </FormControlErrorText>
              </FormControlError>
            </FormControl>

            {/* Action Buttons */}
            <VStack space="md" className="mt-6 mb-8">
              <Button
                onPress={handleSubmit(onSubmit)}
                isDisabled={updateProfileMutation.isPending}
                className="bg-primary-500"
              >
                <ButtonText className="text-white font-semibold">
                  {updateProfileMutation.isPending ? 'Updating...' : 'Update Profile'}
                </ButtonText>
              </Button>

              <Button
                onPress={() => router.back()}
                variant="outline"
                className="border-typography-300"
              >
                <ButtonText className="text-typography-0">
                  Cancel
                </ButtonText>
              </Button>
            </VStack>
          </VStack>
        </VStack>
      </ScrollView>
    </Box>
  );
}