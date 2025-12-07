import {
  createStackNavigator,
  StackNavigationProp,
} from '@react-navigation/stack';
import { EventArg, NavigationAction } from '@react-navigation/native';

import Contact from './profil/contactScreen';
import PlanScreen from './profil/planScreen';
import VitesseDeGlisseNavigator from './profil/vitesseDeGlisse/vitesseDeGlisseNavigator';
import NavettesScreen from './profil/navettesScreen';
import RGPDScreen from './profil/rgpdScreen';
import TourneeChambreScreen from './profil/tourneeChambreScreen';
import AdminNavigator from './admin/adminNavigator';
import MonoprutNavigator from './monoprutNavigator';

type DrawerStackParamList = {
  ContactScreen: undefined;
  PlanScreen: undefined;
  VitesseDeGlisseScreen: undefined;
  NavettesScreen: undefined;
  RGPDScreen: undefined;
  MonoprutNavigator: undefined;
  TourneeChambreScreen: undefined;
  AdminNavigator: undefined;
};

type BeforeRemoveEvent = EventArg<
  'beforeRemove',
  true,
  { action: NavigationAction }
>;

type ListenerProps = {
  navigation: StackNavigationProp<DrawerStackParamList>;
};

const Stack = createStackNavigator<DrawerStackParamList>();

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
        name="ContactScreen"
        component={Contact}
        listeners={getScreenListeners}
      />
      <Stack.Screen
        name="PlanScreen"
        component={PlanScreen}
        listeners={getScreenListeners}
      />
      <Stack.Screen
        name="VitesseDeGlisseScreen"
        component={VitesseDeGlisseNavigator}
        listeners={getScreenListeners}
      />
      <Stack.Screen
        name="NavettesScreen"
        component={NavettesScreen}
        listeners={getScreenListeners}
      />
      <Stack.Screen
        name="RGPDScreen"
        component={RGPDScreen}
        listeners={getScreenListeners}
      />
      <Stack.Screen
        name="MonoprutNavigator"
        component={MonoprutNavigator}
        listeners={getScreenListeners}
      />
      <Stack.Screen
        name="TourneeChambreScreen"
        component={TourneeChambreScreen}
        listeners={getScreenListeners}
      />
      <Stack.Screen
        name="AdminNavigator"
        component={AdminNavigator}
        listeners={getScreenListeners}
      />
    </Stack.Navigator>
  );
}
