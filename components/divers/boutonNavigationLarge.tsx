import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, NavigationProp, ParamListBase } from '@react-navigation/native';
import { LucideProps } from 'lucide-react-native';

import { Colors, TextStyles } from '@/constants/GraphSettings';

type BoutonNavigationLargeProps = {
    nextRoute?: string;
    title: string;
    IconComponent?: React.FC<LucideProps>;
}

export default function BoutonNavigationLarge({ nextRoute, title, IconComponent }: BoutonNavigationLargeProps) {
    const navigation = useNavigation<NavigationProp<ParamListBase>>();

    const onPress = () => {
        if (nextRoute) {
            navigation.navigate(nextRoute);
        } else if (navigation.canGoBack()) {
            navigation.goBack();
        }
    };

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.8}
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
