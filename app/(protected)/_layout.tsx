import { useAuth } from "@/lib/auth-context";
import { Stack, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";

export default function ProtectedLayout() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  const [initialCheckDone, setInitialCheckDone] = useState(false);

  useEffect(() => {
    // Wait until auth finishes loading
    if (isLoading || initialCheckDone) return;

    if (!isAuthenticated) {
      router.replace("/(auth)/login");
    } else if (
      !user?.examPreferences ||
      !user.partner_preferences ||
      !user.course ||
      !user.examDate
    ) {
      router.replace("/(protected)/onboarding");
    }

    setInitialCheckDone(true); // Only after handling redirect
  }, [isAuthenticated, user, isLoading]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="*" />
    </Stack>
  );
}
