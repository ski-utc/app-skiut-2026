import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

// @ts-ignore
export default function CustomTabBar({ state, descriptors, navigation }) {
  const activeColor = '#E64034';
  const unactiveColor = '#7F7D7D';

  return (
    <View
      style={{
        paddingVertical: 18,
        marginHorizontal: 15,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        justifyContent: 'flex-start',
        alignItems: 'center',
        flexDirection: 'row',
        gap: 24,
      }}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const IconComponent = options.tabBarIcon;
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
            style={{
              flex: 1,
              flexDirection: 'column',
              justifyContent: 'flex-start',
              alignItems: 'center',
              gap: 12,
            }}
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
                fontFamily: 'Inter',
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
  );
}