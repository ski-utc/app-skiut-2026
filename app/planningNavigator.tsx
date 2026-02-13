import { createStackNavigator } from '@react-navigation/stack';

import PlanningScreen from './planning/planningScreen';

const Stack = createStackNavigator();

export default function PlanningNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="planningScreen"
        component={PlanningScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
