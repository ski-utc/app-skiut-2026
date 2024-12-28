import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Fonts } from '@/constants/GraphSettings';

interface RectangleResteProps {
    bottom: number;
    number: number;
    nom: string;
    vitesse: number;
    style?: ViewStyle;
}

const RectangleReste: React.FC<RectangleResteProps> = ({ bottom, number, nom, vitesse, style }) => {
    return (
        <View style={[styles.rectangle, { bottom }, style]}>
            <Text style={styles.bigNumber}>{number}</Text>
            <View style={styles.textContainer}>
                <Text style={styles.nomText}>{nom}</Text>
                <Text style={styles.vitesseText}>{vitesse} km/h</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    rectangle: {
        position: 'absolute',
        left: 0,
        right: 0,
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
        marginRight: 30,
    },
    textContainer: {
        flexDirection: 'column',
    },
    nomText: {
        fontSize: 16,
        fontFamily: Fonts.Text.Medium,
    },
    vitesseText: {
        fontSize: 12,
        fontFamily: Fonts.Text.Light,
        color: Colors.gray,
    },
});

export default RectangleReste;