import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './home/homeScreen';
import ProfilScreen from './profil/profilScreen';

const Stack = createStackNavigator();

// @ts-ignore
export default function HomeNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="homeScreen"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="profilScreen"
        component={ProfilScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}