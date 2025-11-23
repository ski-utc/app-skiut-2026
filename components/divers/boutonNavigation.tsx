import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, NavigationProp, ParamListBase } from '@react-navigation/native';
import { LucideIcon } from 'lucide-react-native';

import { Colors, TextStyles } from '@/constants/GraphSettings';

type BoutonNavigationProps = {
    nextRoute?: string;
    title: string;
    IconComponent?: LucideIcon;
}

export default function BoutonNavigation({ nextRoute, title, IconComponent }: BoutonNavigationProps) {
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
            <Text
                style={[
                    TextStyles.button,
                    { color: Colors.white }
                ]}
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
}

const styles = StyleSheet.create({
    button: {
        alignItems: 'center',
        backgroundColor: Colors.primary,
        borderRadius: 10,
        bottom: 16,
        elevation: 3,
        flexDirection: 'row',
        gap: 10,
        justifyContent: 'center',
        left: 10,
        padding: 14,
        position: 'absolute',
        right: 10,
        shadowColor: Colors.primaryBorder,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    }
});
