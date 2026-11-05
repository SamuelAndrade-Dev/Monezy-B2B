import { View } from "react-native";

export default function Screen({ children, className = "" }) {
  return (
    <View className={`flex-1 bg-slate-50 px-5 pt-5 ${className}`}>
      {children}
    </View>
  );
}
