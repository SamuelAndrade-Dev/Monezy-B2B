import { View } from "react-native";
import { Avatar, Card, Text } from "react-native-paper";
import Screen from "../../src/components/Screen";

export default function ProfileScreen() {
  return (
    <Screen>
      <Text variant="headlineMedium" className="mb-5 font-bold text-slate-900">Perfil</Text>
      <Card className="rounded-2xl">
        <Card.Content className="items-center py-7">
          <Avatar.Text size={76} label="MB" style={{ backgroundColor: "#DDF7EC" }} color="#176B53" />
          <Text variant="titleLarge" className="mt-4 font-bold">Usuário Monezy</Text>
          <Text variant="bodyMedium" className="text-slate-500">Conta demonstrativa</Text>
        </Card.Content>
      </Card>
      <Text variant="bodySmall" className="mt-5 text-slate-500">
        Os dados de perfil e autenticação serão conectados ao Firebase nas próximas etapas.
      </Text>
    </Screen>
  );
}
