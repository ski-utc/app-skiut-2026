import {  View, StyleSheet, FlatList, Text, TouchableOpacity } from "react-native";
import Header from "../../components/header";
import React from 'react';
import * as Linking from 'expo-linking';
import { Colors, Fonts } from '@/constants/GraphSettings';
import BoutonRetour from "../../components/divers/boutonRetour";
import { PhoneCall } from "lucide-react-native";

// pour définir les types de contact
interface Contact{
    name: string;
    phone: string;
}

// structure de données avec les nums  
const contacts: Contact[] = [
{ name: "Téléphone VSS", phone: "00 00 00 00 00" },
];

export default function Contact() {
    // Fonction pour appeler un numéro
    const makeCall = (phoneNumber: string) => {
        Linking.openURL(`tel:${phoneNumber}`);
    };

    // Rendu d'un contact
    const renderItem = ({ item }: {item: Contact}) => (
        <TouchableOpacity style={styles.phoneContainer} onPress={() => makeCall(item.phone)}>
        <View style={styles.icon}>
            <PhoneCall size={20} color={Colors.gray}/>
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
                        title={"Stop VSS"}
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
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",      
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