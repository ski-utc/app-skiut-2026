import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { Colors, Fonts } from '@/constants/GraphSettings';
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
            padding: 10,
            backgroundColor: '#E64034',
            borderRadius: 8,
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'row',
            gap: 10,
            }}
        >
            <Text
            style={{
                color: 'white',
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
