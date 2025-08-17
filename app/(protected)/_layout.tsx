import { useAuth } from "@/lib/auth-context";
import { Stack, usePathname, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";

export default function ProtectedLayout() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const pathname = usePathname();

  const [initialCheckDone, setInitialCheckDone] = useState(false);

  useEffect(() => {
    // Wait until auth finishes loading
    if (isLoading || initialCheckDone) return;

    if (
      !user?.examPreferences ||
      !user.partner_preferences ||
      !user.course ||
      !user.examDate
    ) {
      if (pathname !== "/onboarding") {
        router.replace("/(protected)/onboarding");
      }
    }

    setInitialCheckDone(true); // Only after handling redirect
  }, [user, isLoading]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="edit-profile" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="chat/[id]" />
      <Stack.Screen name="chat/partner-profile" />

    </Stack>
  );
}
