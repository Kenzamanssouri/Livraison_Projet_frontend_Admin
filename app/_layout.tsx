// app/_layout.tsx
import React, { useEffect, useState } from "react";
import { Stack, useRouter } from "expo-router";
import { Provider as PaperProvider } from "react-native-paper";

export default function RootLayout() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      const userIsLoggedIn = false; // 👉 Remplace par ton vrai contrôle d'authentification
      if (!userIsLoggedIn) {
        router.replace("/login");
      }
    }
  }, [isMounted]);

  return (
    <PaperProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </PaperProvider>
  );
}
