import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import CustomNavBar from '../components/navigation/customNavBar';
import { Home, CalendarFold, LandPlot, MessageSquareText } from 'lucide-react-native';

import HomeNavigator from './homeNavigator';
import PlanningNavigator from './planningNavigator';
import DefisNavigator from './defisNavigator';
import AnecdotesNavigator from './anecdotesNavigator';
import { NavigationContainer } from '@react-navigation/native';

const Tab = createBottomTabNavigator();

// @ts-ignore
export default function RootLayout() {
  return (
    <NavigationContainer>    
      <Tab.Navigator screenOptions={{headerShown: false}} tabBar={(props) => <CustomNavBar {...props} />}>
        <Tab.Screen
          name="homeScreen"
          component={HomeNavigator}
          options={{ tabBarLabel: 'Home', tabBarIcon: Home }}
        />
        <Tab.Screen
          name="planningScreen"
          component={PlanningNavigator}
          options={{ tabBarLabel: 'Planning', tabBarIcon: CalendarFold }}
        />
        <Tab.Screen
          name="defisScreen"
          component={DefisNavigator}
          options={{ tabBarLabel: 'Défi', tabBarIcon: LandPlot }}
        />
        <Tab.Screen
          name="anecdotesScreen"
          component={AnecdotesNavigator} 
          options={{ tabBarLabel: 'Anecdotes', tabBarIcon: MessageSquareText }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
