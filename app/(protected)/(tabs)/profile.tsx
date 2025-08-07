import { Link, useRouter } from 'expo-router';
import React from 'react';
import { Alert, Image, Pressable, View } from 'react-native';

import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useAuth } from '@/lib/auth-context';
import { useLogout } from '@/lib/queries';

export default function ProfileScreen() {
  const router = useRouter();
  const { setAuthState, user } = useAuth();
  const logoutMutation = useLogout();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logoutMutation.mutateAsync();
              setAuthState(false);
              router.replace('/(auth)/login');
            } catch (error) {
              console.error('Logout error:', error);
              // Force logout even if API call fails
              setAuthState(false);
              router.replace('/(auth)/login');
            }
          },
        },
      ]
    );
  };

  return (
    <Box className="flex-1 bg-background-0 px-6 pt-16">
      <VStack space="xl" className="items-center">
        {/* Profile Avatar - Chick Icon */}
        <View
          style={{
            width: 120,
            height: 120,
            borderRadius: 60,
            backgroundColor: '#4AC3C7',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 16,
          }}
        >
          <Image
            source={require('@/assets/images/chick.png')}
            style={{ width: 80, height: 80 }}
          />
        </View>

        {/* User Info */}
        <VStack space="sm" className="items-center">
          <Heading size="2xl" className="text-primary-500">
            {user?.name || 'Unknown User'}
          </Heading>
          <Text className="text-typography-200 text-lg">
            {user?.email || 'No email'}
          </Text>
        </VStack>

        {/* Menu Items */}
        <VStack space="md" className="w-full mt-8">
          {/* Edit Profile */}
          <Link href="/(protected)/edit-profile" asChild>
            <Pressable>
              <Box className="bg-background-950 rounded-xl p-4 border border-outline-200">
                <HStack className="items-center justify-between">
                  <HStack space="md" className="items-center">
                    <Text className="text-2xl">👤</Text>
                    <Text className="text-typography-0 text-lg font-medium">
                      Edit Profile
                    </Text>
                  </HStack>
                  <Text className="text-typography-400 text-xl">✏️</Text>
                </HStack>
              </Box>
            </Pressable>
          </Link>

          {/* Help & Support */}
          <Pressable>
            <Box className="bg-background-950 rounded-xl p-4 border border-outline-200">
              <HStack className="items-center justify-between">
                <HStack space="md" className="items-center">
                  <Text className="text-2xl">❓</Text>
                  <Text className="text-typography-0 text-lg font-medium">
                    Help & Support
                  </Text>
                </HStack>
                <Text className="text-typography-400 text-xl">›</Text>
              </HStack>
            </Box>
          </Pressable>

          {/* About Us */}
          <Pressable>
            <Box className="bg-background-950 rounded-xl p-4 border border-outline-200">
              <HStack className="items-center justify-between">
                <HStack space="md" className="items-center">
                  <Text className="text-2xl">ℹ️</Text>
                  <Text className="text-typography-0 text-lg font-medium">
                    About Us
                  </Text>
                </HStack>
                <Text className="text-typography-400 text-xl">›</Text>
              </HStack>
            </Box>
          </Pressable>

          {/* Logout */}
          <Button
            onPress={handleLogout}
            className="bg-error-500 rounded-xl mt-4"
          >
            <HStack space="md" className="items-center">
              <Text className="text-2xl">🚪</Text>
              <ButtonText className="text-white text-lg font-medium">
                Logout
              </ButtonText>
            </HStack>
          </Button>
        </VStack>
      </VStack>
    </Box>
  );
}