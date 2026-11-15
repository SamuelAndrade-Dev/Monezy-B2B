import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { Text, TextInput, Button, HelperText } from "react-native-paper";
import { login, register, translateAuthError } from "../src/services/auth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function submit() {
    setError("");
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError("Informe um e-mail válido.");
    if (password.length < 6) return setError("A senha precisa ter pelo menos 6 caracteres.");
    setLoading(true);
    try { await (creating ? register(email, password) : login(email, password)); }
    catch (err) { setError(translateAuthError(err)); }
    finally { setLoading(false); }
  }
  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 24 }}>
        <Text variant="headlineLarge" style={{ color: "#176B53", fontWeight: "bold" }}>Monezy B2B</Text>
        <Text variant="bodyLarge" style={{ marginBottom: 28 }}>Acompanhe seu limite empresarial demonstrativo.</Text>
        <TextInput label="E-mail" mode="outlined" keyboardType="email-address" autoCapitalize="none"
          autoComplete="email" value={email} onChangeText={setEmail} style={{ marginBottom: 12 }} />
        <TextInput label="Senha" mode="outlined" secureTextEntry value={password} onChangeText={setPassword}
          style={{ marginBottom: 8 }} />
        {!!error && <HelperText type="error" visible>{error}</HelperText>}
        <Button mode="contained" loading={loading} disabled={loading} onPress={submit} style={{ marginTop: 12 }}>
          {creating ? "Criar conta de demonstração" : "Entrar"}
        </Button>
        <Button onPress={() => { setCreating(!creating); setError(""); }} disabled={loading} style={{ marginTop: 12 }}>
          {creating ? "Já tenho conta" : "Criar conta"}
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
