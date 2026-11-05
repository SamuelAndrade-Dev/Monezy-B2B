import { Tabs } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: "#FFFFFF" },
        headerTitleStyle: { fontWeight: "700" },
        tabBarActiveTintColor: "#176B53",
        tabBarInactiveTintColor: "#64748B"
      }}
    >
      <Tabs.Screen name="index" options={{
        title: "Início",
        tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="view-dashboard-outline" color={color} size={size} />
      }} />
      <Tabs.Screen name="transactions" options={{
        title: "Movimentações",
        tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="swap-horizontal" color={color} size={size} />
      }} />
      <Tabs.Screen name="profile" options={{
        title: "Perfil",
        tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="account-outline" color={color} size={size} />
      }} />
    </Tabs>
  );
}
