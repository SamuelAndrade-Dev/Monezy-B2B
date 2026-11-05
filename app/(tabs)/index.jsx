import { ScrollView, View } from "react-native";
import { Text, Button } from "react-native-paper";
import Screen from "../../src/components/Screen";
import MetricCard from "../../src/components/MetricCard";

export default function DashboardScreen() {
  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text variant="headlineMedium" className="mb-1 font-bold text-slate-900">Olá! 👋</Text>
        <Text variant="bodyMedium" className="mb-5 text-slate-500">Resumo da sua conta empresarial</Text>
        <MetricCard label="Limite total" value="R$ 10.000,00" helper="Limite disponibilizado pela empresa" />
        <MetricCard label="Valor utilizado" value="R$ 2.450,00" helper="Simulação de utilização" />
        <MetricCard label="Disponível" value="R$ 7.550,00" helper="73,5% do limite disponível" accent />
        <View className="mt-2 rounded-2xl bg-monezy-900 p-5">
          <Text variant="titleMedium" className="mb-2 font-bold text-white">Monezy B2B</Text>
          <Text variant="bodyMedium" className="mb-4 text-green-100">
            Acompanhe seu limite empresarial e suas movimentações em um só lugar.
          </Text>
          <Button mode="contained" buttonColor="#21A179" textColor="#FFFFFF" onPress={() => {}}>
            Visão demonstrativa
          </Button>
        </View>
        <Text variant="bodySmall" className="my-5 text-slate-400">
          Valores fictícios para demonstração acadêmica.
        </Text>
      </ScrollView>
    </Screen>
  );
}
