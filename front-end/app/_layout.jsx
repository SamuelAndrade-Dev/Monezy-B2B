import { Stack } from "expo-router";
import { PaperProvider } from "react-native-paper";
import { AuthProvider } from "../src/contexts/AuthContext";
import { paperTheme } from "../src/theme/paperTheme";

export default function RootLayout() {
  return (
    <PaperProvider theme={paperTheme}>
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </AuthProvider>
    </PaperProvider>
  );
}
