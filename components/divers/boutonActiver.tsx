import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { Colors, TextStyles } from '@/constants/GraphSettings';

// @ts-ignore
export default function BoutonActiver({
    title,
    IconComponent,
    color,
    onPress = () => { },
    disabled = false,
    customStyles = {}
}) {
    return (
        <TouchableOpacity
            onPress={disabled ? () => { } : onPress}
            style={[
                {
                    padding: 10,
                    backgroundColor: disabled ? Colors.muted : color,
                    borderRadius: 8,
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexDirection: 'row',
                    gap: 10,
                    opacity: disabled ? 0.5 : 1,
                },
                customStyles,
            ]}
            activeOpacity={disabled ? 1 : 0.7}
            disabled={disabled}
        >
            <Text
                style={{
                    ...TextStyles.button,
                    color: Colors.white,
                }}
            >
                {title}
            </Text>
            {IconComponent && (
                <IconComponent
                    size={20}
                    color={Colors.white}
                />
            )}
        </TouchableOpacity>
    );
};
