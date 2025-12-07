import { Text, TouchableOpacity, ViewStyle, StyleSheet } from 'react-native';
import { LucideIcon } from 'lucide-react-native';

import { Colors, TextStyles } from '@/constants/GraphSettings';

type BoutonActiverLargeProps = {
  title: string;
  IconComponent?: LucideIcon;
  onPress?: () => void;
  disabled?: boolean;
  customStyles?: ViewStyle;
};

export default function BoutonActiverLarge({
  title,
  IconComponent,
  onPress = () => {},
  disabled = false,
  customStyles = {},
}: BoutonActiverLargeProps) {
  const activeOpacity = 1;
  const inactiveOpacity = 0.4;

  return (
    <TouchableOpacity
      onPress={disabled ? () => {} : onPress}
      style={[
        styles.button,
        {
          backgroundColor: disabled ? Colors.muted : Colors.primary,
          opacity: disabled ? inactiveOpacity : activeOpacity,
        },
        customStyles,
      ]}
      activeOpacity={disabled ? 1 : 0.7}
      disabled={disabled}
    >
      {IconComponent && <IconComponent size={20} color={Colors.white} />}
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: 14,
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
    padding: 14,
  },
  text: {
    ...TextStyles.body,
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
