import React, { useState } from "react";
import { View, Text, Switch, TouchableOpacity, StyleSheet } from "react-native";

export default function HomeScreen({ navigation }) {
  const [online, setOnline] = useState(false);
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Driver Home</Text>
      <View style={styles.card}>
        <Text>{online ? "Online" : "Offline"}</Text>
        <Switch value={online} onValueChange={setOnline} />
      </View>
      <View style={styles.card}>
        <Text>Today: 6 trips • LKR 6,400</Text>
      </View>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("Incoming")}>
        <Text style={styles.buttonText}>Simulate Incoming Ride</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F6FA", padding: 20 },
  title: { fontSize: 28, fontWeight: "800", color: "#1A1A2E", marginBottom: 14 },
  card: { backgroundColor: "#fff", borderRadius: 12, padding: 14, marginBottom: 12, shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 20 },
  button: { backgroundColor: "#E94560", borderRadius: 24, padding: 14 },
  buttonText: { color: "#fff", textAlign: "center", fontWeight: "700" }
});
