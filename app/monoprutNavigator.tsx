import {
  createStackNavigator,
  StackNavigationProp,
} from '@react-navigation/stack';
import { EventArg, NavigationAction } from '@react-navigation/native';

import MonoprutScreen from './monoprut/monoprutScreen';
import MyReservationsScreen from './monoprut/myReservationsScreen';
import MyOffersScreen from './monoprut/myOffersScreen';

export type MonoprutStackParamList = {
  MonoprutScreen: undefined;
  MyReservationsScreen: undefined;
  MyOffersScreen: undefined;
};

type BeforeRemoveEvent = EventArg<
  'beforeRemove',
  true,
  { action: NavigationAction }
>;

type ListenerProps = {
  navigation: StackNavigationProp<MonoprutStackParamList>;
};

const Stack = createStackNavigator<MonoprutStackParamList>();

export default function DrawerNavigator() {
  const getScreenListeners = ({ navigation }: ListenerProps) => ({
    beforeRemove: (e: BeforeRemoveEvent) => {
      if (e.data.action.type === 'GO_BACK' || e.data.action.type === 'POP') {
        e.preventDefault();

        const parentNavigation = navigation.getParent();
        if (parentNavigation) {
          parentNavigation.navigate('homeNavigator', {
            screen: 'homeScreen',
          });
        }
      }
    },
  });

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="MonoprutScreen"
        component={MonoprutScreen}
        listeners={getScreenListeners}
      />
      <Stack.Screen
        name="MyReservationsScreen"
        component={MyReservationsScreen}
        listeners={getScreenListeners}
      />
      <Stack.Screen
        name="MyOffersScreen"
        component={MyOffersScreen}
        listeners={getScreenListeners}
      />
    </Stack.Navigator>
  );
}
