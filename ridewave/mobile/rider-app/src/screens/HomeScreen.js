import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import MapView, { UrlTile, Marker } from "react-native-maps";

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <MapView style={styles.map} initialRegion={{ latitude: 6.9271, longitude: 79.8612, latitudeDelta: 0.05, longitudeDelta: 0.05 }}>
        <UrlTile urlTemplate="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" maximumZ={19} />
        <Marker coordinate={{ latitude: 6.93, longitude: 79.86 }} title="Nearby Driver" />
      </MapView>
      <View style={styles.sheet}>
        <Text style={styles.title}>Where to?</Text>
        <TouchableOpacity style={styles.action} onPress={() => navigation.navigate("Booking")}>
          <Text style={styles.actionText}>Book Ride</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  sheet: { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20 },
  title: { fontSize: 22, fontWeight: "700" },
  action: { marginTop: 12, backgroundColor: "#E94560", padding: 14, borderRadius: 24 },
  actionText: { color: "#fff", textAlign: "center", fontWeight: "700" }
});
