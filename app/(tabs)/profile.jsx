import { View } from "react-native";
import { Avatar, Button, Card, Text } from "react-native-paper";
import Screen from "../../src/components/Screen";
import { useAppStore } from "../../src/store/useAppStore";
import { logout, translateAuthError } from "../../src/services/auth";
import { useState } from "react";
export default function ProfileScreen() {
  const user = useAppStore(s => s.user);
  const [error, setError] = useState("");
  async function leave() { try { await logout(); } catch (e) { setError(translateAuthError(e)); } }
  return <Screen>
    <Text variant="headlineMedium" style={{ fontWeight: "bold", marginBottom: 20 }}>Perfil</Text>
    <Card><Card.Content style={{ alignItems: "center", paddingVertical: 28 }}>
      <Avatar.Text size={76} label="MB" />
      <Text variant="titleLarge" style={{ marginTop: 16 }}>Conta demonstrativa</Text>
      <Text>{user?.email || "Sem e-mail"}</Text>
      <Text variant="bodySmall" style={{ marginTop: 8 }}>UID: {user?.uid}</Text>
    </Card.Content></Card>
    {!!error && <Text style={{ color: "#B91C1C", marginTop: 12 }}>{error}</Text>}
    <Button mode="outlined" onPress={leave} style={{ marginTop: 24 }}>Sair da conta</Button>
  </Screen>;
}
