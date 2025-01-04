import React from 'react';
import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { Colors, Fonts } from '@/constants/GraphSettings';
import { useNavigation } from '@react-navigation/native';
import { ChevronRight } from 'lucide-react-native';

interface BoutonGestionProps {
    title: string;
    subtitle: string;
    nextRoute: string;
}


const BoutonGestion: React.FC<BoutonGestionProps> = ({ title, subtitle, nextRoute, anecdoteId }) => {
    const navigation = useNavigation();

    const handleGestionClick = () => {
        console.log(`${nextRoute} clicked`);
        navigation.navigate(nextRoute, { anecdoteId });  // Passer uniquement l'ID
    };

    return (
        <TouchableOpacity onPress={handleGestionClick} style={styles.buttonContainer}>
            <View style={styles.textContainer}>
                <View style={styles.textWrapper}>
                    <Text style={styles.titleText}>{title}</Text>
                    <Text style={styles.subtitleText}>{subtitle}</Text>
                </View>
            </View>
            <ChevronRight size={20} color={Colors.black} />
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
        fontSize: 14,
        fontFamily: Fonts.Inter.Basic,
        fontWeight: "600",
        wordWrap: 'break-word',
    },
    subtitleText: {
        color: "#737373",
        fontSize: 12,
        fontFamily: Fonts.Inter.Basic,
        fontStyle: "italic",
        fontWeight: "400",
        wordWrap: 'break-word',
    },
});

export default BoutonGestion;
