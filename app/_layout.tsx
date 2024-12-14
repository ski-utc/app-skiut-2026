import React from 'react';
import { UserProvider, useUser } from '../contexts/UserContext'; // Importez le UserProvider et le hook useUser
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeNavigator from './homeNavigator';
import PlanningNavigator from './planningNavigator';
import AnecdotesNavigator from './anecdotesNavigator';
import DefisNavigator from './defisNavigator';
import ProfilNavigator from './profilNavigator';
import LoginScreen from './login/loginScreen';
import CustomNavBar from '../components/navigation/customNavBar';
import { Home, CalendarFold, LandPlot, MessageSquareText } from 'lucide-react-native';

const Tab = createBottomTabNavigator();

export default function RootLayout() {
  return (
    <UserProvider>
      <NavigationContainer>
        <Content />
      </NavigationContainer>
    </UserProvider>
  );
}

function Content() {
  const { user } = useUser();  // Accédez au contexte de l'utilisateur

  return (
    <>
      {user ? (
        <Tab.Navigator
          screenOptions={{ headerShown: false }}
          tabBar={(props) => <CustomNavBar {...props} />}
        >
          <Tab.Screen
            name="homeScreen*"
            component={HomeNavigator}
            options={{ tabBarLabel: 'Home', tabBarIcon: Home }}
          />
          <Tab.Screen
            name="planningScreen"
            component={PlanningNavigator}
            options={{
              tabBarLabel: 'Planning',
              tabBarIcon: CalendarFold,
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
            options={{ tabBarLabel: 'Anecdotes', tabBarIcon: MessageSquareText }}
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
            options={{ tabBarLabel: 'Profil', tabBarIcon: MessageSquareText }}
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
      ) : (
        <LoginScreen />
      )}
    </>
  );
}
