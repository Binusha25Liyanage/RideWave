import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "./src/screens/HomeScreen";
import IncomingRequestScreen from "./src/screens/IncomingRequestScreen";
import NavigationScreen from "./src/screens/NavigationScreen";
import EarningsScreen from "./src/screens/EarningsScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Incoming" component={IncomingRequestScreen} />
        <Stack.Screen name="Navigation" component={NavigationScreen} />
        <Stack.Screen name="Earnings" component={EarningsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
