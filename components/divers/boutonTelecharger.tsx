import React from 'react';
import { Text, TouchableOpacity, Linking } from 'react-native';
import { Colors, Fonts } from '@/constants/GraphSettings';
import Toast from 'react-native-toast-message';

// @ts-ignore
export default function BoutonTelecharger({ url, title, IconComponent }) {
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
