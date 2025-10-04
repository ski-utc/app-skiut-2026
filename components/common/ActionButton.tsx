import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Colors, TextStyles } from '@/constants/GraphSettings';

interface ActionButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  style?: any;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  style,
}) => {
  const buttonStyle = [
    styles.button,
    styles[variant],
    styles[size],
    disabled && styles.disabled,
    style,
  ];

  const textStyle = [
    styles.buttonText,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    disabled && styles.disabledText,
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text style={textStyle}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primaryBorder,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  
  // Variants
  primary: {
    backgroundColor: Colors.accent,
  },
  secondary: {
    backgroundColor: Colors.primary,
  },
  danger: {
    backgroundColor: Colors.error,
  },
  success: {
    backgroundColor: Colors.success,
  },
  
  // Sizes
  small: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  medium: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  large: {
    paddingVertical: 15,
    paddingHorizontal: 24,
  },
  
  // Disabled
  disabled: {
    backgroundColor: Colors.gray,
    opacity: 0.6,
  },
  
  // Text styles
  buttonText: {
    fontWeight: '600',
    textAlign: 'center',
  },
  primaryText: {
    ...TextStyles.button,
    color: Colors.white,
  },
  secondaryText: {
    ...TextStyles.button,
    color: Colors.white,
  },
  dangerText: {
    ...TextStyles.button,
    color: Colors.white,
  },
  successText: {
    ...TextStyles.button,
    color: Colors.white,
  },
  disabledText: {
    color: Colors.white,
  },
  
  // Text sizes
  smallText: {
    ...TextStyles.small,
    fontWeight: '600',
  },
  mediumText: {
    ...TextStyles.button,
  },
  largeText: {
    ...TextStyles.buttonLarge,
  },
});

export default ActionButton;
