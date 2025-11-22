import { createStackNavigator } from '@react-navigation/stack';

import GestionDefisScreen from './gestionDefisScreen';
import GestionAnecdotesScreen from './gestionAnecdotesScreen';
import GestionNotificationsScreen from './gestionNotificationsScreen';
import Admin from './adminScreen';
import ValideDefis from './valideDefisScreen';
import ValideDefisRapide from './valideDefisRapide';
import ValideAnecdotes from './valideAnecdotesScreen';
import ValideNotifications from './valideNotificationsScreen';
import CreateNotificationScreen from './createNotificationScreen';
import GestionPermanencesScreen from './gestionPermanencesScreen';
import GestionTourneeChambreScreen from './gestionTourneeChambreScreen';

const Stack = createStackNavigator();

export default function AdminNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="adminScreen"
        component={Admin}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="gestionDefisScreen"
        component={GestionDefisScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="gestionAnecdotesScreen"
        component={GestionAnecdotesScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="gestionNotificationsScreen"
        component={GestionNotificationsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="valideDefisScreen"
        component={ValideDefis}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="valideDefisRapide"
        component={ValideDefisRapide}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="valideAnecdotesScreen"
        component={ValideAnecdotes}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="valideNotificationsScreen"
        component={ValideNotifications}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="createNotificationScreen"
        component={CreateNotificationScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="gestionPermanencesScreen"
        component={GestionPermanencesScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="gestionTourneeChambreScreen"
        component={GestionTourneeChambreScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
