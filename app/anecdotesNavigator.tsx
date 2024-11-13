import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AnecdotesScreen from './anecdotesScreen';
import AnecdotesForm from './anecdotes/anecdotesForm';

const Stack = createStackNavigator();

function AnecdotesNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="anecdotesScreen"
        component={AnecdotesScreen}
        options={{ title: "Anecdotes" }}
      />
      <Stack.Screen
        name="anecdotesForm"
        component={AnecdotesForm}
        options={{ title: "Formulaire d'Anecdote" }}
      />
    </Stack.Navigator>
  );
}

export default AnecdotesNavigator;
