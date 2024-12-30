import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LaunchScreen1 from './login/lauchScreen1';
import LaunchScreen2 from './login/lauchScreen2';
import LaunchScreen3 from './login/lauchScreen3';
import LoginScreen from './login/loginScreen';

const Stack = createStackNavigator();

// @ts-ignore
export default function LoginNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="launchScreen1"
        component={LaunchScreen1}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="launchScreen2"
        component={LaunchScreen2}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="launchScreen3"
        component={LaunchScreen3}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="loginScreen"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}