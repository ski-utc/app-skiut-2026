import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Home, CalendarFold, LandPlot, MessageSquareText } from 'lucide-react-native';

import { Colors, TextStyles } from '@/constants/GraphSettings';

export default function CustomNavBar({ state, navigation }) {
  const activeColor = Colors.primary;
  const unactiveColor = Colors.muted;

  const tabs = [
    { name: 'homeNavigator', label: 'Home', Icon: Home },
    { name: 'planningNavigator', label: 'Planning', Icon: CalendarFold },
    { name: 'defisNavigator', label: 'Défi', Icon: LandPlot },
    { name: 'anecdotesNavigator', label: 'Anecdotes', Icon: MessageSquareText },
  ];

  return (
    <View style={styles.navbarContainer}>
      <View style={styles.tabsContainer}>
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
              style={styles.tabButton}
            >
              <tab.Icon
                size={24}
                color={isFocused ? activeColor : unactiveColor}
              />
              <Text
                style={[
                  styles.tabText,
                  { color: isFocused ? activeColor : unactiveColor }
                ]}
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

const styles = StyleSheet.create({
  navbarContainer: {
    backgroundColor: Colors.white,
    width: '100%',
  },
  tabButton: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'column',
    gap: 12,
    justifyContent: 'flex-start',
  },
  tabText: {
    ...TextStyles.bodyBold,
    marginBottom: 2,
    textAlign: 'center',
  },
  tabsContainer: {
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderTopColor: Colors.lightMuted,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 24,
    justifyContent: 'flex-start',
    marginHorizontal: 15,
    paddingVertical: 18,
  },
});
