import { useCallback, useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { ActivityIndicator, Button, Text } from "react-native-paper";
import MetricCard from "../../components/ui/MetricCard";
import Screen from "../../components/layout/Screen";
import { colors } from "../../constants/colors";
import { useAuth } from "../../contexts/AuthContext";
import { getAccountLimits, listAccounts } from "../../services/api/accounts";

const demoLimits = {
  totalLimit: 10000,
  usedLimit: 2450,
  availableLimit: 7550,
  currency: "BRL"
};

function formatCurrency(value, currency = "BRL") {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency
  }).format(Number(value) || 0);
}

export default function DashboardScreen() {
  const { demoMode, getIdToken } = useAuth();
  const [limits, setLimits] = useState(null);
  const [loading, setLoading] = useState(!demoMode);
  const [errorMessage, setErrorMessage] = useState("");
  const [notice, setNotice] = useState("");

  const loadLimits = useCallback(async () => {
    if (demoMode) {
      setLimits(demoLimits);
      setErrorMessage("");
      setNotice("Valores fictícios do modo demonstração; sem conexão com a API.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setNotice("");
    try {
      const token = await getIdToken();
      const accounts = await listAccounts(token);
      if (!accounts.length) {
        setLimits(null);
        setNotice("Nenhuma conta empresarial foi vinculada a este usuário.");
        return;
      }
      setLimits(await getAccountLimits(accounts[0].id, token));
    } catch (error) {
      setLimits(null);
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  }, [demoMode, getIdToken]);

  useEffect(() => {
    loadLimits();
  }, [loadLimits]);

  const availablePercent = limits?.totalLimit
    ? (limits.availableLimit / limits.totalLimit) * 100
    : 0;

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text variant="headlineMedium" style={styles.heading}>Olá!</Text>
        <Text variant="bodyMedium" style={styles.subtitle}>Resumo da sua conta empresarial</Text>
        {loading && !limits ? (
          <View style={styles.loading}>
            <ActivityIndicator />
            <Text>Carregando dados da conta...</Text>
          </View>
        ) : null}
        {limits ? (
          <>
            <MetricCard label="Limite total" value={formatCurrency(limits.totalLimit, limits.currency)} helper="Limite disponibilizado pela empresa" />
            <MetricCard label="Valor utilizado" value={formatCurrency(limits.usedLimit, limits.currency)} helper="Movimentações simuladas" />
            <MetricCard
              label="Disponível"
              value={formatCurrency(limits.availableLimit, limits.currency)}
              helper={`${availablePercent.toFixed(1).replace(".", ",")}% do limite disponível`}
              accent
            />
          </>
        ) : null}
        <View style={styles.banner}>
          <Text variant="titleMedium" style={styles.bannerTitle}>Monezy B2B</Text>
          <Text variant="bodyMedium" style={styles.bannerText}>
            Acompanhe seu limite empresarial e suas movimentações em um só lugar.
          </Text>
          <Button mode="contained" buttonColor={colors.secondary} textColor="#FFFFFF" onPress={loadLimits} loading={loading} disabled={loading}>
            Atualizar resumo
          </Button>
        </View>
        {errorMessage ? (
          <View style={styles.message}>
            <Text accessibilityRole="alert" variant="bodySmall" style={styles.error}>{errorMessage}</Text>
            <Button onPress={loadLimits} disabled={loading}>Tentar novamente</Button>
          </View>
        ) : null}
        {notice ? <Text variant="bodySmall" style={styles.notice}>{notice}</Text> : null}
        <Text variant="bodySmall" style={styles.disclaimer}>
          Valores fictícios para demonstração acadêmica. Nenhuma operação financeira real é executada.
        </Text>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 24
  },
  heading: {
    marginBottom: 4,
    color: colors.text,
    fontWeight: "700"
  },
  subtitle: {
    marginBottom: 20,
    color: colors.muted
  },
  banner: {
    marginTop: 8,
    padding: 20,
    gap: 12,
    borderRadius: 18,
    backgroundColor: colors.accentBackground
  },
  bannerTitle: {
    color: "#FFFFFF",
    fontWeight: "700"
  },
  bannerText: {
    color: "#DDF7EC"
  },
  notice: {
    marginTop: 14,
    color: colors.muted
  },
  error: {
    color: colors.error
  },
  message: {
    marginTop: 14,
    gap: 8
  },
  loading: {
    minHeight: 100,
    alignItems: "center",
    justifyContent: "center",
    gap: 12
  },
  disclaimer: {
    marginTop: 20,
    color: colors.muted
  }
});
