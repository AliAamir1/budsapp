import { authEventEmitter } from "@/lib/auth-events";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    console.log("Auth callback mounted, waiting for Google sign-in completion...");

    // Listen for Google sign-in completion
    const unsubscribe = authEventEmitter.on('GOOGLE_SIGNIN_COMPLETE', (event) => {
      console.log("Google sign-in completed, navigating to protected area");
      router.replace("/(protected)" as any);
    });

    // Cleanup listener on unmount
    return () => {
      unsubscribe();
    };
  }, [router]);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Completing sign in...</Text>
      <ActivityIndicator size="large" color="#0000ff" />
    </View>
  );
}
