import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function NavigationScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Turn left in 200m</Text>
      <Text style={styles.meta}>Distance remaining: 4.6 km</Text>
      <Text style={styles.meta}>Rider: Chathura</Text>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("Earnings")}>
        <Text style={styles.buttonText}>Arrived / End Demo Ride</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#16213E", padding: 20, justifyContent: "center" },
  heading: { color: "#fff", fontSize: 28, fontWeight: "800", marginBottom: 10 },
  meta: { color: "#c8d1e5", marginBottom: 6 },
  button: { marginTop: 16, backgroundColor: "#E94560", borderRadius: 24, padding: 14 },
  buttonText: { color: "#fff", textAlign: "center", fontWeight: "700" }
});
