import { createStackNavigator } from '@react-navigation/stack';

import DefisScreen from './defis/defisScreen';
import DefisClassement from './defis/defisClassement';
import DefisInfos from './defis/defisInfos';

const Stack = createStackNavigator();

export type DefisStackParamList = {
  defisScreen: undefined;
  defisClassement: undefined;
  defisInfos: {
    id: number;
    title: string;
    points: number;
    status: string;
    onUpdate: (id: number, status: string) => void
  };
}

export default function DefisNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="defisScreen"
        component={DefisScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="defisClassement"
        component={DefisClassement}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="defisInfos"
        component={DefisInfos}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
