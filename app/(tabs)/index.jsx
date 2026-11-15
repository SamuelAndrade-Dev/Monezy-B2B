import { ScrollView, View } from "react-native";
import { ActivityIndicator, Button, ProgressBar, Text } from "react-native-paper";
import Screen from "../../src/components/Screen";
import MetricCard from "../../src/components/MetricCard";
import { useAppStore } from "../../src/store/useAppStore";
import { brl } from "../../src/utils/format";
import { seedDemo } from "../../src/services/transactions";
import { useState } from "react";

export default function DashboardScreen() {
  const { user, loading, error, account, transactions, summary } = useAppStore();
  const [seeding, setSeeding] = useState(false);
  const [seedError, setSeedError] = useState("");
  async function seed() {
    setSeeding(true); setSeedError("");
    try { await seedDemo(user.uid); } catch (e) { setSeedError(e.message); }
    finally { setSeeding(false); }
  }
  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text variant="headlineMedium" style={{ fontWeight: "bold", marginBottom: 4 }}>Resumo financeiro</Text>
        <Text variant="bodyMedium" style={{ marginBottom: 20 }}>Conta empresarial demonstrativa</Text>
        {loading && <ActivityIndicator style={{ margin: 12 }} />}
        {!!error && <Text style={{ color: "#B91C1C", marginBottom: 12 }}>{error}</Text>}
        {!!seedError && <Text style={{ color: "#B91C1C" }}>{seedError}</Text>}
        {!account && !loading && <Text>Conta ainda não disponível.</Text>}
        <MetricCard label="Limite total" value={brl(summary.limitTotal)} />
        <MetricCard label="Valor utilizado" value={brl(summary.utilized)} />
        <MetricCard label="Disponível" value={brl(summary.available)} accent />
        <Text variant="titleMedium" style={{ marginTop: 16 }}>Utilização: {summary.percentage.toFixed(1).replace(".", ",")}%</Text>
        <ProgressBar progress={summary.percentage / 100} color="#176B53" style={{ marginTop: 8, height: 10, borderRadius: 8 }} />
        <Text variant="bodySmall" style={{ marginTop: 16 }}>
          {transactions.length} movimentação(ões). Limite e lançamentos fictícios, sem transações bancárias.
        </Text>
        {transactions.length === 0 && (
          <Button mode="outlined" loading={seeding} disabled={seeding || !user} onPress={seed} style={{ marginTop: 20 }}>
            Inserir 3 gastos de demonstração
          </Button>
        )}
      </ScrollView>
    </Screen>
  );
}
