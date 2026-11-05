import { Card, Text } from "react-native-paper";
import { View } from "react-native";

export default function MetricCard({ label, value, helper, accent = false }) {
  return (
    <Card className="mb-3 rounded-2xl" mode="elevated">
      <Card.Content>
        <Text variant="labelLarge" className="text-slate-500">{label}</Text>
        <Text variant="headlineMedium" className={accent ? "font-bold text-monezy-700" : "font-bold text-slate-900"}>
          {value}
        </Text>
        {helper ? <Text variant="bodySmall" className="mt-1 text-slate-500">{helper}</Text> : null}
      </Card.Content>
    </Card>
  );
}
