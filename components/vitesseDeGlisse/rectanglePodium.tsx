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
            <Text style={styles.text}>{nom}</Text>
            <Text style={styles.speedText}>{vitesse} km/h</Text>
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
        marginTop: 2,
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