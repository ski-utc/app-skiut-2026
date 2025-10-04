import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '@/constants/GraphSettings';

interface ScreenContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: boolean;
}

const ScreenContainer: React.FC<ScreenContainerProps> = ({ 
  children, 
  style, 
  padding = true 
}) => {
  return (
    <View style={[
      styles.container, 
      padding && styles.withPadding,
      style
    ]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flex: 1,
    backgroundColor: Colors.white,
    paddingBottom: 16,
  },
  withPadding: {
    paddingHorizontal: 20,
  },
});

export default ScreenContainer;
