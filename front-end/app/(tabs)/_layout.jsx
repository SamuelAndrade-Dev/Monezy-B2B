import { Redirect, Tabs } from "expo-router";
import { StyleSheet, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ActivityIndicator } from "react-native-paper";
import { colors } from "../../src/constants/colors";
import { useAuth } from "../../src/contexts/AuthContext";

export default function TabsLayout() {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <View style={styles.loading}><ActivityIndicator /></View>;
  if (!isAuthenticated) return <Redirect href="/(auth)/login" />;

  return (
    <Tabs screenOptions={{
      headerStyle: { backgroundColor: colors.surface },
      headerTitleStyle: { fontWeight: "700" },
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.muted
    }}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Início",
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="view-dashboard-outline" color={color} size={size} />
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: "Movimentações",
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="swap-horizontal" color={color} size={size} />
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="account-outline" color={color} size={size} />
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: "center"
  }
});
