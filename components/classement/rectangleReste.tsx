import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Fonts } from '@/constants/GraphSettings';

interface RectangleResteProps {
    bottom: number;
    number: number;
    num: number;
    nb_likes: number;
    style?: ViewStyle;
}

const RectangleReste: React.FC<RectangleResteProps> = ({ bottom, number, num, nb_likes, style }) => {
    return (
        <View style={[styles.rectangle, { bottom }, style]}>
            <Text style={styles.bigNumber}>{number}</Text>
            <View style={styles.textContainer}>
                <Text style={styles.chambreText}>Chambre {num}</Text>
                <Text style={styles.likesText}>{nb_likes} points</Text>
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
    chambreText: {
        fontSize: 16,
        fontFamily: Fonts.Text.Medium,
    },
    likesText: {
        fontSize: 12,
        fontFamily: Fonts.Text.Light,
        color: Colors.gray,
    },
});

export default RectangleReste;