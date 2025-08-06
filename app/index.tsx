import { Box } from '@/components/ui/box';
import { Spinner } from '@/components/ui/spinner';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';

export default function RootIndex() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [hasNavigated, setHasNavigated] = useState(false);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = await AsyncStorage.getItem('access_token');
        const isAuthenticated = !!token;
        
        if (!hasNavigated) {
          setHasNavigated(true);
          if (isAuthenticated) {
            router.replace('/(protected)');
          } else {
            router.replace('/(auth)/login');
          }
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
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

  if (isLoading) {
    return (
      <Box className="flex-1 justify-center items-center">
        <Spinner size="large" />
      </Box>
    );
  }

  return null;
}