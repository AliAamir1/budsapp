import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useRouter } from "expo-router";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, Image } from "react-native";

import { Button, ButtonText } from "@/components/ui/button";
import {
  FormControl,
  FormControlError,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
} from "@/components/ui/form-control";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Input, InputField } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";

import { useAuth } from "@/lib/auth-context";
import { useLogin } from "@/lib/queries";
import { SupabaseAuth } from "@/lib/supabase-auth";
import { LoginData, LoginSchema } from "@/lib/types";

export default function LoginScreen() {
  const router = useRouter();
  const loginMutation = useLogin();
  const { setAuthState } = useAuth();

  const {
    control,
    handleSubmit,
    formState: { errors },
    setFocus,
  } = useForm<LoginData>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onTouched",
  });
  // Use react-hook-form's built-in focus management

  const onSubmit = async (data: LoginData) => {
    try {
      const response = await loginMutation.mutateAsync(data);
      await SupabaseAuth.signIn(data.email, data.password);
      // Update auth state with user data and navigate
      setAuthState(true, response.data.user);

      // Check if user needs onboarding (profile incomplete)
      const user = response.data.user;
      console.log("user", user);
      const needsOnboarding =
        !user.gender || !user.birthdate || !user.region || !user.course;

      if (needsOnboarding) {
        router.replace("/(protected)/(tabs)/profile");
      } else {
        router.replace("/(protected)");
      }
    } catch (error: any) {
      Alert.alert("Login Failed", error.message || "Something went wrong");
    }
  };

  return (
    <KeyboardAwareScrollView
      style={{ flex: 1, paddingHorizontal: 20 }}
      contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
      enableOnAndroid={true}
      extraScrollHeight={20} // give a little breathing room
      keyboardShouldPersistTaps="handled"
    >
      <VStack space="xl" className="w-full max-w-md mx-auto">
        {/* Header */}
        <VStack space="md">
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

          <Text
            size="3xl"
            className="text-center text-primary-500 italic font-bold"
          >
            Login
          </Text>
        </VStack>

        {/* Form */}

        <VStack space="lg">
          {/* Email Field */}
          <FormControl isInvalid={!!errors.email}>
            <FormControlLabel>
              <FormControlLabelText className="text-typography-0 text-xl">
                Email
              </FormControlLabelText>
            </FormControlLabel>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value, ref } }) => (
                <Input size="xl" className="px-4 rounded-xl">
                  <InputField
                    ref={ref}
                    placeholder="Enter your email"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    returnKeyType="next"
                    autoComplete="email"
                    blurOnSubmit={false}
                    onSubmitEditing={() => {
                      setFocus("password");
                    }}
                    className="text-xl"
                  />
                </Input>
              )}
            />
            <FormControlError>
              <FormControlErrorText className="text-lg">
                {errors.email?.message}
              </FormControlErrorText>
            </FormControlError>
          </FormControl>

          {/* Password Field */}
          <FormControl isInvalid={!!errors.password}>
            <FormControlLabel>
              <FormControlLabelText className="text-typography-0 text-xl">
                Password
              </FormControlLabelText>
            </FormControlLabel>
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value, ref } }) => (
                <Input className="px-4 rounded-xl" size="xl">
                  <InputField
                    ref={ref}
                    placeholder="Enter your password"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    secureTextEntry
                    autoComplete="password"
                    returnKeyType="go"
                    onSubmitEditing={handleSubmit(onSubmit)}
                    className="text-xl"
                  />
                </Input>
              )}
            />
            <FormControlError>
              <FormControlErrorText className="text-lg">
                {errors.password?.message}
              </FormControlErrorText>
            </FormControlError>
          </FormControl>

          {/* Login Button */}
          <Button
            onPress={handleSubmit(onSubmit)}
            isDisabled={loginMutation.isPending}
            className="mt-4 bg-primary-500 rounded-full"
            size="lg"
          >
            <ButtonText className="text-white font-semibold text-xl">
              {loginMutation.isPending ? "Signing In..." : "Sign In"}
            </ButtonText>
          </Button>
        </VStack>

        {/* Footer */}
        <HStack space="sm" className="justify-center">
          <Text size="lg" className="text-typography-200">
            Don't have an account?
          </Text>
          <Link href="/(auth)/register" asChild>
            <Text size="lg" className="text-primary-500 font-medium">
              Sign Up
            </Text>
          </Link>
        </HStack>
      </VStack>
    </KeyboardAwareScrollView>
  );
}
