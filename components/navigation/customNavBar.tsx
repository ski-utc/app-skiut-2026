import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Colors, Fonts, loadFonts } from '@/constants/GraphSettings';

// @ts-ignore
export default function CustomNavBar({ state, descriptors, navigation }) {
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
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const IconComponent = options.tabBarIcon;
          const display = options.display;
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;

          if (['_sitemap', '+not-found'].includes(route.name)) return null;

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              onLongPress={onLongPress}
              style={[
                {
                  flex: 1,
                  flexDirection: 'column',
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                  gap: 12,
                },
                display ? { display: 'flex' } : { display: 'none' }, // Condition pour afficher ou cacher
              ]}
            >
              {IconComponent && (
                <IconComponent
                  size={24}
                  color={isFocused ? activeColor : unactiveColor}
                />
              )}
              <Text
                style={{
                  color: isFocused ? activeColor : unactiveColor,
                  fontSize: 14,
                  fontFamily: Fonts.Inter.Basic,
                  fontWeight: '500',
                  textAlign: 'center',
                }}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}