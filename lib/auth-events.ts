type AuthEventType = 'GOOGLE_SIGNIN_COMPLETE' | 'AUTH_STATE_CHANGED';

interface AuthEvent {
  type: AuthEventType;
  data?: any;
}

type EventListener = (event: AuthEvent) => void;

class AuthEventEmitter {
  private listeners: Map<AuthEventType, EventListener[]> = new Map();

  // Subscribe to an event
  on(eventType: AuthEventType, listener: EventListener) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType)!.push(listener);

    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(eventType);
      if (listeners) {
        const index = listeners.indexOf(listener);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    };
  }

  // Emit an event
  emit(eventType: AuthEventType, data?: any) {
    const listeners = this.listeners.get(eventType);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener({ type: eventType, data });
        } catch (error) {
          console.error('Error in auth event listener:', error);
        }
      });
    }
  }

  // Remove all listeners
  clear() {
    this.listeners.clear();
  }
}

// Create a singleton instance
export const authEventEmitter = new AuthEventEmitter();

// Helper functions for common events
export const emitGoogleSignInComplete = (userData?: any) => {
  authEventEmitter.emit('GOOGLE_SIGNIN_COMPLETE', userData);
};

export const emitAuthStateChanged = (userData?: any) => {
  authEventEmitter.emit('AUTH_STATE_CHANGED', userData);
};
