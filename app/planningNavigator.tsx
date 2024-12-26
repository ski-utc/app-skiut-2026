import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import PlanningScreen from './planning/planningScreen';

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
    </Stack.Navigator>
  );
}