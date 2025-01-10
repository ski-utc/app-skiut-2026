import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Fonts } from '@/constants/GraphSettings';

interface RectanglePodiumProps {
    height: number;
    num: number;
    nb_likes: number;
    style?: ViewStyle;
}

const RectanglePodium: React.FC<RectanglePodiumProps> = ({ height, num, nb_likes, style }) => {
    return (
        <View style={[styles.container, style]}>
            <Text style={styles.text}>Chambre {num}</Text>
            <Text style={styles.likesText}>{nb_likes} points</Text>
            <View style={[styles.rectangle, { height }]} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
    },
    text: {
        color: Colors.white,
        fontSize: 18,
        fontFamily: Fonts.Text.Medium,
    },
    likesText: {
        color: Colors.white,
        fontSize: 14,
        fontFamily: Fonts.Text.Light,
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