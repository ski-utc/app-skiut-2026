import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Profil from './profil/profilScreen';
import Contact from './profil/contactScreen';
import StopVss from './profil/stopVssScreen';
import Login from './login/loginScreen';
import PlanDesPistes from './profil/planDesPistesScreen';

const Stack = createStackNavigator();

export default function ProfilNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfilScreen" component={Profil} />
      <Stack.Screen name="ContactScreen" component={Contact} />
      <Stack.Screen name="StopVssScreen" component={StopVss} />
      <Stack.Screen name="LoginScreen" component={Login} />
      <Stack.Screen name="PlanDesPistesScreen" component={PlanDesPistes} />
    </Stack.Navigator>
  );
}
