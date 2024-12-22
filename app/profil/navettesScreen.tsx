import { View } from "react-native";
import { Colors } from '@/constants/GraphSettings';
import Header from "../../components/header";
import React from 'react';
import BoutonRetour from "../../components/divers/boutonRetour";
import NavettesTab from "../../components/navettes/navettesTab";

export default function NavettesScreen() {

    const navettes = {
        Aller: [
            {
                aller_ou_retour: "aller",
                depart: "Paris",
                destination: "Les 2 Alpes",
                heureDeDepart: "08:00",
                couleur: "red",
            },
            {
                aller_ou_retour: "aller",
                depart: "Compiègne",
                destination: "Les 2 Alpes",
                heureDeDepart: "09:30",
                couleur: "green",
            },
        ],
        Retour: [
            {
                aller_ou_retour: "retour",
                depart: "Les 2 Alpes",
                destination: "Paris",
                heureDeDepart: "11:00",
                couleur: "orange",
            },
        ],
    };

    return (
        <View
            style={{
                height: "100%",
                width: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <Header />
            <View style={{
                width: '100%',
                flex: 1,
                backgroundColor: Colors.white,
                paddingBottom: 16,
            }}>
                <View
                    style={{
                        paddingHorizontal: 20,
                    }}
                >
                    <BoutonRetour previousRoute={"ProfilScreen"} title={"Navettes"} />
                </View>
                <NavettesTab navettesMap={navettes} />
            </View>
        </View>
    );
}
