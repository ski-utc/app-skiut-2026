import React from 'react';
import { useState, useEffect } from 'react';
import { ActivityIndicator, View, Text, StyleSheet, Platform } from 'react-native';
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
import Toast from 'react-native-toast-message';
import { Keyboard } from 'react-native';

const Tab = createBottomTabNavigator();

export default function RootLayout() {
  return (
    <UserProvider>
        <Content />
      <Toast config={ToastConfig} />
      </UserProvider>
  );
}

function Content() {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const loadAsyncFonts = async () => {
      await loadFonts();
    };
    loadAsyncFonts();

    if(Platform.OS != 'ios') {
      const showListener = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
      const hideListener = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    }
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
          tabBar={(props) => 
            !keyboardVisible ? <CustomNavBar {...props} /> : null
          }
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

const ToastConfig = {
  success: ({ text1, text2, ...rest }) => (
    <View style={[styles.toastContainer, { backgroundColor: '#4CAF50' }]}>
      <Text style={[styles.text, { fontSize: 18, fontWeight: 'bold' }]}>{text1}</Text>
      <Text style={[styles.text, { fontSize: 14 }]}>{text2}</Text>
    </View>
  ),
  error: ({ text1, text2, ...rest }) => (
    <View style={[styles.toastContainer, { backgroundColor: '#F44336' }]}>
      <Text style={[styles.text, { fontSize: 18, fontWeight: 'bold' }]}>{text1}</Text>
      <Text style={[styles.text, { fontSize: 14 }]}>{text2}</Text>
    </View>
  ),
};

const styles = StyleSheet.create({
  toastContainer: {
    width: '90%',
    padding: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  text: {
    color: '#fff',
  },
});
