import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { Colors, Fonts, TextStyles } from '@/constants/GraphSettings';
import { ChevronLeft } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

// @ts-ignore
export default function BoutonRetour({ previousRoute, title }) {
    const navigation = useNavigation();
    const route = useRoute();

    const onPress = () => {
        navigation.goBack();
    };

    const onLongPress = () => {
        navigation.emit({
            type: 'tabLongPress',
            target: route.key,
        });
    };

    return (
        <TouchableOpacity
            onPress={onPress}
            onLongPress={onLongPress}
            style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 16,
            }}
        >
            <ChevronLeft
                size={24}
                color={'#8A8A8A'}
            />
            <Text
                style={{
                    color: '#000000',
                    ...TextStyles.h4,
                }}
            >
                {title}
            </Text>
        </TouchableOpacity>
    );
};