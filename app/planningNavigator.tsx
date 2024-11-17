import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import PlanningScreen from './planning/planningScreen';
import ProfilScreen from './profil/profilScreen';

const Stack = createStackNavigator();

// @ts-ignore
export default function PlanningNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="planningScreen"
        component={PlanningScreen}
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