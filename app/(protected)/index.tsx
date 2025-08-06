import { useRouter } from 'expo-router';
import { useEffect } from 'react';

export default function ProtectedIndex() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to tabs immediately
    router.replace('/(protected)/(tabs)');
  }, [router]);

  return null;
}