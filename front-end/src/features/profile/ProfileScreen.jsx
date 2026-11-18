import { useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { Avatar, Button, Card, Snackbar, Text } from "react-native-paper";
import Screen from "../../components/layout/Screen";
import { colors } from "../../constants/colors";
import { useAuth } from "../../contexts/AuthContext";

export default function ProfileScreen() {
  const { user, demoMode, signOut } = useAuth();
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSignOut() {
    try {
      await signOut();
    } catch (error) {
      setErrorMessage(`Não foi possível sair: ${error.message}`);
    }
  }

  const label = (user?.displayName || user?.email || "Monezy")
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text variant="headlineMedium" style={styles.heading}>Perfil</Text>
        <Card style={styles.card}>
          <Card.Content style={styles.content}>
            <Avatar.Text size={76} label={label || "MB"} style={styles.avatar} color={colors.primary} />
            <Text variant="titleLarge" style={styles.name}>{user?.displayName || "Usuário Monezy"}</Text>
            <Text variant="bodyMedium" style={styles.email}>
              {demoMode ? "Sessão demonstrativa" : user?.email || "Conta autenticada"}
            </Text>
            {user?.uid ? <Text variant="bodySmall" style={styles.email}>UID: {user.uid}</Text> : null}
          </Card.Content>
        </Card>
        <Text variant="bodySmall" style={styles.note}>
          As informações empresariais são carregadas pela API autenticada.
        </Text>
        <Button mode="outlined" style={styles.button} onPress={handleSignOut}>
          Sair da conta
        </Button>
      </ScrollView>
      <Snackbar
        visible={Boolean(errorMessage)}
        onDismiss={() => setErrorMessage("")}
        duration={4000}
      >
        {errorMessage}
      </Snackbar>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24
  },
  heading: {
    marginBottom: 20,
    color: colors.text,
    fontWeight: "700"
  },
  card: {
    borderRadius: 16
  },
  content: {
    alignItems: "center",
    paddingVertical: 28
  },
  avatar: {
    backgroundColor: colors.positive
  },
  name: {
    marginTop: 16,
    fontWeight: "700"
  },
  email: {
    color: colors.muted
  },
  note: {
    marginTop: 20,
    color: colors.muted
  },
  button: {
    marginTop: 20
  }
});
