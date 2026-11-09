import { useMemo, useState } from "react";
import { Alert, Platform, ScrollView, View } from "react-native";
import { Button, Card, Dialog, HelperText, Portal, SegmentedButtons, Text, TextInput } from "react-native-paper";
import Screen from "../../src/components/Screen";
import { useAppStore } from "../../src/store/useAppStore";
import { createTransaction, updateTransaction, deleteTransaction } from "../../src/services/transactions";
import { brl, dateBR, todayISO } from "../../src/utils/format";

const categories = ["Outros", "Escritório", "Tecnologia", "Transporte", "Alimentação"];
export default function TransactionsScreen() {
  const { user, transactions, loading, error } = useAppStore();
  const [filter, setFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [editing, setEditing] = useState(null);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(todayISO());
  const [category, setCategory] = useState("Outros");
  const [type, setType] = useState("expense");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const visible = useMemo(() => transactions.filter(tx =>
    (filter === "all" || tx.type === filter) &&
    (!categoryFilter || tx.category?.toLowerCase().includes(categoryFilter.toLowerCase()))
  ), [transactions, filter, categoryFilter]);
  function openNew() {
    setEditing(null); setTitle(""); setAmount(""); setDate(todayISO());
    setCategory("Outros"); setType("expense"); setMessage(""); setShowForm(true);
  }
  function edit(tx) {
    setEditing(tx.id); setTitle(tx.title || ""); setAmount(String(tx.amount || ""));
    const d = tx.date?.toDate?.();
    setDate(d ? `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}` : todayISO());
    setCategory(tx.category || "Outros"); setType(tx.type || "expense");
    setMessage(""); setShowForm(true);
  }
  async function save() {
    setBusy(true); setMessage("");
    try {
      const data = { title, amount, date, category, type };
      if (editing) await updateTransaction(user.uid, editing, data);
      else await createTransaction(user.uid, data);
      setShowForm(false); setEditing(null);
    } catch (e) { setMessage(e.message); }
    finally { setBusy(false); }
  }
  async function remove() {
    setBusy(true); setMessage("");
    try { await deleteTransaction(user.uid, deleteId); setDeleteId(null); }
    catch (e) { setMessage(e.message); }
    finally { setBusy(false); }
  }
  return <Screen>
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 36 }}>
      <Text variant="headlineMedium" style={{ fontWeight: "bold" }}>Movimentações</Text>
      <Text variant="bodySmall" style={{ marginBottom: 16 }}>Lançamentos fictícios para fins acadêmicos.</Text>
      {!!error && <HelperText type="error" visible>{error}</HelperText>}
      {!!message && <HelperText type="error" visible>{message}</HelperText>}
      <Button mode="contained" icon="plus" onPress={openNew} style={{ marginBottom: 16 }}>Novo lançamento</Button>
      <SegmentedButtons value={filter} onValueChange={setFilter} buttons={[
        { value: "all", label: "Todos" }, { value: "expense", label: "Gastos" }, { value: "credit", label: "Créditos" }
      ]} />
      <TextInput mode="outlined" label="Filtrar por categoria" value={categoryFilter}
        onChangeText={setCategoryFilter} style={{ marginVertical: 12 }} />
      <Text variant="titleMedium" style={{ marginBottom: 10 }}>Extrato ({visible.length})</Text>
      {loading && <Text>Carregando movimentações...</Text>}
      {!loading && visible.length === 0 && <Text>Nenhuma movimentação para este filtro.</Text>}
      {visible.map(tx => <Card key={tx.id} style={{ marginBottom: 10 }}>
        <Card.Content>
          <Text variant="titleMedium">{tx.title}</Text>
          <Text>{tx.category || "Outros"} · {dateBR(tx.date)}</Text>
          <Text variant="titleMedium" style={{ marginTop: 4 }}>
            {tx.type === "credit" ? "+" : "-"} {brl(tx.amount)}
          </Text>
          <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
            <Button compact onPress={() => edit(tx)}>Editar</Button>
            <Button compact textColor="#B91C1C" onPress={() => setDeleteId(tx.id)}>Excluir</Button>
          </View>
        </Card.Content>
      </Card>)}
    </ScrollView>
    <Portal>
      <Dialog visible={showForm} onDismiss={() => !busy && setShowForm(false)}>
        <Dialog.Title>{editing ? "Editar lançamento" : "Novo lançamento"}</Dialog.Title>
        <Dialog.ScrollArea style={{ maxHeight: 440 }}>
          <ScrollView keyboardShouldPersistTaps="handled">
            <TextInput mode="outlined" label="Descrição" value={title} onChangeText={setTitle} style={{ marginBottom: 10 }} />
            <TextInput mode="outlined" label="Valor (R$)" value={amount} onChangeText={setAmount}
              keyboardType="decimal-pad" style={{ marginBottom: 10 }} />
            <TextInput mode="outlined" label="Data (AAAA-MM-DD)" value={date} onChangeText={setDate}
              style={{ marginBottom: 10 }} />
            <TextInput mode="outlined" label="Categoria" value={category} onChangeText={setCategory}
              style={{ marginBottom: 10 }} />
            <SegmentedButtons value={type} onValueChange={setType} buttons={[
              { value: "expense", label: "Gasto" }, { value: "credit", label: "Crédito" }
            ]} />
            {!!message && <HelperText type="error" visible>{message}</HelperText>}
          </ScrollView>
        </Dialog.ScrollArea>
        <Dialog.Actions>
          <Button disabled={busy} onPress={() => setShowForm(false)}>Cancelar</Button>
          <Button loading={busy} disabled={busy} onPress={save}>Salvar</Button>
        </Dialog.Actions>
      </Dialog>
      <Dialog visible={!!deleteId} onDismiss={() => !busy && setDeleteId(null)}>
        <Dialog.Title>Excluir movimentação?</Dialog.Title>
        <Dialog.Content><Text>Esta ação excluirá o lançamento fictício permanentemente.</Text></Dialog.Content>
        <Dialog.Actions>
          <Button disabled={busy} onPress={() => setDeleteId(null)}>Cancelar</Button>
          <Button loading={busy} disabled={busy} textColor="#B91C1C" onPress={remove}>Excluir</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  </Screen>;
}
