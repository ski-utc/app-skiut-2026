import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Fonts } from '@/constants/GraphSettings';

interface RectangleResteProps {
    number: number;
    num: string; // room name 
    nb_likes: number;
    style?: ViewStyle;
}

const RectangleReste: React.FC<RectangleResteProps> = ({ number, num, nb_likes, style }) => {
    // Calculer la marge en fonction du nombre de chiffres
    const marginRight = number < 10 ? 30 : 16; // Réduire la marge si le nombre a 2 chiffres

    return (
        <View style={[styles.rectangle, style]}>
            <Text style={[styles.bigNumber, { marginRight }]}>
                {number}
            </Text>
            <View style={styles.textContainer}>
                <Text style={styles.chambreText}>Chambre {num}</Text>
                <Text style={styles.likesText}>{nb_likes} points</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    rectangle: {
        width: '100%', // Ensure the rectangle spans the entire width of the screen
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
    chambreText: {
        fontSize: 16,
        fontFamily: Fonts.Text.Medium,
        marginBottom: 4,
    },
    likesText: {
        fontSize: 12,
        fontFamily: Fonts.Text.Light,
        color: Colors.gray,
    },
});

export default RectangleReste;
