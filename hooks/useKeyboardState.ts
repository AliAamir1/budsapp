import { useEffect, useState } from 'react';
import { Keyboard, KeyboardEvent } from 'react-native';

interface KeyboardState {
  isVisible: boolean;
  keyboardHeight: number;
}

export const useKeyboardState = (): KeyboardState => {
  const [keyboardState, setKeyboardState] = useState<KeyboardState>({
    isVisible: false,
    keyboardHeight: 0,
  });

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', (e: KeyboardEvent) => {
      setKeyboardState({
        isVisible: true,
        keyboardHeight: e.endCoordinates.height,
      });
    });

    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardState({
        isVisible: false,
        keyboardHeight: 0,
      });
    });

    return () => {
      showSubscription?.remove();
      hideSubscription?.remove();
    };
  }, []);

  return keyboardState;
}; 