import React from 'react';
import { Text, TouchableOpacity, ViewStyle } from 'react-native';
import { Colors, TextStyles } from '@/constants/GraphSettings';
import { LucideIcon } from 'lucide-react-native';

interface BoutonActiverLargeProps {
    title: string;
    IconComponent?: LucideIcon;
    onPress?: () => void;
    disabled?: boolean;
    customStyles?: ViewStyle;
}

export default function BoutonActiverLarge({
    title,
    IconComponent,
    onPress = () => { },
    disabled = false,
    customStyles = {}
}: BoutonActiverLargeProps) {
    return (
        <TouchableOpacity
            onPress={disabled ? () => { } : onPress}
            style={[
                {
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 14,
                    borderRadius: 14,
                    gap: 12,
                    backgroundColor: disabled ? Colors.muted : Colors.primary,
                    opacity: disabled ? 0.5 : 1,
                },
                customStyles,
            ]}
            activeOpacity={disabled ? 1 : 0.7}
            disabled={disabled}
        >
            {IconComponent && (
                <IconComponent
                    size={20}
                    color={Colors.white}
                />
            )}
            <Text
                style={{
                    ...TextStyles.body,
                    color: Colors.white,
                    fontWeight: '600',
                    fontSize: 16,
                }}
            >
                {title}
            </Text>
        </TouchableOpacity>
    );
};
