import { useCallback, useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { Button, Card, Menu, Text, TextInput } from "react-native-paper";
import Screen from "../../components/layout/Screen";
import { colors } from "../../constants/colors";
import { useAuth } from "../../contexts/AuthContext";
import { listAccounts } from "../../services/api/accounts";
import {
  createTransaction,
  deleteTransaction,
  listTransactions
} from "../../services/api/transactions";

function formatCurrency(amount, currency = "BRL") {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency }).format(Number(amount) || 0);
}

export default function TransactionsScreen() {
  const { getIdToken } = useAuth();
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [accounts, setAccounts] = useState([]);
  const [accountId, setAccountId] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [menuVisible, setMenuVisible] = useState(false);

  const load = useCallback(async () => {
    setLoadError("");
    try {
      const token = await getIdToken();
      const availableAccounts = await listAccounts(token);
      setAccounts(availableAccounts);
      const selectedAccountId = availableAccounts.some((item) => item.id === accountId)
        ? accountId
        : availableAccounts[0]?.id || "";
      setAccountId(selectedAccountId);
      setItems(selectedAccountId ? await listTransactions(token, selectedAccountId) : []);
    } catch (error) {
      setAccounts([]);
      setItems([]);
      setLoadError(error.message);
    }
  }, [getIdToken, accountId]);

  useEffect(() => {
    load();
  }, [load]);

  async function save() {
    if (!accountId) {
      Alert.alert("Conta necessária", "Nenhuma conta empresarial foi vinculada a este usuário.");
      return;
    }
    setLoading(true);
    try {
      const token = await getIdToken();
      await createTransaction({
        accountId,
        title,
        amount: Number(amount.replace(",", "."))
      }, token);
      setTitle("");
      setAmount("");
      await load();
      Alert.alert("Sucesso", "Movimentação simulada registrada.");
    } catch (error) {
      Alert.alert("Não foi possível salvar", error.message);
    } finally {
      setLoading(false);
    }
  }

  async function remove(item) {
    try {
      const token = await getIdToken();
      await deleteTransaction(item.id, token);
      await load();
    } catch (error) {
      Alert.alert("Não foi possível excluir", error.message);
    }
  }

  const selectedAccount = accounts.find((item) => item.id === accountId);

  return (
    <Screen>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
        <Text variant="headlineMedium" style={styles.heading}>Movimentações</Text>
        <Text variant="bodyMedium" style={styles.subtitle}>Registre uma despesa simulada.</Text>
        <Card style={styles.formCard}>
          <Card.Content>
            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={
                <Button mode="outlined" style={styles.accountButton} onPress={() => setMenuVisible(true)}>
                  {selectedAccount?.name || "Selecione uma conta"}
                </Button>
              }
            >
              {accounts.map((account) => (
                <Menu.Item
                  key={account.id}
                  title={account.name}
                  onPress={() => {
                    setAccountId(account.id);
                    setMenuVisible(false);
                  }}
                />
              ))}
            </Menu>
            <TextInput label="Descrição" value={title} onChangeText={setTitle} mode="outlined" style={styles.input} />
            <TextInput
              label="Valor (R$)"
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              mode="outlined"
              style={styles.input}
            />
            <Button mode="contained" onPress={save} loading={loading} disabled={loading || !accountId}>
              Salvar movimentação
            </Button>
          </Card.Content>
        </Card>
        <View style={styles.historyHeader}>
          <Text variant="titleLarge" style={styles.historyTitle}>Histórico</Text>
          <Button compact onPress={load}>Atualizar</Button>
        </View>
        {loadError ? <Text accessibilityRole="alert" style={styles.error}>{loadError}</Text> : null}
        {!loadError && items.length === 0 ? (
          <Text variant="bodyMedium" style={styles.empty}>
            {accounts.length ? "Nenhuma movimentação nesta conta." : "Nenhuma conta empresarial vinculada."}
          </Text>
        ) : items.map((item) => (
          <Card key={item.id} style={styles.transactionCard}>
            <Card.Content style={styles.transactionContent}>
              <View style={styles.transactionDetails}>
                <Text variant="titleMedium">{item.title}</Text>
                <Text variant="bodyMedium">{formatCurrency(item.amount, item.currency)}</Text>
              </View>
              <Button compact onPress={() => remove(item)} accessibilityLabel={`Excluir ${item.title}`}>
                Excluir
              </Button>
            </Card.Content>
          </Card>
        ))}
        <Text variant="bodySmall" style={styles.disclaimer}>
          Movimentações apenas simuladas; nenhum pagamento é realizado.
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
    marginBottom: 16,
    color: colors.muted
  },
  formCard: {
    marginBottom: 20,
    borderRadius: 16
  },
  accountButton: {
    marginBottom: 12
  },
  input: {
    marginBottom: 12
  },
  historyHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8
  },
  historyTitle: {
    color: colors.text,
    fontWeight: "700"
  },
  error: {
    color: colors.error
  },
  empty: {
    color: colors.muted
  },
  transactionCard: {
    marginBottom: 8,
    borderRadius: 12
  },
  transactionContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  transactionDetails: {
    flex: 1,
    gap: 4
  },
  disclaimer: {
    marginTop: 16,
    color: colors.muted
  }
});
