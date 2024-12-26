import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Profil from './profil/profilScreen';
import Contact from './profil/contactScreen';
import StopVss from './profil/stopVssScreen';
import Login from './login/loginScreen';
import PlanDesPistes from './profil/planDesPistesScreen';
import PlanStation from './profil/planStationScreen';
import VitesseDeGlisseScreen from './profil/vitesseDeGlisse/vitesseDeGlisseScreen';
import PerformancesScreen from './profil/vitesseDeGlisse/performancesScreen';
import NavettesScreen from './profil/navettesScreen';
import AdminNavigator from './adminNavigator';

const Stack = createStackNavigator();

export default function ProfilNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfilScreen" component={Profil} />
      <Stack.Screen name="ContactScreen" component={Contact} />
      <Stack.Screen name="StopVssScreen" component={StopVss} />
      <Stack.Screen name="LoginScreen" component={Login} />
      <Stack.Screen name="PlanDesPistesScreen" component={PlanDesPistes} />
      <Stack.Screen name="PlanStationScreen" component={PlanStation} />
      <Stack.Screen name="VitesseDeGlisseScreen" component={VitesseDeGlisseScreen} />
      <Stack.Screen name='PerformancesScreen' component={PerformancesScreen} />
      <Stack.Screen name="NavettesScreen" component={NavettesScreen} />
      <Stack.Screen name="AdminNavigator" component={AdminNavigator} />
    </Stack.Navigator>
  );
}
