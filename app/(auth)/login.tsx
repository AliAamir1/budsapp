import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useRouter } from "expo-router";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, Image } from "react-native";

import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
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
import { VStack } from "@/components/ui/vstack";

import { useAuth } from "@/lib/auth-context";
import { useLogin } from "@/lib/queries";
import { LoginData, LoginSchema } from "@/lib/types";

export default function LoginScreen() {
  const router = useRouter();
  const loginMutation = useLogin();
  const { setAuthState } = useAuth();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginData>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginData) => {
    try {
      const response = await loginMutation.mutateAsync(data);
      // Update auth state with user data and navigate
      setAuthState(true, response.data.user);
      router.replace("/(protected)");
    } catch (error: any) {
      Alert.alert("Login Failed", error.message || "Something went wrong");
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
            {/* <Image 
              source={require('@/assets/images/chick.png')} 
              alt="Chick 1" 
              style={{ width: 60, height: 60 }}
            />
            <Image 
              source={require('@/assets/images/chick-thumbs-up.png')} 
              alt="Chick 2" 
              style={{ width: 60, height: 60 }}
            /> */}
            <Image
              source={require("@/assets/images/logo.png")}
              alt="Chick 2"
              style={{ width: 160, height: 80 }}
            />
          </HStack>

          <Text size="lg" className="text-center text-secondary-100 italic">
            Login
          </Text>
        </VStack>

        {/* Form */}
        <VStack space="lg">
          {/* Email Field */}
          <FormControl isInvalid={!!errors.email}>
            <FormControlLabel>
              <FormControlLabelText className="text-typography-0">
                Email
              </FormControlLabelText>
            </FormControlLabel>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input size="xl" className="px-2 rounded-lg">
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
              <FormControlLabelText className="text-typography-0">
                Password
              </FormControlLabelText>
            </FormControlLabel>
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input className="px-2 rounded-lg" size="xl">
                  <InputField
                    placeholder="Enter your password"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    secureTextEntry
                    autoComplete="password"
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

          {/* Login Button */}
          <Button
            onPress={handleSubmit(onSubmit)}
            isDisabled={loginMutation.isPending}
            className="mt-4 bg-primary-500"
          >
            <ButtonText className="text-white font-semibold">
              {loginMutation.isPending ? "Signing In..." : "Sign In"}
            </ButtonText>
          </Button>
        </VStack>

        {/* Footer */}
        <HStack space="sm" className="justify-center">
          <Text size="sm" className="text-typography-200">
            Don't have an account?
          </Text>
          <Link href="/(auth)/register" asChild>
            <Text size="sm" className="text-secondary-100 font-medium">
              Sign Up
            </Text>
          </Link>
        </HStack>
      </VStack>
    </Box>
  );
}
