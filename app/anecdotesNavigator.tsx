import { createStackNavigator } from '@react-navigation/stack';

import AnecdotesScreen from './anecdotes/anecdotesScreen';
import AnecdotesForm from './anecdotes/anecdotesForm';

const Stack = createStackNavigator();

export default function AnecdotesNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="anecdotesScreen"
        component={AnecdotesScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="anecdotesForm"
        component={AnecdotesForm}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
