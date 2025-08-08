import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";

import { HapticTab } from "@/components/HapticTab";
import { IconSymbol } from "@/components/ui/IconSymbol";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useTheme } from "@/hooks/useTheme";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { colors } = useTheme();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary[500], // Use theme primary color
        tabBarInactiveTintColor: colors.typography[400], // Use theme gray for inactive
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a solid background instead of blur for better shadow visibility
            position: "absolute",
            height: 77,
            paddingBottom: 10,
            paddingTop: 8,
            backgroundColor: colors.background[0],
            borderTopWidth: 3,
            borderTopColor: colors.primary[500],
            borderLeftWidth: 1,
            borderRightWidth: 1,
            borderLeftColor: colors.outline[200],
            borderRightColor: colors.outline[200],
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.25,
            shadowRadius: 10,
          },
          default: {
            height: 77,
            paddingBottom: 10,
            paddingTop: 8,
            backgroundColor: colors.background[0],
            borderTopWidth: 3,
            borderTopColor: colors.primary[500],
            borderLeftWidth: 1,
            borderRightWidth: 1,
            borderLeftColor: colors.outline[200],
            borderRightColor: colors.outline[200],
            elevation: 12,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.25,
            shadowRadius: 10,
          },
        }),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="chats"
        options={{
          title: "Chats",
          tabBarIcon: ({ color }) => (
            <Ionicons
              size={28}
              name="chatbox-ellipses"
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <Ionicons
              size={28}
              name="person-circle"
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
