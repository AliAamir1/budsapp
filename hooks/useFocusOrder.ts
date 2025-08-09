import { useMemo, useRef } from 'react';

type SubmitCallback = (() => void) | undefined;

export function useFocusOrder(fieldOrder: string[]) {
  const refs = useRef<Record<string, any>>({});

  const indexOf = (name: string) => fieldOrder.indexOf(name);
  const isLast = (name: string) => indexOf(name) === fieldOrder.length - 1;

  const getRef = (name: string) => (node: any) => {
    refs.current[name] = node;
  };

  const focusNext = (name: string) => {
    const currentIndex = indexOf(name);
    if (currentIndex > -1 && currentIndex < fieldOrder.length - 1) {
      const nextName = fieldOrder[currentIndex + 1];
      refs.current[nextName]?.focus?.();
    }
  };

  const returnKeyType = (name: string): 'next' | 'go' =>
    isLast(name) ? 'go' : 'next';

  const blurOnSubmit = (name: string): boolean => !isLast(name) ? false : true;

  const onSubmitEditing = (name: string, submit?: SubmitCallback) => () => {
    if (isLast(name)) {
      submit?.();
    } else {
      focusNext(name);
    }
  };

  return useMemo(
    () => ({ getRef, focusNext, returnKeyType, blurOnSubmit, onSubmitEditing, isLast }),
    []
  );
}

