import React from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";

export default function AuthScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Login</Text>
        <TextInput style={styles.input} placeholder="+94 77 123 4567" placeholderTextColor="#999" />
        <TouchableOpacity style={styles.button} onPress={() => navigation.replace("Home")}>
          <Text style={styles.buttonText}>Send OTP</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1A1A2E", justifyContent: "center", padding: 20 },
  card: { backgroundColor: "#fff", borderRadius: 12, padding: 20 },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 16 },
  input: { borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 12, marginBottom: 16 },
  button: { backgroundColor: "#E94560", borderRadius: 24, padding: 14 },
  buttonText: { color: "#fff", textAlign: "center", fontWeight: "700" }
});
