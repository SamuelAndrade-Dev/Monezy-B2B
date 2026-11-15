import { Redirect } from "expo-router";
import { StyleSheet, View } from "react-native";
import { ActivityIndicator } from "react-native-paper";
import { useAuth } from "../src/contexts/AuthContext";

export default function Index() {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <View style={styles.loading}><ActivityIndicator /></View>;
  return <Redirect href={isAuthenticated ? "/(tabs)" : "/(auth)/login"} />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: "center"
  }
});
