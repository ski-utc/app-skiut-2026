import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import DefisScreen from './defis/defisScreen';

const Stack = createStackNavigator();

// @ts-ignore
export default function DefisNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="defisScreen"
        component={DefisScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}