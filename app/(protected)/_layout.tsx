import { Box } from "@/components/ui/box";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/lib/auth-context";
import { Stack, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";

export default function ProtectedLayout() {
  const router = useRouter();

  const [hasNavigated, setHasNavigated] = useState(false);
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    const checkAuthStatus = async () => {
      if (hasNavigated) return;

      console.log("isAuthenticated", isAuthenticated, "user", user);
      if (!isAuthenticated) {
        !hasNavigated && setHasNavigated(true);

        router.replace("/(auth)/login");
      } else if (
        !user?.examPreferences ||
        !user.partner_preferences ||
        !user.course ||
        !user.examDate
      ) {
        setHasNavigated(true);
        router.replace("/(protected)/onboarding");
      }
    };

    checkAuthStatus();
  }, [hasNavigated, isAuthenticated, user]);

  // Show loading while checking authentication status
  if (isLoading) {
    return (
      <Box className="flex-1 justify-center items-center">
        <Spinner size="large" />
      </Box>
    );
  }

  // Don't render protected screens if user is not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="onboarding" />
    </Stack>
  );
}
