import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { Colors } from '@/constants/GraphSettings';

interface StatWidgetProps {
    topText: string;
    bottomText: string;
}

const StatWidget: React.FC<StatWidgetProps> = ({ topText, bottomText }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.topText}>{topText}</Text>
            <Text style={styles.bottomText}>{bottomText}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center', // Centrer horizontalement les textes
        justifyContent: 'center', // Centrer verticalement si nécessaire
        backgroundColor: Colors.orange, // Fond orange
        borderWidth: 2, // Bordure blanche
        borderColor: Colors.white,
        borderRadius: 10, // Coins arrondis
        paddingVertical: 20, // Espacement vertical interne
        paddingHorizontal: 40, // Espacement horizontal interne
        marginVertical: 10, // Espacement externe entre widgets
    },
    topText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: '400',
        marginBottom: 4, // Espace entre le texte supérieur et inférieur
    },
    bottomText: {
        color: Colors.white,
        fontSize: 24,
        fontWeight: '700',
    },
});

export default StatWidget;