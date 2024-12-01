import { View, StyleSheet } from "react-native";
import { Text } from "react-native";
import Header from "../../components/header";
import React from 'react';

export default function Contact() {
    return (
        <View style={styles.container}>
            <Header  />
            <View style={styles.headerContainer}>
                <Text>Faire la page stopVss ici</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "white",
        paddingBottom: 8,
    },
    headerContainer: {
        width: '100%',
        flex: 1,
        backgroundColor: 'white',
        paddingHorizontal: 20,
        paddingBottom: 16,
    },
});