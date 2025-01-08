import React from 'react';
import { useState, useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Colors } from '@/constants/GraphSettings';
import { UserProvider, useUser } from '../contexts/UserContext';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeNavigator from './homeNavigator';
import PlanningNavigator from './planningNavigator';
import AnecdotesNavigator from './anecdotesNavigator';
import DefisNavigator from './defisNavigator';
import ProfilNavigator from './profilNavigator';
import LoginNavigator from './loginNavigator';
import CustomNavBar from '../components/navigation/customNavBar';
import { Home, CalendarFold, LandPlot, MessageSquareText } from 'lucide-react-native';
import { loadFonts } from '@/constants/GraphSettings';

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
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAsyncFonts = async () => {
      await loadFonts();
    };
    loadAsyncFonts();
    
    const timer = setTimeout(() => {
      setIsLoading(false); 
    },50); 
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <View
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <View
          style={{
            width: '100%',
            flex: 1,
            backgroundColor: Colors.white,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <ActivityIndicator size="large" color={Colors.gray} />
        </View>
      </View>
    );
  }
  
  return (
    <>
      {user ? (
        <Tab.Navigator
          screenOptions={{ headerShown: false }}
          tabBar={(props) => <CustomNavBar {...props} />}
        >
          <Tab.Screen
            name="homeNavigator"
            component={HomeNavigator}
            options={{ tabBarLabel: 'Home', tabBarIcon: Home }}
          />
          <Tab.Screen
            name="planningNavigator"
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
                  routes: [{ name: 'planningNavigator' }],
                });
              },
            })}
          />
          <Tab.Screen
            name="defisNavigator"
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
                  routes: [{ name: 'defisNavigator' }],
                });
              },
            })}
          />
          <Tab.Screen
            name="anecdotesNavigator"
            component={AnecdotesNavigator}
            options={{ tabBarLabel: 'Anecdotes', tabBarIcon: MessageSquareText }}
            listeners={({ navigation }) => ({
              tabPress: (e) => {
                e.preventDefault();
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'anecdotesNavigator' }],
                });
              },
            })}
          />
          <Tab.Screen
            name="profilNavigator"
            component={ProfilNavigator}
            options={{ tabBarLabel: 'Profil', tabBarIcon: MessageSquareText }}
            listeners={({ navigation }) => ({
              tabPress: (e) => {
                e.preventDefault();
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'profilNavigator' }],
                });
              },
            })}
          />
        </Tab.Navigator>
      ) : (
        <LoginNavigator/>
      )}
    </>
  );
}