import { useCallback, useEffect, useState } from "react";
import { Platform, ScrollView, StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Button,
  Card,
  Dialog,
  Menu,
  Portal,
  Snackbar,
  Text,
  TextInput
} from "react-native-paper";
import * as Haptics from "expo-haptics";
import Screen from "../../components/layout/Screen";
import { colors } from "../../constants/colors";
import { useAuth } from "../../contexts/AuthContext";
import { listAccounts } from "../../services/api/accounts";
import {
  createTransaction,
  deleteTransaction,
  listTransactions,
  updateTransaction
} from "../../services/api/transactions";

function formatCurrency(amount, currency = "BRL") {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency }).format(Number(amount) || 0);
}

export default function TransactionsScreen() {
  const { demoMode, getIdToken } = useAuth();
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [editingId, setEditingId] = useState("");
  const [accounts, setAccounts] = useState([]);
  const [accountId, setAccountId] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingList, setLoadingList] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [formError, setFormError] = useState("");
  const [menuVisible, setMenuVisible] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [pendingDelete, setPendingDelete] = useState(null);

  const load = useCallback(async () => {
    setLoadError("");
    setLoadingList(true);
    if (demoMode) {
      setAccounts([]);
      setItems([]);
      setLoadingList(false);
      return;
    }
    try {
      const token = await getIdToken();
      const availableAccounts = await listAccounts(token);
      setAccounts(availableAccounts);
      const selectedAccountId = availableAccounts.some((item) => item.id === accountId)
        ? accountId
        : availableAccounts[0]?.id || "";
      setAccountId(selectedAccountId);
      if (!selectedAccountId) {
        setItems([]);
        return;
      }
      try {
        setItems(await listTransactions(token, selectedAccountId));
      } catch (error) {
        setItems([]);
        setLoadError(error.message);
      }
    } catch (error) {
      setAccounts([]);
      setItems([]);
      setLoadError(error.message);
    } finally {
      setLoadingList(false);
    }
  }, [getIdToken, accountId, demoMode]);

  useEffect(() => {
    load();
  }, [load]);

  async function save() {
    const normalizedTitle = title.trim();
    const normalizedAmount = amount.trim().replace(",", ".");
    const parsedAmount = Number(normalizedAmount);
    if (!normalizedTitle || normalizedTitle.length > 120) {
      setFormError("Informe uma descrição com até 120 caracteres.");
      return;
    }
    if (!/^\d+(?:\.\d{1,2})?$/.test(normalizedAmount) || !Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setFormError("Informe um valor positivo com até duas casas decimais.");
      return;
    }
    if (!accountId) {
      setFormError("Nenhuma conta empresarial foi vinculada a este usuário.");
      return;
    }
    setFormError("");
    setLoading(true);
    try {
      const token = await getIdToken();
      if (editingId) {
        await updateTransaction(editingId, { title: normalizedTitle, amount: parsedAmount }, token);
      } else {
        await createTransaction({
          accountId,
          title: normalizedTitle,
          amount: parsedAmount
        }, token);
      }
      setTitle("");
      setAmount("");
      setEditingId("");
      await load();
      if (!editingId && Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
          .catch((error) => console.warn("Não foi possível executar o feedback tátil.", error));
      }
      setFeedback(editingId ? "Movimentação atualizada." : "Movimentação simulada registrada.");
    } catch (error) {
      setFeedback(`Não foi possível salvar: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  function edit(item) {
    setEditingId(item.id);
    setTitle(item.title);
    setAmount(String(item.amount).replace(".", ","));
    setFormError("");
  }

  function cancelEdit() {
    setEditingId("");
    setTitle("");
    setAmount("");
    setFormError("");
  }

  async function remove(item) {
    try {
      const token = await getIdToken();
      await deleteTransaction(item.id, token);
      if (editingId === item.id) cancelEdit();
      await load();
      setPendingDelete(null);
      setFeedback("Movimentação excluída.");
    } catch (error) {
      setFeedback(`Não foi possível excluir: ${error.message}`);
    }
  }

  function confirmRemove(item) {
    setPendingDelete(item);
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
            {formError ? <Text accessibilityRole="alert" style={styles.error}>{formError}</Text> : null}
            {demoMode ? (
              <Text style={styles.error}>Entre com uma conta Firebase para registrar movimentações na API.</Text>
            ) : null}
            <Button mode="contained" onPress={save} loading={loading} disabled={loading || !accountId || demoMode}>
              {editingId ? "Atualizar movimentação" : "Salvar movimentação"}
            </Button>
            {editingId ? <Button onPress={cancelEdit} disabled={loading}>Cancelar edição</Button> : null}
          </Card.Content>
        </Card>
        <View style={styles.historyHeader}>
          <Text variant="titleLarge" style={styles.historyTitle}>Histórico</Text>
          <Button compact onPress={load}>Atualizar</Button>
        </View>
        {loadError ? <Text accessibilityRole="alert" style={styles.error}>{loadError}</Text> : null}
        {loadingList ? <ActivityIndicator style={styles.listLoading} /> : null}
        {!loadingList && !loadError && items.length === 0 ? (
          <Text variant="bodyMedium" style={styles.empty}>
            {demoMode ? "O histórico fica disponível após entrar com o Firebase." : accounts.length ? "Nenhuma movimentação nesta conta." : "Nenhuma conta empresarial vinculada."}
          </Text>
        ) : !loadingList && items.map((item) => (
          <Card key={item.id} style={styles.transactionCard}>
            <Card.Content style={styles.transactionContent}>
              <View style={styles.transactionDetails}>
                <Text variant="titleMedium">{item.title}</Text>
                <Text variant="bodyMedium">{formatCurrency(item.amount, item.currency)}</Text>
              </View>
              <View style={styles.transactionActions}>
                <Button compact onPress={() => edit(item)} accessibilityLabel={`Editar ${item.title}`}>
                  Editar
                </Button>
                <Button compact onPress={() => confirmRemove(item)} accessibilityLabel={`Excluir ${item.title}`}>
                  Excluir
                </Button>
              </View>
            </Card.Content>
          </Card>
        ))}
        <Text variant="bodySmall" style={styles.disclaimer}>
          Movimentações apenas simuladas; nenhum pagamento é realizado.
        </Text>
      </ScrollView>
      <Portal>
        <Dialog visible={Boolean(pendingDelete)} onDismiss={() => setPendingDelete(null)}>
          <Dialog.Title>Excluir movimentação</Dialog.Title>
          <Dialog.Content>
            <Text>Deseja excluir “{pendingDelete?.title}”?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setPendingDelete(null)}>Cancelar</Button>
            <Button
              textColor={colors.error}
              onPress={() => pendingDelete && remove(pendingDelete)}
            >
              Excluir
            </Button>
          </Dialog.Actions>
        </Dialog>
        <Snackbar
          visible={Boolean(feedback)}
          onDismiss={() => setFeedback("")}
          duration={4000}
          action={{ label: "Fechar", onPress: () => setFeedback("") }}
        >
          {feedback}
        </Snackbar>
      </Portal>
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
  listLoading: {
    marginVertical: 16
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
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 8
  },
  transactionDetails: {
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 140,
    gap: 4
  },
  transactionActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    flexWrap: "wrap"
  },
  disclaimer: {
    marginTop: 16,
    color: colors.muted
  }
});
