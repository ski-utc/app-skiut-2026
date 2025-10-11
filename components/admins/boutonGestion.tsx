import React from 'react';
import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { TextStyles } from '@/constants/GraphSettings';
import { useNavigation } from '@react-navigation/native';
import { ChevronRight } from 'lucide-react-native';

interface BoutonGestionProps {
    title: string;
    subtitle: string;
    subtitleStyle?: object;
    nextRoute: string;
    id: number;
    valide: boolean;
}

const BoutonGestion: React.FC<BoutonGestionProps> = ({ title, subtitle, subtitleStyle, nextRoute, id, valide }) => {
    const navigation = useNavigation<any>();

    const handleGestionClick = () => {
        navigation.navigate(nextRoute, { id });
    };

    return (
        <TouchableOpacity onPress={handleGestionClick} style={styles.buttonContainer}>
            <View style={styles.textContainer}>
                <View style={styles.textWrapper}>
                    <Text style={styles.titleText}>{title}</Text>
                    <Text style={[styles.subtitleText, subtitleStyle]}>{subtitle}</Text>
                </View>
            </View>
            {valide != null ? <View style={{ height: 8, width: 8, borderRadius: 100, backgroundColor: valide ? 'green' : 'orange' }}></View> : null}
            <ChevronRight size={20} color={'#000000'} />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    buttonContainer: {
        width: "100%",
        paddingLeft: 20,
        paddingRight: 20,
        paddingTop: 14,
        paddingBottom: 14,
        borderBottomWidth: 1,
        borderBottomColor: "#EAEAEA",
        justifyContent: "space-between",
        alignItems: "center",
        flexDirection: "row",
        backgroundColor: 'white',
    },
    textContainer: {
        justifyContent: "flex-start",
        alignItems: "center",
        flexDirection: "row",
        width: '85%',
    },
    textWrapper: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 2,
    },
    titleText: {
        color: "#1E1E1E",
        ...TextStyles.bodyLarge,
        fontWeight: "600",
        wordWrap: 'break-word',
    },
    subtitleText: {
        color: "#737373",
        ...TextStyles.body,
        fontStyle: "italic",
        fontWeight: "400",
        wordWrap: 'break-word',
    },
});

export default BoutonGestion;
