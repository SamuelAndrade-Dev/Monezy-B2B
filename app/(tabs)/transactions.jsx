import { useEffect, useState } from "react";
import { Alert, ScrollView, View } from "react-native";
import { Button, Card, Text, TextInput } from "react-native-paper";
import Screen from "../../src/components/Screen";
import { createTransaction, listTransactions } from "../../src/services/transactions";

export default function TransactionsScreen() {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    try { setItems(await listTransactions()); }
    catch (error) { /* Firebase pode ainda não estar configurado. */ }
  }

  useEffect(() => { load(); }, []);

  async function save() {
    setLoading(true);
    try {
      await createTransaction({ title, amount });
      setTitle("");
      setAmount("");
      await load();
      Alert.alert("Sucesso", "Movimentação registrada no Firestore.");
    } catch (error) {
      Alert.alert("Não foi possível salvar", error.message);
    } finally { setLoading(false); }
  }

  return (
    <Screen>
      <ScrollView keyboardShouldPersistTaps="handled">
        <Text variant="headlineMedium" className="mb-1 font-bold text-slate-900">Movimentações</Text>
        <Text variant="bodyMedium" className="mb-4 text-slate-500">Registre uma despesa simulada.</Text>
        <Card className="mb-5 rounded-2xl">
          <Card.Content>
            <TextInput label="Descrição" value={title} onChangeText={setTitle} mode="outlined" className="mb-3" />
            <TextInput label="Valor (R$)" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" mode="outlined" className="mb-3" />
            <Button mode="contained" onPress={save} loading={loading} disabled={loading}>
              Salvar movimentação
            </Button>
          </Card.Content>
        </Card>
        <Text variant="titleLarge" className="mb-3 font-bold text-slate-900">Histórico</Text>
        {items.length === 0 ? (
          <Text variant="bodyMedium" className="text-slate-500">
            Nenhuma movimentação carregada. Configure o Firebase para persistir e listar registros.
          </Text>
        ) : items.map((item) => (
          <Card key={item.id} className="mb-2 rounded-xl">
            <Card.Content>
              <Text variant="titleMedium">{item.title}</Text>
              <Text variant="bodyMedium">R$ {Number(item.amount).toFixed(2).replace(".", ",")}</Text>
            </Card.Content>
          </Card>
        ))}
      </ScrollView>
    </Screen>
  );
}
