import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

import { Colors, TextStyles } from '@/constants/GraphSettings';

type BoutonNavigationLargeProps = {
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
        navigation.emit({
            type: 'tabLongPress',
            target: route.key,
        });
    };

    return (
        <TouchableOpacity
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.button}
        >
            {IconComponent && (
                <IconComponent
                    size={20}
                    color={Colors.white}
                />
            )}
            <Text
                style={styles.text}
            >
                {title}
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        alignItems: 'center',
        backgroundColor: Colors.primary,
        borderRadius: 14,
        bottom: 16,
        elevation: 3,
        flexDirection: 'row',
        gap: 12,
        justifyContent: 'center',
        left: 10,
        padding: 14,
        position: 'absolute',
        right: 10,
        shadowColor: Colors.primaryBorder,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    text: {
        ...TextStyles.body,
        color: Colors.white,
        fontSize: 16,
        fontWeight: '600',
    }
})
