import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import AddressAutocomplete from "../components/AddressAutocomplete";

export default function BookingScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Booking Flow</Text>
      <AddressAutocomplete placeholder="Pickup address" onSelect={() => {}} />
      <AddressAutocomplete placeholder="Destination address" onSelect={() => {}} />
      <Text style={styles.text}>1. Pickup and destination selection</Text>
      <Text style={styles.text}>2. Vehicle selector with ETA and price</Text>
      <Text style={styles.text}>3. Confirm and payment method</Text>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("RideProgress")}>
        <Text style={styles.buttonText}>Book Ride</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F6FA", padding: 20 },
  title: { fontSize: 24, fontWeight: "800", color: "#1A1A2E", marginBottom: 12 },
  text: { marginBottom: 8, color: "#444" },
  button: { marginTop: 20, backgroundColor: "#E94560", borderRadius: 24, padding: 14 },
  buttonText: { textAlign: "center", color: "#fff", fontWeight: "700" }
});
