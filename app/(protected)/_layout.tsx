import { Box } from '@/components/ui/box';
import { Spinner } from '@/components/ui/spinner';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';

export default function ProtectedLayout() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasNavigated, setHasNavigated] = useState(false);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = await AsyncStorage.getItem('access_token');
        const authenticated = !!token;
        setIsAuthenticated(authenticated);
        
        if (!authenticated && !hasNavigated) {
          setHasNavigated(true);
          router.replace('/(auth)/login');
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        setIsAuthenticated(false);
        if (!hasNavigated) {
          setHasNavigated(true);
          router.replace('/(auth)/login');
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, [router, hasNavigated]);

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
    </Stack>
  );
}