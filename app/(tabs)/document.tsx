import { StyleSheet, Text, View } from "react-native";

export default function DocumentScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>💳 Gestion des documents</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#0f172a" },
  text: { color: "#fff", fontSize: 20 },
});
