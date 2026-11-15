import { StyleSheet } from "react-native";
import { Card, Text } from "react-native-paper";
import { colors } from "../../constants/colors";

export default function MetricCard({ label, value, helper, accent = false }) {
  return (
    <Card style={styles.card} mode="elevated">
      <Card.Content>
        <Text variant="labelLarge" style={styles.label}>{label}</Text>
        <Text variant="headlineMedium" style={[styles.value, accent && styles.accent]}>
          {value}
        </Text>
        {helper ? <Text variant="bodySmall" style={styles.helper}>{helper}</Text> : null}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    borderRadius: 16
  },
  label: {
    color: colors.muted
  },
  value: {
    color: colors.text,
    fontWeight: "700"
  },
  accent: {
    color: colors.primary
  },
  helper: {
    marginTop: 4,
    color: colors.muted
  }
});
