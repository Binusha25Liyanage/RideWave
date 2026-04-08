import React from "react";
import { View, Text, Switch, StyleSheet } from "react-native";

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.name}>Alex Rider</Text>
      <Text style={styles.item}>Phone: +94 77 123 4567</Text>
      <Text style={styles.item}>Email: alex@ridewave.app</Text>
      <Text style={styles.item}>Wallet: LKR 1,240</Text>
      <View style={styles.row}>
        <Text>Dark Mode</Text>
        <Switch value={false} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  name: { fontSize: 24, fontWeight: "800", marginBottom: 18 },
  item: { marginBottom: 10, fontSize: 16 },
  row: { marginTop: 20, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }
});
