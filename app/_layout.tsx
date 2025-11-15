import React from 'react';
import { useState, useEffect } from 'react';
import { ActivityIndicator, View, Text, StyleSheet, Platform } from 'react-native';
import { Colors, TextStyles } from '@/constants/GraphSettings';
import { UserProvider, useUser } from '../contexts/UserContext';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import HomeNavigator from './homeNavigator';
import PlanningNavigator from './planningNavigator';
import AnecdotesNavigator from './anecdotesNavigator';
import DefisNavigator from './defisNavigator';
import ProfilNavigator from './profilNavigator';
import LoginNavigator from './loginNavigator';
import CustomNavBar from '../components/navigation/customNavBar';
import CustomDrawer from '../components/navigation/customDrawer';
import { Home, CalendarFold, LandPlot, MessageSquareText } from 'lucide-react-native';
import { loadFonts } from '@/constants/GraphSettings';
import Toast from 'react-native-toast-message';
import { Keyboard } from 'react-native';
import { useNotifications } from '../hooks/useNotifications';

const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

function MainTabs() {
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'ios') {
      const showListener = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
      const hideListener = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));

      return () => {
        showListener.remove();
        hideListener.remove();
      };
    }
  }, []);

  const tabBarComponent = React.useCallback(
    (props: any) => (!keyboardVisible ? <CustomNavBar {...props} /> : null),
    [keyboardVisible]
  );

  const planningListeners = React.useMemo(
    () => ({
      tabPress: (e: any, navigation: any) => {
        e.preventDefault();
        navigation.reset({
          index: 0,
          routes: [{ name: 'planningNavigator' }],
        });
      },
    }),
    []
  );

  const defisListeners = React.useMemo(
    () => ({
      tabPress: (e: any, navigation: any) => {
        e.preventDefault();
        navigation.reset({
          index: 0,
          routes: [{ name: 'defisNavigator' }],
        });
      },
    }),
    []
  );

  const anecdotesListeners = React.useMemo(
    () => ({
      tabPress: (e: any, navigation: any) => {
        e.preventDefault();
        navigation.reset({
          index: 0,
          routes: [{ name: 'anecdotesNavigator' }],
        });
      },
    }),
    []
  );

  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={tabBarComponent}
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
          tabPress: (e) => planningListeners.tabPress(e, navigation),
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
          tabPress: (e) => defisListeners.tabPress(e, navigation),
        })}
      />
      <Tab.Screen
        name="anecdotesNavigator"
        component={AnecdotesNavigator}
        options={{ tabBarLabel: 'Anecdotes', tabBarIcon: MessageSquareText }}
        listeners={({ navigation }) => ({
          tabPress: (e) => anecdotesListeners.tabPress(e, navigation),
        })}
      />
      <Tab.Screen
        name="profilNavigator"
        component={ProfilNavigator}
        options={{
          tabBarLabel: 'Profil',
          tabBarIcon: MessageSquareText,
          tabBarButton: () => null
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
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
  const { initializeNotifications, isInitialized } = useNotifications();

  useEffect(() => {
    const loadAsyncFonts = async () => {
      await loadFonts();
    };
    loadAsyncFonts();

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  const shouldShowLoadingForNotifications = user && !isInitialized && !isLoading;

  if (isLoading || shouldShowLoadingForNotifications) {
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
          <ActivityIndicator size="large" color={Colors.muted} />
          {shouldShowLoadingForNotifications && (
            <Text style={{
              marginTop: 16,
              color: Colors.muted,
              textAlign: 'center'
            }}>
              Initialisation des notifications...
            </Text>
          )}
        </View>
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? (
        <Drawer.Navigator
          screenOptions={{ headerShown: false }}
          drawerContent={(props) => <CustomDrawer {...props} />}
        >
          <Drawer.Screen
            name="MainTabs"
            component={MainTabs}
            options={{ drawerLabel: 'Principal' }}
          />
        </Drawer.Navigator>
      ) : (
        <LoginNavigator />
      )}
    </NavigationContainer>
  );
}

const ToastConfig = {
  success: ({ text1, text2, ...rest }: { text1?: string; text2?: string;[key: string]: any }) => (
    <View style={[styles.toastContainer, { backgroundColor: Colors.success }]}>
      <Text style={[styles.toastText, TextStyles.bodyBold]}>{text1}</Text>
      <Text style={[styles.toastText, TextStyles.body]}>{text2}</Text>
    </View>
  ),
  info: ({ text1, text2, ...rest }: { text1?: string; text2?: string;[key: string]: any }) => (
    <View style={[styles.toastContainer, { backgroundColor: Colors.primary }]}>
      <Text style={[styles.toastText, TextStyles.bodyBold]}>{text1}</Text>
      <Text style={[styles.toastText, TextStyles.body]}>{text2}</Text>
    </View>
  ),
  error: ({ text1, text2, ...rest }: { text1?: string; text2?: string;[key: string]: any }) => (
    <View style={[styles.toastContainer, { backgroundColor: Colors.error }]}>
      <Text style={[styles.toastText, TextStyles.bodyBold]}>{text1}</Text>
      <Text style={[styles.toastText, TextStyles.body]}>{text2}</Text>
    </View>
  ),
};

const styles = StyleSheet.create({
  toastContainer: {
    width: '90%',
    padding: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'flex-start',
    shadowColor: Colors.primaryBorder,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  toastText: {
    color: Colors.white,
  },
});
