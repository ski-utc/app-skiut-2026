import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import CustomNavBar from '../components/navigation/customNavBar';
import { Home, CalendarFold, LandPlot, MessageSquareText } from 'lucide-react';

import HomeScreen from './home';
import PlanningScreen from './planning';
import DefisScreen from './defis';
import AnecdotesScreen from './anecdotes';

const Tab = createBottomTabNavigator();

// @ts-ignore
export default function RootLayout() {
  return (
    <Tab.Navigator screenOptions={{headerShown: false}} tabBar={(props) => <CustomNavBar {...props} />}>
      <Tab.Screen
        name="home"
        component={HomeScreen}
        options={{ tabBarLabel: 'Home', tabBarIcon: Home }}
      />
      <Tab.Screen
        name="planning"
        component={PlanningScreen}
        options={{ tabBarLabel: 'Planning', tabBarIcon: CalendarFold }}
      />
      <Tab.Screen
        name="defis"
        component={DefisScreen}
        options={{ tabBarLabel: 'Défi', tabBarIcon: LandPlot }}
      />
      <Tab.Screen
        name="anecdotes"
        component={AnecdotesScreen}
        options={{ tabBarLabel: 'Anecdotes', tabBarIcon: MessageSquareText }}
      />
    </Tab.Navigator>
  );
}