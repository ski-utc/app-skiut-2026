import { createStackNavigator } from '@react-navigation/stack';

import SkinderDiscover from './skinderDiscover';
import SkinderProfil from './skinderProfil';
import MatchScreen from './matchScreen';
import SkinderMyMatches from './skinderMyMatches';

const Stack = createStackNavigator();

export type SkinderStackParamList = {
  skinderDiscover: undefined;
  skinderProfil: undefined;
  matchScreen: {
    myImage: string;
    roomImage: string;
    roomNumber: string;
    roomResp?: string;
  };
  skinderMyMatches: undefined;
};

export default function SkinderNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="skinderDiscover"
        component={SkinderDiscover}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="skinderProfil"
        component={SkinderProfil}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="matchScreen"
        component={MatchScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="skinderMyMatches"
        component={SkinderMyMatches}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
