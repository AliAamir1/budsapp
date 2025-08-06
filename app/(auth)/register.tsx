import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useRouter } from 'expo-router';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, Image } from 'react-native';

import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { FormControl, FormControlError, FormControlErrorText, FormControlLabel, FormControlLabelText } from '@/components/ui/form-control';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Input, InputField } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useSignUp } from '@/lib/queries';
import { SignUpData, SignUpSchema } from '@/lib/types';

export default function RegisterScreen() {
  const router = useRouter();
  const signUpMutation = useSignUp();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpData>({
    resolver: zodResolver(SignUpSchema),
    defaultValues: {
      email: '',
      password: '',
      full_name: '',
    },
  });

  const onSubmit = async (data: SignUpData) => {
    try {
      await signUpMutation.mutateAsync(data);
      Alert.alert(
        'Registration Successful',
        'Your account has been created successfully. Please login.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/(auth)/login'),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message || 'Something went wrong');
    }
  };

  return (
    <Box className="flex-1 justify-center bg-background-0 px-6">
      <VStack space="xl" className="w-full max-w-md mx-auto">
        {/* Header */}
        <VStack space="md" className="items-center">
          <Heading size="3xl" className="text-center text-primary-500">
            Buds
          </Heading>
          <Text size="lg" className="text-center text-typography-0 font-medium">
            Meet, Study, Connect
          </Text>
          
          {/* Chick Characters */}
          <HStack space="md" className="items-center justify-center my-4">
            <Image 
              source={require('@/assets/images/chick.png')} 
              alt="Chick 1" 
              style={{ width: 60, height: 60 }}
            />
            <Image 
              source={require('@/assets/images/chick-thumbs-up.png')} 
              alt="Chick 2" 
              style={{ width: 60, height: 60 }}
            />
          </HStack>
          
          <Text size="md" className="text-center text-secondary-100">
            Join Buds and find your study partner
          </Text>
        </VStack>

        {/* Form */}
        <VStack space="lg">
          {/* Full Name Field */}
          <FormControl isInvalid={!!errors.full_name}>
            <FormControlLabel>
              <FormControlLabelText className="text-typography-0">Full Name</FormControlLabelText>
            </FormControlLabel>
            <Controller
              control={control}
              name="full_name"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input>
                  <InputField
                    placeholder="Enter your full name"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    autoCapitalize="words"
                    autoComplete="name"
                  />
                </Input>
              )}
            />
            <FormControlError>
              <FormControlErrorText>
                {errors.full_name?.message}
              </FormControlErrorText>
            </FormControlError>
          </FormControl>

          {/* Email Field */}
          <FormControl isInvalid={!!errors.email}>
            <FormControlLabel>
              <FormControlLabelText className="text-typography-0">Email</FormControlLabelText>
            </FormControlLabel>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input>
                  <InputField
                    placeholder="Enter your email"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                  />
                </Input>
              )}
            />
            <FormControlError>
              <FormControlErrorText>
                {errors.email?.message}
              </FormControlErrorText>
            </FormControlError>
          </FormControl>

          {/* Password Field */}
          <FormControl isInvalid={!!errors.password}>
            <FormControlLabel>
              <FormControlLabelText className="text-typography-0">Password</FormControlLabelText>
            </FormControlLabel>
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input>
                  <InputField
                    placeholder="Enter your password (min 6 characters)"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    secureTextEntry
                    autoComplete="new-password"
                  />
                </Input>
              )}
            />
            <FormControlError>
              <FormControlErrorText>
                {errors.password?.message}
              </FormControlErrorText>
            </FormControlError>
          </FormControl>

          {/* Register Button */}
          <Button
            onPress={handleSubmit(onSubmit)}
            isDisabled={signUpMutation.isPending}
            className="mt-4 bg-primary-500"
          >
            <ButtonText className="text-white font-semibold">
              {signUpMutation.isPending ? 'Creating Account...' : 'Create Account'}
            </ButtonText>
          </Button>
        </VStack>

        {/* Footer */}
        <HStack space="sm" className="justify-center">
          <Text size="sm" className="text-typography-200">
            Already have an account?
          </Text>
          <Link href="/(auth)/login" asChild>
            <Text size="sm" className="text-secondary-100 font-medium">
              Sign In
            </Text>
          </Link>
        </HStack>
      </VStack>
    </Box>
  );
}