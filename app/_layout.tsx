import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import CustomTabBar from '../components/navigation/customTabBar';
import { Home, CalendarFold, LandPlot, MessageSquareText } from 'lucide-react';


import HomeScreen from './home';
import PlanningScreen from './planning';
import DefisScreen from './defis';
import PotinsScreen from './potins';

const Tab = createBottomTabNavigator();

// @ts-ignore
export default function RootLayout() {
  return (
    <Tab.Navigator tabBar={(props) => <CustomTabBar {...props} />}>
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
        name="potins"
        component={PotinsScreen}
        options={{ tabBarLabel: 'Anecdotes', tabBarIcon: MessageSquareText }}
      />
    </Tab.Navigator>
  );
}