import React from 'react';
import { Image } from 'react-native';

import { Box } from '@/components/ui/box';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

export default function ChatsScreen() {
  return (
    <Box className="flex-1 bg-background-0 justify-center items-center px-6">
      <VStack space="lg" className="items-center">
        <Image
          source={require('@/assets/images/chick.png')}
          style={{ width: 100, height: 100 }}
        />
        <Heading size="2xl" className="text-primary-500 text-center">
          Chats
        </Heading>
        <Text className="text-typography-0 text-center text-lg">
          Chat functionality coming soon! 
        </Text>
        <Text className="text-secondary-100 text-center text-sm">
          This is where you'll chat with your study buddies
        </Text>
      </VStack>
    </Box>
  );
}