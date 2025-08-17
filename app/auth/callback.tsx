import { useAuth } from "@/lib/auth-context";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";

export default function AuthCallback() {
  const router = useRouter();
  const { user } = useAuth();
  useEffect(() => {
    const handleCallback = async () => {
      console.log(
        "This is the callback of authoriazation so maybe we replace the router here"
      );
      setTimeout(() => {
        console.log("protected hitting from callback");
        // router.replace("/(protected)/(tabs)");
        console.log("user from callback", user);
        const needsOnboarding =
          !user?.gender || !user?.birthdate || !user?.region || !user?.course;

        if (needsOnboarding) {
          router.replace("/(protected)/onboarding");
        } else {
          console.log("protected hitting from login success");
          router.replace("/(protected)/(tabs)");
        }
      }, 4000);
    };

    handleCallback();
  }, [router]);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Completing sign in...</Text>
      <ActivityIndicator size="large" color="#0000ff" />
    </View>
  );
}
