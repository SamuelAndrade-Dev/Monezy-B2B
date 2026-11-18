import { Stack } from "expo-router";
import { PaperProvider, ActivityIndicator, Text } from "react-native-paper";
import { StyleSheet, View } from "react-native";
import { AuthProvider, useAuth } from "../src/contexts/AuthContext";
import { paperTheme } from "../src/theme/paperTheme";

function RootNavigator() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator />
        <Text>Verificando sessão...</Text>
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <PaperProvider theme={paperTheme}>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12
  }
});
