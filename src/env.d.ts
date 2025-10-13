declare global {
  namespace NodeJS {
    interface ProcessEnv {
      EXPO_PUBLIC_FUNCTIONS_URL?: string;
    }
  }
}

export {};
