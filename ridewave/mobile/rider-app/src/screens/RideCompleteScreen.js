import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function RideCompleteScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ride Completed</Text>
      <Text style={styles.summary}>Base: LKR 420</Text>
      <Text style={styles.summary}>Surge: 1.25x</Text>
      <Text style={styles.summary}>Total: LKR 525</Text>
      <Text style={styles.summary}>Rate your ride: ★★★★★</Text>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("Home")}>
        <Text style={styles.buttonText}>Done</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F6FA", padding: 20, justifyContent: "center" },
  title: { fontSize: 28, fontWeight: "800", color: "#1A1A2E", marginBottom: 16 },
  summary: { fontSize: 16, marginBottom: 8 },
  button: { marginTop: 18, backgroundColor: "#E94560", borderRadius: 24, padding: 14 },
  buttonText: { color: "#fff", textAlign: "center", fontWeight: "700" }
});
