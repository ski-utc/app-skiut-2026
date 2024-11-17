import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import DefisScreen from './defis/defisScreen';
import DefisClassement from './defis/defisClassement';
import DefisInfos from './defis/defisInfos';
import ProfilScreen from './profil/profilScreen';

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
      <Stack.Screen
        name="defisClassement"
        component={DefisClassement}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="defisInfos"
        component={DefisInfos}
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