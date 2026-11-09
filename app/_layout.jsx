import "../global.css";
import { useEffect } from "react";
import { Stack } from "expo-router";
import { PaperProvider, ActivityIndicator, Text } from "react-native-paper";
import { View } from "react-native";
import { paperTheme } from "../src/theme/paperTheme";
import { useAppStore } from "../src/store/useAppStore";

export default function RootLayout() {
  const start = useAppStore(s => s.start);
  const authLoading = useAppStore(s => s.authLoading);
  const user = useAppStore(s => s.user);
  useEffect(() => { start(); }, [start]);
  return (
    <PaperProvider theme={paperTheme}>
      {authLoading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator /><Text>Verificando sessão...</Text>
        </View>
      ) : (
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Protected guard={!user}><Stack.Screen name="login" /></Stack.Protected>
          <Stack.Protected guard={!!user}>
            <Stack.Screen name="(tabs)" />
          </Stack.Protected>
        </Stack>
      )}
    </PaperProvider>
  );
}
