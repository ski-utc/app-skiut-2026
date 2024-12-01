import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import HomeNavigator from './homeNavigator';
import PlanningNavigator from './planningNavigator';
import AnecdotesNavigator from './anecdotesNavigator';
import DefisNavigator from './defisNavigator';
import ProfilNavigator from './profilNavigator';
import CustomNavBar from '../components/navigation/customNavBar';
import { Home, CalendarFold, LandPlot, MessageSquareText } from 'lucide-react-native';

const Tab = createBottomTabNavigator();

export default function RootLayout() {
  return (
    <NavigationContainer independent={true}>
      <Tab.Navigator
        screenOptions={{ headerShown: false }}
        tabBar={(props) => <CustomNavBar {...props} />}
      >
        <Tab.Screen
          name="homeScreen"
          component={HomeNavigator}
          options={{ tabBarLabel: 'Home', tabBarIcon: Home, display:1 }}
        />
        <Tab.Screen
          name="planningScreen"
          component={PlanningNavigator}
          options={{
            tabBarLabel: 'Planning',
            tabBarIcon: CalendarFold,
            display: 1
          }}
          listeners={({ navigation }) => ({
            tabPress: (e) => {
              e.preventDefault();
              navigation.reset({
                index: 0,
                routes: [{ name: 'planningScreen' }],
              });
            },
          })}
        />
        <Tab.Screen
          name="defisScreen"
          component={DefisNavigator}
          options={{
            tabBarLabel: 'Défi',
            tabBarIcon: LandPlot,
            display:1
          }}
          listeners={({ navigation }) => ({
            tabPress: (e) => {
              e.preventDefault();
              navigation.reset({
                index: 0,
                routes: [{ name: 'defisScreen' }],
              });
            },
          })}
        />
        <Tab.Screen
          name="anecdotesScreen"
          component={AnecdotesNavigator}
          options={{ tabBarLabel: 'Anecdotes', tabBarIcon: MessageSquareText, display:1 }}
          listeners={({ navigation }) => ({
            tabPress: (e) => {
              e.preventDefault();
              navigation.reset({
                index: 0,
                routes: [{ name: 'anecdotesScreen' }],
              });
            },
          })}
        />
        <Tab.Screen
          name="ProfilNavigator"
          component={ProfilNavigator}
          options={{ tabBarLabel: 'Profil', tabBarIcon: MessageSquareText, display:0 }}
          listeners={({ navigation }) => ({
            tabPress: (e) => {
              e.preventDefault();
              navigation.reset({
                index: 0,
                routes: [{ name: 'ProfilNavigator' }],
              });
            },
          })}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
