import React from 'react';
import { Text, TouchableOpacity, Linking } from 'react-native';
import { Colors, Fonts } from '@/constants/GraphSettings';

// @ts-ignore
export default function BoutonLien({ url, title, IconComponent }) {
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
                backgroundColor: Colors.white,
                borderRadius: 8,
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'row',
                gap: 10,
                borderWidth: 1,
                borderColor: Colors.customGray,
            }}
        >
            <Text
                style={{
                    color: Colors.black,
                    fontSize: 14,
                    fontFamily: Fonts.Inter.Basic,
                    fontWeight: '300',
                }}
            >
                {title}
            </Text>
            {IconComponent && (
                <IconComponent
                    size={20}
                    color={Colors.black}
                />
            )}
        </TouchableOpacity>
    );
};
