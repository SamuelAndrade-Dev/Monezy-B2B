import { Redirect } from "expo-router";
import { useAppStore } from "../src/store/useAppStore";
export default function Index() {
  const user = useAppStore(s => s.user);
  return <Redirect href={user ? "/(tabs)" : "/login"} />;
}
