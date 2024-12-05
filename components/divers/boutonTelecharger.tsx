import React from 'react';
import { Text, TouchableOpacity, Linking } from 'react-native';
import { Colors, Fonts } from '@/constants/GraphSettings';

// @ts-ignore
export default function BoutonTelecharger({ url, title, IconComponent }) {
    const onPress = () => {
        if (url) {
            Linking.openURL(url).catch(err => console.error("Failed to open URL:", err));
        }
    };

    return (
        <TouchableOpacity
            onPress={onPress}
            style={{
                padding: 10,
                backgroundColor: Colors.orange,
                borderRadius: 8,
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'row',
                gap: 10,
            }}
        >
            <Text
                style={{
                    color: Colors.white,
                    fontSize: 14,
                    fontFamily: Fonts.Inter.Basic,
                    fontWeight: '600',
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
