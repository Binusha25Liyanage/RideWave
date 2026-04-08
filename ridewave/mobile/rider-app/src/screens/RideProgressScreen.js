import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function RideProgressScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ride In Progress</Text>
      <Text style={styles.subtitle}>Driver: Kasun Perera • CAB-1234</Text>
      <Text style={styles.subtitle}>ETA: 6 min</Text>
      <View style={styles.row}>
        <TouchableOpacity style={styles.secondary}><Text>Call</Text></TouchableOpacity>
        <TouchableOpacity style={styles.secondary}><Text>Chat</Text></TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("RideComplete")}>
        <Text style={styles.buttonText}>Complete Ride (Demo)</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#16213E", padding: 20, justifyContent: "center" },
  title: { color: "#fff", fontSize: 26, fontWeight: "700", marginBottom: 12 },
  subtitle: { color: "#d4d8e8", marginBottom: 8 },
  row: { flexDirection: "row", gap: 12, marginVertical: 16 },
  secondary: { backgroundColor: "#fff", borderRadius: 24, padding: 12, flex: 1, alignItems: "center" },
  button: { backgroundColor: "#E94560", borderRadius: 24, padding: 14 },
  buttonText: { color: "#fff", textAlign: "center", fontWeight: "700" }
});
