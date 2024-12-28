import { Text, View, ScrollView } from "react-native";
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
        <View style={{ 
            flex: 1, 
            backgroundColor: Colors.white 
        }}>
            <Header />
            <View style={{ 
                width: '100%', 
                backgroundColor: Colors.white, 
                paddingHorizontal: 20, 
                paddingBottom: 16, 
                marginBottom: 12 
            }}>
                <BoutonRetour previousRoute={"VitesseDeGlisseScreen"} title={"Performances"} />
            </View>
            <View style={{ 
                backgroundColor: Colors.orange, 
                padding: 16, 
                alignItems: 'center', 
                position: 'relative', 
                height: 200 
            }}>
                <Text style={{ 
                    color: Colors.white, 
                    fontSize: 16, 
                    fontFamily: 'Inter', 
                    fontWeight: '600', 
                    textAlign: 'center', 
                    marginBottom: 16 
                }}>
                    Classement des performances
                </Text>
                <View style={{ 
                    flexDirection: 'row', 
                    justifyContent: 'center', 
                    alignItems: 'flex-end', 
                    width: '100%', 
                    position: 'absolute', 
                    bottom: 0 
                }}>
                    <RectanglePodium
                        height={65}
                        nom={podiumPersonnes[1].nom}
                        vitesse={podiumPersonnes[1].vitesse}
                        style={{ 
                            marginHorizontal: 5 
                        }}
                    />
                    <RectanglePodium
                        height={100}
                        nom={podiumPersonnes[0].nom}
                        vitesse={podiumPersonnes[0].vitesse}
                        style={{ 
                            marginHorizontal: 5 
                        }}
                    />
                    <RectanglePodium
                        height={30}
                        nom={podiumPersonnes[2].nom}
                        vitesse={podiumPersonnes[2].vitesse}
                        style={{ 
                            marginHorizontal: 5 
                        }}
                    />
                </View>
            </View>
            <ScrollView contentContainerStyle={{ 
                paddingBottom: 230 
            }} style={{ 
                flex: 1, 
                width: '100%' 
            }}>
                {restPersonnes.map((person, index) => (
                    <RectangleReste
                        key={index + 4}
                        bottom={134 - index * 50}
                        number={index + 4}
                        nom={person.nom}
                        vitesse={person.vitesse}
                        style={{ 
                            marginVertical: 10 
                        }}
                    />
                ))}
            </ScrollView>
        </View>
    );
}
