import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Fonts } from '@/constants/GraphSettings';

interface RectanglePodiumProps {
    height: number;
    nom: string;
    vitesse: number;
    style?: ViewStyle;
}

const RectanglePodium: React.FC<RectanglePodiumProps> = ({ height, nom, vitesse, style }) => {
    return (
        <View style={[styles.container, style]}>
            <Text
                style={styles.text}
                numberOfLines={1} // Limite à une ligne
                ellipsizeMode="tail" // Ajoute des "..." si le texte est trop long
            >
                {nom}
            </Text>
            <Text style={styles.speedText}>{vitesse} km/h</Text>
            <View style={[styles.rectangle, { height }]} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        width: 100, // Limite la largeur du conteneur pour mieux gérer les dépassements
    },
    text: {
        color: Colors.white,
        fontSize: 18,
        fontFamily: Fonts.Text.Medium,
        marginTop: 2,
        textAlign: 'center', // Centre le texte horizontalement
    },
    speedText: {
        color: Colors.white,
        fontSize: 13,
        fontFamily: Fonts.Text.Light,
        marginBottom: 0,
    },
    rectangle: {
        width: 100,
        backgroundColor: Colors.lightOrange,
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        marginHorizontal: 4,
    },
});

export default RectanglePodium;