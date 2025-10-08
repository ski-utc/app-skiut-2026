import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { Colors, TextStyles } from '@/constants/GraphSettings';

// @ts-ignore
export default function BoutonActiverLarge({
    title,
    IconComponent,
    onPress = () => { },
    disabled = false,
    customStyles = {}
}) {
    return (
        <TouchableOpacity
            onPress={disabled ? () => { } : onPress}
            style={[
                {
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingVertical: 16,
                    paddingHorizontal: 20,
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
