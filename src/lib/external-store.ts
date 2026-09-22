export interface ExternalStore<T> {
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => T;
  getServerSnapshot: () => T;
  set: (value: T) => void;
}

export function createExternalStore<T>(
  read: () => T,
  serverValue: T,
): ExternalStore<T> {
  let value = serverValue;
  let initialized = false;
  const listeners = new Set<() => void>();

  const emit = () => listeners.forEach((listener) => listener());

  return {
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    getSnapshot() {
      if (!initialized) {
        initialized = true;
        value = read();
      }
      return value;
    },
    getServerSnapshot() {
      return serverValue;
    },
    set(next) {
      value = next;
      initialized = true;
      emit();
    },
  };
}
