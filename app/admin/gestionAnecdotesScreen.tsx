import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const GestionAnecdotesScreen = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Gestion anecdotes</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    text: {
        fontSize: 20,
        fontWeight: 'bold',
    },
});

export default GestionAnecdotesScreen;