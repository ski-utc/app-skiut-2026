import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Colors, Fonts, loadFonts } from '@/constants/GraphSettings';
import { Home, CalendarFold, LandPlot, MessageSquareText } from 'lucide-react-native';

// @ts-ignore
export default function CustomNavBar({ state, navigation }) {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    const loadAsyncFonts = async () => {
      await loadFonts();
      setFontsLoaded(true);
    };
    loadAsyncFonts();
  }, []);

  const activeColor = Colors.orange;
  const unactiveColor = Colors.gray;

  const tabs = [
    { name: 'homeNavigator', label: 'Home', Icon: Home },
    { name: 'planningNavigator', label: 'Planning', Icon: CalendarFold },
    { name: 'defisNavigator', label: 'Défi', Icon: LandPlot },
    { name: 'anecdotesNavigator', label: 'Anecdotes', Icon: MessageSquareText },
  ];

  if (!fontsLoaded) {
    return (
      <View
        style={{
          width: '100%',
          height: 70,
          backgroundColor: Colors.white,
        }}
      />
    );
  }

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
          borderTopColor: Colors.customWhite,
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
                  color: isFocused ? activeColor : unactiveColor,
                  fontSize: 14,
                  fontFamily: Fonts.Inter.Basic,
                  fontWeight: '500',
                  textAlign: 'center',
                }}
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
