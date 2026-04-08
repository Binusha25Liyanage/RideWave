import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function EarningsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Earnings Dashboard</Text>
      <Text style={styles.item}>Base fares: LKR 12,400</Text>
      <Text style={styles.item}>Tips: LKR 2,250</Text>
      <Text style={styles.item}>Surge bonus: LKR 1,100</Text>
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Cashout to Bank</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F6FA", padding: 20 },
  title: { fontSize: 28, fontWeight: "800", marginBottom: 14 },
  item: { marginBottom: 8, fontSize: 16 },
  button: { marginTop: 20, backgroundColor: "#1A1A2E", borderRadius: 24, padding: 14 },
  buttonText: { color: "#fff", textAlign: "center", fontWeight: "700" }
});
