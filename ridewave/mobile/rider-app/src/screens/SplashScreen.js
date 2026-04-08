import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function SplashScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>RideWave</Text>
      <Text style={styles.subtitle}>Move Fast. Ride Smart.</Text>
      <TouchableOpacity style={styles.button} onPress={() => navigation.replace("Auth")}>
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1A1A2E", justifyContent: "center", alignItems: "center", padding: 24 },
  logo: { color: "#fff", fontSize: 42, fontWeight: "800" },
  subtitle: { color: "#E94560", marginTop: 10, marginBottom: 24 },
  button: { backgroundColor: "#E94560", borderRadius: 24, paddingVertical: 14, paddingHorizontal: 28 },
  buttonText: { color: "#fff", fontWeight: "700" }
});
