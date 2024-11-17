import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { Colors, Fonts } from '@/constants/GraphSettings';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ChevronRight } from 'lucide-react';

interface BoutonDefiProps {
    nextRoute?: string;
    title: string;
    IconComponent: typeof ChevronRight;
    textToTransmit1: string;
    textToTransmit2: string;
}

const BoutonDefi: React.FC<BoutonDefiProps> = ({ nextRoute, title, IconComponent, textToTransmit1, textToTransmit2 }) => {
    const navigation = useNavigation();
    const route = useRoute();

    const onPress = () => {
        if (nextRoute) {
            navigation.navigate(nextRoute, { transmittedText1: textToTransmit1, transmittedText2: textToTransmit2 });
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

export default BoutonDefi;