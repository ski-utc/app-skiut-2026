import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { Colors, TextStyles } from '@/constants/GraphSettings';
import { useNavigation, useRoute } from '@react-navigation/native';

// @ts-ignore
export default function BoutonNavigation({ nextRoute, title, IconComponent }) {
    const navigation = useNavigation();
    const route = useRoute();

    const onPress = () => {
        if (nextRoute) {
            navigation.navigate(nextRoute);
        } else {
            navigation.goBack();
        }
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
            padding: 12,
            backgroundColor: Colors.accent,
            borderRadius: 10,
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'row',
            gap: 10,
            shadowColor: Colors.primaryBorder,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 3,
            elevation: 3,
            }}
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
