import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function IncomingRequestScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Incoming Ride</Text>
      <Text>Rider: Nadeesha • 1.2 km away</Text>
      <Text>Fare estimate: LKR 780</Text>
      <View style={styles.row}>
        <TouchableOpacity style={styles.accept} onPress={() => navigation.navigate("Navigation")}>
          <Text style={styles.buttonText}>Accept</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.decline} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Decline</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 30, fontWeight: "800", marginBottom: 12 },
  row: { flexDirection: "row", gap: 10, marginTop: 16 },
  accept: { backgroundColor: "#27AE60", flex: 1, borderRadius: 24, padding: 14 },
  decline: { backgroundColor: "#E74C3C", flex: 1, borderRadius: 24, padding: 14 },
  buttonText: { textAlign: "center", color: "#fff", fontWeight: "700" }
});
