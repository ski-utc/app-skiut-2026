import { useState, useEffect, useCallback, useMemo } from 'react';
import { ActivityIndicator, View, Text, StyleSheet, Platform, Keyboard } from 'react-native';
import { NavigationContainer, NavigationProp } from '@react-navigation/native';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Home, CalendarFold, LandPlot, MessageSquareText } from 'lucide-react-native';
import Toast from 'react-native-toast-message';

import { Colors, TextStyles, loadFonts } from '@/constants/GraphSettings';

import { UserProvider, useUser } from '../contexts/UserContext';
import CustomNavBar from '../components/navigation/customNavBar';
import CustomDrawer from '../components/navigation/customDrawer';
import { useNotifications } from '../hooks/useNotifications';

import HomeNavigator from './homeNavigator';
import PlanningNavigator from './planningNavigator';
import AnecdotesNavigator from './anecdotesNavigator';
import DefisNavigator from './defisNavigator';
import DrawerNavigator from './drawerNavigator';
import LoginNavigator from './loginNavigator';

type RootTabParamList = {
  homeNavigator: undefined;
  planningNavigator: undefined;
  defisNavigator: undefined;
  anecdotesNavigator: undefined;
  drawerNavigator: undefined;
};

type RootDrawerParamList = {
  MainTabs: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();
const Drawer = createDrawerNavigator<RootDrawerParamList>();

type TabPressEvent = {
  preventDefault: () => void;
  defaultPrevented: boolean;
};

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

  const tabBarComponent = useCallback(
    (props: BottomTabBarProps) => (!keyboardVisible ? <CustomNavBar {...props} /> : null),
    [keyboardVisible]
  );

  const planningListeners = useMemo(
    () => ({
      tabPress: (e: TabPressEvent, navigation: NavigationProp<RootTabParamList>) => {
        e.preventDefault();
        navigation.reset({
          index: 0,
          routes: [{ name: 'planningNavigator' }],
        });
      },
    }),
    []
  );

  const defisListeners = useMemo(
    () => ({
      tabPress: (e: TabPressEvent, navigation: NavigationProp<RootTabParamList>) => {
        e.preventDefault();
        navigation.reset({
          index: 0,
          routes: [{ name: 'defisNavigator' }],
        });
      },
    }),
    []
  );

  const anecdotesListeners = useMemo(
    () => ({
      tabPress: (e: TabPressEvent, navigation: NavigationProp<RootTabParamList>) => {
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
        options={{ tabBarLabel: 'Home', tabBarIcon: ({ color, size }) => <Home color={color} size={size} /> }}
      />
      <Tab.Screen
        name="planningNavigator"
        component={PlanningNavigator}
        options={{
          tabBarLabel: 'Planning',
          tabBarIcon: ({ color, size }) => <CalendarFold color={color} size={size} />,
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
          tabBarIcon: ({ color, size }) => <LandPlot color={color} size={size} />,
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => defisListeners.tabPress(e, navigation),
        })}
      />
      <Tab.Screen
        name="anecdotesNavigator"
        component={AnecdotesNavigator}
        options={{
          tabBarLabel: 'Anecdotes',
          tabBarIcon: ({ color, size }) => <MessageSquareText color={color} size={size} />,
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => anecdotesListeners.tabPress(e, navigation),
        })}
      />
      <Tab.Screen
        name="drawerNavigator"
        component={DrawerNavigator}
        options={{
          tabBarLabel: 'Profil',
          tabBarIcon: ({ color, size }) => <MessageSquareText color={color} size={size} />,
          tabBarButton: () => null,
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
  const { isInitialized } = useNotifications();

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
      <View style={styles.container}>
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color={Colors.muted} />
          {shouldShowLoadingForNotifications && (
            <Text style={styles.loadingText}>
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
  success: ({ text1, text2 }: { text1?: string; text2?: string }) => (
    <View style={[styles.toastContainer, { backgroundColor: Colors.success }]}>
      <Text style={[styles.toastText, TextStyles.bodyBold]}>{text1}</Text>
      <Text style={[styles.toastText, TextStyles.body]}>{text2}</Text>
    </View>
  ),
  info: ({ text1, text2 }: { text1?: string; text2?: string }) => (
    <View style={[styles.toastContainer, { backgroundColor: Colors.primary }]}>
      <Text style={[styles.toastText, TextStyles.bodyBold]}>{text1}</Text>
      <Text style={[styles.toastText, TextStyles.body]}>{text2}</Text>
    </View>
  ),
  error: ({ text1, text2 }: { text1?: string; text2?: string }) => (
    <View style={[styles.toastContainer, { backgroundColor: Colors.error }]}>
      <Text style={[styles.toastText, TextStyles.bodyBold]}>{text1}</Text>
      <Text style={[styles.toastText, TextStyles.body]}>{text2}</Text>
    </View>
  ),
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    justifyContent: 'center',
    width: '100%',
  },
  loadingContent: {
    alignItems: 'center',
    backgroundColor: Colors.white,
    flex: 1,
    justifyContent: 'center',
    width: '100%',
  },
  loadingText: {
    color: Colors.muted,
    marginTop: 16,
    textAlign: 'center'
  },
  toastContainer: {
    alignItems: 'flex-start',
    borderRadius: 12,
    elevation: 5,
    justifyContent: 'center',
    padding: 16,
    shadowColor: Colors.primaryBorder,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    width: '90%',
  },
  toastText: {
    color: Colors.white,
  },
});
