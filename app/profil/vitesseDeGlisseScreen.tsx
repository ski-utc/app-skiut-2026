import { View } from "react-native";
import Header from "../../components/header";
import React from 'react';
import BoutonRetour from "../../components/divers/boutonRetour";
import { Colors } from '@/constants/GraphSettings';
import StatWidget from "../../components/vitesseDeGlisse/statWidget";

export default function VitesseDeGlisseScreen() {
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
                paddingHorizontal: 20,
                paddingBottom: 16,
            }}>
                <BoutonRetour previousRoute={"ProfilScreen"} title={"Vitesse de glisse"} />
                <View
                    style={{
                        width: 350,
                        height: 420,
                        marginBottom: 16,
                        alignSelf: 'center',
                        backgroundColor: Colors.orange,
                        borderRadius: 12,
                        padding: 16,
                    }}>
                    <StatWidget
                        topText="Vitesse max"
                        bottomText="--:-- km/h"
                        topTextPosition={{ top: 16, left: 46 }}
                        bottomTextPosition={{ top: 36, left: 26 }}
                    />
                    <StatWidget
                        topText="Vitesse"
                        bottomText="-- km"
                        topTextPosition={{ top: 16, left: 235 }}
                        bottomTextPosition={{ top: 36, left: 225 }}
                    />
                </View>
            </View>
        </View>
    );
}
