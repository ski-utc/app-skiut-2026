import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { Colors, TextStyles } from '@/constants/GraphSettings';
import { useNavigation, useRoute } from '@react-navigation/native';

interface BoutonNavigationLargeProps {
    nextRoute?: string;
    title: string;
    IconComponent?: any;
}

export default function BoutonNavigationLarge({ nextRoute, title, IconComponent }: BoutonNavigationLargeProps) {
    const navigation = useNavigation<any>();
    const route = useRoute();

    const onPress = () => {
        if (nextRoute) {
            navigation.navigate(nextRoute);
        } else {
            navigation.goBack();
        }
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
                position: 'absolute',
                bottom: 16,
                right: 10,
                left: 10,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 14,
                borderRadius: 14,
                gap: 12,
                backgroundColor: Colors.primary,
                shadowColor: Colors.primaryBorder,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 3,
                elevation: 3,
            }}
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
