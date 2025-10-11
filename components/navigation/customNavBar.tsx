import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Colors, TextStyles } from '@/constants/GraphSettings';
import { Home, CalendarFold, LandPlot, MessageSquareText } from 'lucide-react-native';

// @ts-ignore
export default function CustomNavBar({ state, navigation }) {

  const activeColor = Colors.primary
  const unactiveColor = Colors.muted;

  const tabs = [
    { name: 'homeNavigator', label: 'Home', Icon: Home },
    { name: 'planningNavigator', label: 'Planning', Icon: CalendarFold },
    { name: 'defisNavigator', label: 'Défi', Icon: LandPlot },
    { name: 'anecdotesNavigator', label: 'Anecdotes', Icon: MessageSquareText },
  ];

  return (
    <View
      style={{
        width: '100%',
        backgroundColor: Colors.white,
      }}
    >
      <View
        style={{
          paddingVertical: 18,
          marginHorizontal: 15,
          backgroundColor: Colors.white,
          borderTopWidth: 1,
          borderTopColor: Colors.lightMuted,
          justifyContent: 'flex-start',
          alignItems: 'center',
          flexDirection: 'row',
          gap: 24,
        }}
      >
        {tabs.map((tab, index) => {
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: tab.name,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(tab.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: tab.name,
            });
          };

          return (
            <TouchableOpacity
              key={tab.name}
              onPress={onPress}
              onLongPress={onLongPress}
              style={{
                flex: 1,
                flexDirection: 'column',
                justifyContent: 'flex-start',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <tab.Icon
                size={24}
                color={isFocused ? activeColor : unactiveColor}
              />
              <Text
                style={{
                  ...TextStyles.bodyBold,
                  color: isFocused ? activeColor : unactiveColor,
                  textAlign: 'center',
                  marginBottom: 2,
                }}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.8}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
