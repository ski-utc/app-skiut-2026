import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { useNavigation, NavigationProp, ParamListBase } from '@react-navigation/native';

import { TextStyles } from '@/constants/GraphSettings';

type BoutonRetourProps = {
    title: string;
    onCustomPress?: () => void;
}

export default function BoutonRetour({ title, onCustomPress }: BoutonRetourProps) {
    const navigation = useNavigation<NavigationProp<ParamListBase>>();

    const handlePress = () => {
        if (onCustomPress) {
            onCustomPress();
            return;
        }

        if (navigation.canGoBack()) {
            navigation.goBack();
        }
    };

    return (
        <TouchableOpacity
            onPress={handlePress}
            style={styles.button}
            activeOpacity={0.7}
        >
            <ChevronLeft
                size={24}
                color={'#8A8A8A'}
            />
            <Text style={styles.text}>
                {title}
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        alignItems: 'center',
        flexDirection: 'row',
        marginBottom: 16,
        paddingRight: 12,
        paddingVertical: 8,
    },
    text: {
        color: '#000000',
        ...TextStyles.h4,
    },
});
