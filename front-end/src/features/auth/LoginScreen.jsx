import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native";
import { Button, Text, TextInput } from "react-native-paper";
import { Redirect } from "expo-router";
import Screen from "../../components/layout/Screen";
import { colors } from "../../constants/colors";
import { useAuth } from "../../contexts/AuthContext";
import { getAuthErrorMessage } from "../../services/firebase/auth";

export default function LoginScreen() {
  const { isAuthenticated, configured, signIn, startDemo } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  if (isAuthenticated) return <Redirect href="/(tabs)" />;

  async function submit() {
    const normalizedEmail = email.trim();
    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      setErrorMessage("Informe um endereço de e-mail válido.");
      return;
    }
    if (!password) {
      setErrorMessage("Informe sua senha.");
      return;
    }

    setErrorMessage("");
    setLoading(true);
    try {
      await signIn(normalizedEmail, password);
    } catch (error) {
      Alert.alert("Não foi possível entrar", getAuthErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen style={styles.screen}>
      <KeyboardAvoidingView style={styles.keyboardContainer} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
        <Text variant="headlineLarge" style={styles.title}>Monezy B2B</Text>
        <Text variant="bodyLarge" style={styles.subtitle}>Entre para consultar sua conta empresarial.</Text>
        {!configured ? (
          <Text accessibilityRole="alert" style={styles.warning}>
            Firebase Authentication não está configurado. Defina as variáveis EXPO_PUBLIC_FIREBASE_* para habilitar o login.
          </Text>
        ) : null}
        <TextInput
          label="E-mail"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          mode="outlined"
          style={styles.input}
          disabled={loading}
        />
        <TextInput
          label="Senha"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          mode="outlined"
          style={styles.input}
          disabled={loading}
        />
        {errorMessage ? (
          <Text accessibilityRole="alert" style={styles.warning}>{errorMessage}</Text>
        ) : null}
        <Button mode="contained" onPress={submit} loading={loading} disabled={loading || !configured}>
          Entrar
        </Button>
        <Button mode="outlined" onPress={startDemo} disabled={loading}>
          Continuar em demonstração
        </Button>
        <Text variant="bodySmall" style={styles.note}>
          A demonstração usa valores fictícios e não acessa a API.
        </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1
  },
  keyboardContainer: {
    flex: 1
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: 20
  },
  content: {
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
    gap: 14,
    paddingVertical: 24
  },
  title: {
    color: colors.primary,
    fontWeight: "700"
  },
  subtitle: {
    marginBottom: 12,
    color: colors.muted
  },
  warning: {
    color: colors.error
  },
  input: {
    backgroundColor: colors.surface
  },
  note: {
    marginTop: 8,
    color: colors.muted
  }
});
