import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './home/homeScreen';

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
    </Stack.Navigator>
  );
}