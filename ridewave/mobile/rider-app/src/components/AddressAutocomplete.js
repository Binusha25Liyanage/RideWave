import React, { useEffect, useMemo, useState } from "react";
import { View, TextInput, FlatList, Pressable, Text, StyleSheet } from "react-native";

export default function AddressAutocomplete({ placeholder, onSelect }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  const endpoint = useMemo(() => "https://nominatim.openstreetmap.org/search", []);

  useEffect(() => {
    if (!query || query.length < 3) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      const resp = await fetch(`${endpoint}?q=${encodeURIComponent(query)}&format=json&limit=5`);
      const json = await resp.json();
      setResults(json);
    }, 300);

    return () => clearTimeout(timer);
  }, [endpoint, query]);

  return (
    <View>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        value={query}
        onChangeText={setQuery}
      />
      <FlatList
        data={results}
        keyExtractor={(item) => item.place_id.toString()}
        renderItem={({ item }) => (
          <Pressable
            style={styles.item}
            onPress={() => {
              onSelect({
                address: item.display_name,
                lat: Number(item.lat),
                lng: Number(item.lon)
              });
              setQuery(item.display_name);
              setResults([]);
            }}
          >
            <Text numberOfLines={2}>{item.display_name}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  input: { borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 10, marginBottom: 8 },
  item: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#eee" }
});
