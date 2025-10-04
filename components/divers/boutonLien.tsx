import React from 'react';
import { Text, TouchableOpacity, Linking } from 'react-native';
import { Colors, TextStyles } from '@/constants/GraphSettings';
import Toast from 'react-native-toast-message';

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
                padding: 12,
                backgroundColor: Colors.white,
                borderRadius: 10,
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'row',
                gap: 10,
                borderWidth: 2,
                borderColor: Colors.primary,
                shadowColor: Colors.primaryBorder,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 3,
                elevation: 2,
            }}
        >
            <Text
                style={{
                    ...TextStyles.button,
                    color: Colors.primaryBorder,
                }}
            >
                {title}
            </Text>
            {IconComponent && (
                <IconComponent
                    size={20}
                    color={Colors.primaryBorder}
                />
            )}
        </TouchableOpacity>
    );
};
