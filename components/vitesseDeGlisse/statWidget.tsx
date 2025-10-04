import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { Colors, TextStyles } from '@/constants/GraphSettings';

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
        backgroundColor: Colors.accent, // Fond orange selon la nouvelle charte
        borderWidth: 2, // Bordure
        borderColor: Colors.white,
        borderRadius: 12, // Coins arrondis améliorés
        paddingVertical: 20, // Espacement vertical interne
        paddingHorizontal: 40, // Espacement horizontal interne
        marginVertical: 10, // Espacement externe entre widgets
        shadowColor: Colors.primaryBorder,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    topText: {
        ...TextStyles.body,
        color: Colors.white,
        marginBottom: 4, // Espace entre le texte supérieur et inférieur
    },
    bottomText: {
        ...TextStyles.h2,
        color: Colors.white,
        fontWeight: '700',
    },
});

export default StatWidget;