import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { TextStyles } from '@/constants/GraphSettings';
import { ChevronLeft } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

interface BoutonRetourProps {
    previousRoute?: string;
    title: string;
}

export default function BoutonRetour({ previousRoute, title }: BoutonRetourProps) {
    const navigation = useNavigation<any>();
    const route = useRoute();

    const onPress = () => {
        navigation.goBack();
    };

    const onLongPress = () => {
        // @ts-ignore - Navigation emit is not typed
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