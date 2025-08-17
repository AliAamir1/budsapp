import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import "@/global.css";
import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/useColorScheme";
import { AuthProvider } from "@/lib/auth-context";
import { QueryProvider } from "@/lib/query-client";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <SafeAreaView className="flex-1">
      <GestureHandlerRootView style={{ flex: 1 }} className="pb-20">
        <AuthProvider>
          <QueryProvider>
            <GluestackUIProvider mode="light">
              <ThemeProvider
                value={DefaultTheme} //{colorScheme ===  "dark" ? DarkTheme : DefaultTheme} no theming requirements
              >
                <Stack>
                  <Stack.Screen name="index" options={{ headerShown: false }} />
                  <Stack.Screen
                    name="(auth)"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="(protected)"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen name="auth/callback" options={{ headerShown: false }} />
                  <Stack.Screen name="+not-found" />
                </Stack>
                <StatusBar style="auto" />
              </ThemeProvider>
            </GluestackUIProvider>
          </QueryProvider>
        </AuthProvider>
      </GestureHandlerRootView>
    </SafeAreaView>
  );
}
