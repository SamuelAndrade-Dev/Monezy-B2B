import { StyleSheet, View } from "react-native";
import { colors } from "../../constants/colors";

export default function Screen({ children, style }) {
  return (
    <View style={styles.container}>
      <View style={[styles.content, style]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
    paddingTop: 20
  },
  content: {
    flex: 1,
    width: "100%",
    maxWidth: 760,
    alignSelf: "center"
  }
});
