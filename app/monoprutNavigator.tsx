import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import MonoprutScreen from './monoprut/monoprutScreen';
import MyReservationsScreen from './monoprut/myReservationsScreen';
import MyOffersScreen from './monoprut/myOffersScreen';

const Stack = createStackNavigator();

export default function MonoprutNavigator() {
    const getScreenListeners = ({ navigation }: any) => ({
        beforeRemove: (e: any) => {
            if (e.data.action.type === 'GO_BACK' || e.data.action.type === 'POP') {
                e.preventDefault();

                const parentNavigation = navigation.getParent();
                if (parentNavigation) {
                    parentNavigation.navigate('homeNavigator', {
                        screen: 'homeScreen'
                    });
                }
            }
        }
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

