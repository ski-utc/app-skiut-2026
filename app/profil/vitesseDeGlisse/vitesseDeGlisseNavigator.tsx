import { createStackNavigator } from '@react-navigation/stack';

import VitesseDeGlisseScreen from './vitesseDeGlisseScreen';
import PerformancesScreen from './performancesScreen';
import UserPerformancesScreen from './userPerformancesScreen';

const Stack = createStackNavigator();

export default function VitesseDeGlisseNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen
                name="VitesseDeGlisseMain"
                component={VitesseDeGlisseScreen}
            />
            <Stack.Screen
                name="PerformancesScreen"
                component={PerformancesScreen}
            />
            <Stack.Screen
                name="UserPerformancesScreen"
                component={UserPerformancesScreen}
            />
        </Stack.Navigator>
    );
}
