import React from 'react';
import { Text, TouchableOpacity, Linking } from 'react-native';
import { Colors, Fonts } from '@/constants/GraphSettings';

// @ts-ignore
export default function BoutonLien({ url, title, IconComponent }) {
    const onPress = () => {
        if (url) {
            Linking.openURL(url).catch(err => {
                // Show a toast message on error
                Toast.show({
                    type: 'error',  // You can use 'success', 'error', or 'info' types based on the context
                    text1: 'Erreur lors de l\'ouverture de l\'URL',
                    text2: err.message,  // Display the error message from the exception
                });
            });
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
                    fontWeight: '600',
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
