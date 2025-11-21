import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

import { Colors, TextStyles } from '@/constants/GraphSettings';

type BoutonRetourProps = {
    title: string;
}

export default function BoutonRetour({ title }: BoutonRetourProps) {
    const navigation = useNavigation<any>();
    const route = useRoute();

    const onPress = () => {
        navigation.goBack();
    };

    const onLongPress = () => {
        (navigation as any).emit({
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
            <ChevronLeft
                size={24}
                color={'#8A8A8A'}
            />
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
        flexDirection: 'row',
        marginBottom: 16,
    },
    text: {
        color: Colors.white,
        ...TextStyles.h4,
    }
});
