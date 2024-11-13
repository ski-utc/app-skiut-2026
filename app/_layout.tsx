import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import CustomNavBar from '../components/navigation/customNavBar';
import { Home, CalendarFold, LandPlot, MessageSquareText } from 'lucide-react-native';

import HomeScreen from './homeScreen';
import PlanningScreen from './planningScreen';
import DefisScreen from './defisScreen';
import AnecdotesNavigator from './anecdotesNavigator';

const Tab = createBottomTabNavigator();

// @ts-ignore
export default function RootLayout() {
  return (
    <Tab.Navigator screenOptions={{headerShown: false}} tabBar={(props) => <CustomNavBar {...props} />}>
      <Tab.Screen
        name="homeScreen"
        component={HomeScreen}
        options={{ tabBarLabel: 'Home', tabBarIcon: Home }}
      />
      <Tab.Screen
        name="planningScreen"
        component={PlanningScreen}
        options={{ tabBarLabel: 'Planning', tabBarIcon: CalendarFold }}
      />
      <Tab.Screen
        name="defisScreen"
        component={DefisScreen}
        options={{ tabBarLabel: 'Défi', tabBarIcon: LandPlot }}
      />
      <Tab.Screen
        name="anecdotesScreen"
        component={AnecdotesNavigator} 
        options={{ tabBarLabel: 'Anecdotes', tabBarIcon: MessageSquareText }}
      />
    </Tab.Navigator>
  );
}
