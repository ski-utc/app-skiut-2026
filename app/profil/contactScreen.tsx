import {  View, StyleSheet, FlatList, Text, TouchableOpacity } from "react-native";
import Header from "../../components/header";
import React from 'react';
import * as Linking from 'expo-linking';
import { Colors } from '@/constants/GraphSettings';
import BoutonRetour from "../../components/divers/boutonRetour";
import { Phone } from "lucide-react-native";

interface ContactInterface{
    name: string;
    phone: string;
}

// structure de données avec les nums  
const contacts: ContactInterface[] = [
{ name: "Juliette - Présidente", phone: "07 82 11 19 78" },
{ name: "Nicolas - Président", phone: "07 89 49 06 99" },
{ name: "Secours des deux Alpes", phone: "04 76 79 75 01"},
{ name: "Pompiers", phone: "18"},
{ name: "Gendarmes", phone: "17"},
];

export default function Contact() {
    // Fonction pour appeler un numéro
    const makeCall = (phoneNumber: string) => {
        Linking.openURL(`tel:${phoneNumber}`);
    };

    // Rendu d'un contact
    const renderItem = ({ item }: {item: ContactInterface}) => (
        <TouchableOpacity style={styles.phoneContainer} onPress={() => makeCall(item.phone)}>
        <View style={styles.icon}>
            <Phone size={20} color={Colors.gray}/>
        </View>        
        <View style={styles.phoneDetails}>
            <Text style={styles.phoneName}>{item.name}</Text>
            <Text style={styles.phoneNumber}>{item.phone}</Text>
        </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Header />
            <View style={styles.screencontainer}>
            <View style={{paddingHorizontal: 20}}>
                <BoutonRetour
                    previousRoute={"ProfilScreen"}
                    title={"Contact"}
                />
            </View>
                <FlatList
                    data={contacts}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.phoneListContainer}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        height: '100%',
        width: '100%',
        flex: 1,
        backgroundColor: 'white',
        paddingBottom: 8,  
    },
    screencontainer: {
        width: '100%',
        flex: 1,
        backgroundColor: Colors.white,
        paddingBottom: 16,
    },
    icon: {
        marginRight: 20, // Espacement entre l'icône et les détails
        justifyContent: "center",
        alignItems: "center",
      },
    phoneListContainer: {
        paddingHorizontal: 16,
    },
    phoneContainer: {
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: Colors.customGray, // Couleur grise claire pour la bordure
    },
    phoneDetails: {
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "flex-start",
    },
    phoneName: {
        color: Colors.black, // Noir pour le nom
        fontSize: 16,
        fontWeight: "600",
    },
    phoneNumber: {
        color: Colors.gray, // Gris pour le numéro
        fontSize: 14,
        fontWeight: "400",
        marginTop: 4,
    },
});