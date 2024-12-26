import { Text, View, ScrollView, StyleSheet } from "react-native";
import Header from "../../../components/header";
import React from 'react';
import { Colors } from '@/constants/GraphSettings';
import BoutonRetour from '@/components/divers/boutonRetour';
import RectanglePodium from '@/components/vitesseDeGlisse/rectanglePodium';
import RectangleReste from '@/components/vitesseDeGlisse/rectangleReste';

const personnes = [
    { nom: "Karl", vitesse: 34 },
    { nom: "Mathis", vitesse: 64 },
    { nom: "Eric", vitesse: 81 },
    { nom: "Zelda", vitesse: 30 },
    { nom: "Louise", vitesse: 39 },
    { nom: "Mathis", vitesse: 123 },
    { nom: "Roger", vitesse: 27 },
    { nom: "Mathilde", vitesse: 48 },
];

const sortedPersonnes = personnes.sort((a, b) => b.vitesse - a.vitesse);
const podiumPersonnes = sortedPersonnes.slice(0, 3);
const restPersonnes = sortedPersonnes.slice(3);

export default function PerformancesScreen() {
    return (
        <View style={styles.container}>
            <Header />
            <View style={styles.content}>
                <BoutonRetour previousRoute={"VitesseDeGlisseScreen"} title={"Performances"} />
            </View>
            <View style={styles.orangeBackground} />
            <View style={styles.generalRanking}>
                <View style={styles.generalRankingInner}>
                    <Text style={styles.generalRankingText}>Classement des performances</Text>
                </View>
            </View>
            <View style={styles.podiumContainer}>
                <RectanglePodium
                    key={1}
                    height={65}
                    nom={podiumPersonnes[1].nom}
                    vitesse={podiumPersonnes[1].vitesse}
                    style={styles.podiumItem}
                />
                <RectanglePodium
                    key={2}
                    height={100}
                    nom={podiumPersonnes[0].nom}
                    vitesse={podiumPersonnes[0].vitesse}
                    style={styles.podiumItem}
                />
                <RectanglePodium
                    key={3}
                    height={30}
                    nom={podiumPersonnes[2].nom}
                    vitesse={podiumPersonnes[2].vitesse}
                    style={styles.podiumItem}
                />
            </View>
            <ScrollView contentContainerStyle={styles.scrollViewContent} style={styles.scrollView}>
                {restPersonnes.map((person, index) => (
                    <RectangleReste
                        key={index + 4}
                        bottom={134 - index * 50}
                        number={index + 4}
                        nom={person.nom}
                        vitesse={person.vitesse}
                        style={styles.resteItem}
                    />
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.white,
    },
    content: {
        width: '100%',
        flex: 1,
        backgroundColor: Colors.white,
        paddingHorizontal: 20,
        paddingBottom: 16,
    },
    orangeBackground: {
        position: 'absolute',
        top: 135,
        left: 0,
        right: 0,
        height: 200,
        marginTop: 8,
        backgroundColor: Colors.orange,
    },
    generalRanking: {
        position: 'absolute',
        width: 343,
        top: 153,
        left: '50%',
        transform: [{ translateX: -171.5 }],
        height: 31,
        borderRadius: 12,
        backgroundColor: Colors.lightOrange,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 4,
    },
    generalRankingInner: {
        flex: 1,
        width: '100%',
        height: '100%',
        backgroundColor: Colors.white,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        paddingLeft: 10,
        paddingRight: 10,
        paddingTop: 8,
        paddingBottom: 8,
    },
    generalRankingText: {
        color: Colors.orange,
        fontSize: 12,
        fontFamily: 'Inter',
        fontWeight: '400',
        textAlign: 'center',
    },
    podiumContainer: {
        position: 'absolute',
        bottom: 233,
        left: '50%',
        transform: [{ translateX: -150 }],
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'flex-end',
        width: 300,
    },
    podiumItem: {
        marginHorizontal: 5,
    },
    scrollViewContent: {
        paddingBottom: 230,
        paddingTop: 0,
    },
    scrollView: {
        position: 'absolute',
        top: 350,
        left: 0,
        right: 0,
    },
    resteItem: {
        marginVertical: 10,
    },
});