import { Text, TouchableOpacity, ViewStyle, StyleSheet } from 'react-native';
import { LucideIcon } from 'lucide-react-native';

import { Colors, TextStyles } from '@/constants/GraphSettings';

type BoutonActiverProps = {
    title: string;
    IconComponent?: LucideIcon;
    color?: string;
    onPress?: () => void;
    disabled?: boolean;
    customStyles?: ViewStyle;
}

export default function BoutonActiver({
    title,
    IconComponent,
    color = Colors.primary,
    onPress = () => { },
    disabled = false,
    customStyles = {}
}: BoutonActiverProps) {
    const activeOpacity = 1;
    const inactiveOpacity = 0.4;

    return (
        <TouchableOpacity
            onPress={disabled ? () => { } : onPress}
            style={[
                styles.button,
                {
                    backgroundColor: disabled ? Colors.muted : color,
                    opacity: disabled ? inactiveOpacity : activeOpacity,
                },
                customStyles,
            ]}
            activeOpacity={disabled ? 1 : 0.7}
            disabled={disabled}
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
}

const styles = StyleSheet.create({
    button: {
        alignItems: 'center',
        borderRadius: 8,
        flexDirection: 'row',
        gap: 10,
        justifyContent: 'center',
        padding: 14,
    }
})
