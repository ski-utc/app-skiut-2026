import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import GestionDefisScreen from './admin/gestionDefisScreen';
import GestionAnecdotesScreen from './admin/gestionAnecdotesScreen';
import GestionNotificationsScreen from './admin/gestionNotificationsScreen';
import Admin from './admin/adminScreen';
import ValideDefis from './admin/valideDefisScreen';


const Stack = createStackNavigator();

export default function AdminNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="adminScreen"
        component={Admin}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="gestionDefisScreen"
        component={GestionDefisScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="gestionAnecdotesScreen"
        component={GestionAnecdotesScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="gestionNotificationsScreen"
        component={GestionNotificationsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="valideDefisScreen"
        component={ValideDefis}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}