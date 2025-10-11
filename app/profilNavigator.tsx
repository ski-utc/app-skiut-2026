import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Contact from './profil/contactScreen';
import PlanScreen from './profil/planScreen';
import VitesseDeGlisseScreen from './profil/vitesseDeGlisse/vitesseDeGlisseScreen';
import PerformancesScreen from './profil/vitesseDeGlisse/performancesScreen';
import SkinderNavigator from './skinder/skinderNavigator';
import NavettesScreen from './profil/navettesScreen';
import RGPDScreen from './profil/rgpdScreen';
import AdminNavigator from './adminNavigator';

const Stack = createStackNavigator();

export default function ProfilNavigator() {
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
                component={VitesseDeGlisseScreen}
                listeners={getScreenListeners}
            />
            <Stack.Screen
                name='PerformancesScreen'
                component={PerformancesScreen}
                listeners={getScreenListeners}
            />
            <Stack.Screen
                name="SkinderNavigator"
                component={SkinderNavigator}
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
                name="AdminNavigator"
                component={AdminNavigator}
                listeners={getScreenListeners}
            />
        </Stack.Navigator>
    );
}
