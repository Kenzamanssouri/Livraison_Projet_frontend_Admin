// app/_layout.tsx
import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";

export default function RootLayout() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      const userIsLoggedIn = false; // Remplace par ton vrai contrôle d'authentification
      if (!userIsLoggedIn) {
        router.replace("/login");
      }
    }
  }, [isMounted]);

  return (
    <Stack screenOptions={{ headerShown: false }} />
  );
}
