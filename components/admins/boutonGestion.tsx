import React from 'react';
import { Text, TouchableOpacity, View, StyleSheet, TextStyle } from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { ChevronRight } from 'lucide-react-native';

import { Colors, TextStyles } from '@/constants/GraphSettings';

type AdminStackParamList = {
    valideDefisScreen: { id: number };
    valideAnecdotesScreen: { id: number };
    valideNotificationsScreen: { id: number };
};

type BoutonGestionProps = {
    title: string;
    subtitle: string;
    subtitleStyle?: TextStyle;
    nextRoute: keyof AdminStackParamList;
    id: number;
    valide: boolean;
}

const BoutonGestion: React.FC<BoutonGestionProps> = ({ title, subtitle, subtitleStyle, nextRoute, id, valide }) => {
    const navigation = useNavigation<NavigationProp<AdminStackParamList>>();

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
            {valide != null ? <View style={[styles.valideDot, { backgroundColor: valide ? Colors.success : Colors.error }]}></View> : null}
            <ChevronRight size={20} color={'#000000'} />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    buttonContainer: {
        alignItems: "center",
        backgroundColor: 'white',
        borderBottomColor: "#EAEAEA",
        borderBottomWidth: 1,
        flexDirection: "row",
        justifyContent: "space-between",
        paddingBottom: 14,
        paddingLeft: 20,
        paddingRight: 20,
        paddingTop: 14,
        width: "100%",
    },
    subtitleText: {
        color: "#737373",
        ...TextStyles.body,
        flexWrap: 'wrap',
        fontStyle: "italic",
        fontWeight: "400",
    },
    textContainer: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "flex-start",
        width: '85%',
    },
    textWrapper: {
        alignItems: 'flex-start',
        flexDirection: 'column',
        gap: 2,
    },
    titleText: {
        color: "#1E1E1E",
        ...TextStyles.bodyLarge,
        flexWrap: 'wrap',
        fontWeight: "600",
    },
    valideDot: {
        borderRadius: 100,
        height: 8,
        width: 8,
    }
});

export default BoutonGestion;
