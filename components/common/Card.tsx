import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, TextStyles } from '@/constants/GraphSettings';

interface CardProps {
  children?: React.ReactNode;
  title?: string;
  subtitle?: string;
  onPress?: () => void;
  variant?: 'default' | 'bordered' | 'elevated';
  style?: any;
}

const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  onPress,
  variant = 'default',
  style,
}) => {
  const cardStyle = [
    styles.card,
    styles[variant],
    style,
  ];

  const content = (
    <View style={cardStyle}>
      {title && (
        <Text style={styles.title}>{title}</Text>
      )}
      {subtitle && (
        <Text style={styles.subtitle}>{subtitle}</Text>
      )}
      {children}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
  },
  
  // Variants
  default: {
    // Base style
  },
  bordered: {
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  elevated: {
    shadowColor: Colors.primaryBorder,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  // Text styles
  title: {
    ...TextStyles.body,
    color: Colors.primaryBorder,
    fontWeight: '600',
    marginBottom: 4,
  },
  subtitle: {
    ...TextStyles.small,
    color: Colors.gray,
    marginBottom: 8,
  },
});

export default Card;
