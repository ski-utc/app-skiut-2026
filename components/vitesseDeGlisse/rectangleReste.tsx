import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Fonts } from '@/constants/GraphSettings';

interface RectangleResteProps {
    number: number;
    nom: string;  // prénom + nom
    vitesse: number;
    style?: ViewStyle;
}

const RectangleReste: React.FC<RectangleResteProps> = ({ number, nom, vitesse, style }) => {
    // Calculer la marge en fonction du nombre de chiffres
    const marginRight = number < 10 ? 30 : 16; // Réduire la marge si le nombre a 2 chiffres

    return (
        <View style={[styles.rectangle, style]}>
            <Text style={[styles.bigNumber, { marginRight }]}>
                {number}
            </Text>
            <View style={styles.textContainer}>
                <Text style={styles.nomText}>{nom}</Text>
                <Text style={styles.vitesseText}>{vitesse} km/h</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    rectangle: {
        width: '100%',
        height: 50,
        borderWidth: 2,
        borderColor: Colors.customGray,
        backgroundColor: Colors.white,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
    },
    bigNumber: {
        fontSize: 24,
        fontFamily: Fonts.Text.Bold,
    },
    textContainer: {
        flexDirection: 'column',
    },
    nomText: {
        fontSize: 16,
        fontFamily: Fonts.Text.Medium,
        marginBottom: 4,
    },
    vitesseText: {
        fontSize: 12,
        fontFamily: Fonts.Text.Light,
        color: Colors.gray,
    },
});

export default RectangleReste;
