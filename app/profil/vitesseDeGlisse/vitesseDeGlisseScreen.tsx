import { View } from "react-native";
import Header from "../../../components/header";
import React from 'react';
import BoutonRetour from "../../../components/divers/boutonRetour";
import { Colors } from '@/constants/GraphSettings';
import { Gauge, Trophy } from 'lucide-react';
import StatWidget from "../../../components/vitesseDeGlisse/statWidget";
import BoutonLancer from "../../../components/vitesseDeGlisse/boutonLancer";
import BoutonNavigation from "@/components/divers/boutonNavigation";

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
                        height: '95%',
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
                        topText="Distance"
                        bottomText="-- km"
                        topTextPosition={{ top: 16, left: 235 }}
                        bottomTextPosition={{ top: 36, left: 225 }}
                    />
                    <View
                        style={{
                            top: 130,
                            width: 80,
                            height: 80,
                            borderRadius: 40,
                            backgroundColor: Colors.white,
                            justifyContent: 'center',
                            alignItems: 'center',
                            alignSelf: 'center',
                            marginTop: 16,
                        }}
                    >
                        <Gauge color={Colors.orange} size={40} />
                    </View>
                    <View style={{ position: 'absolute', bottom: 15, flexDirection: 'column', justifyContent: 'space-between', width: '90%', alignSelf: 'center' }}>
                        <View style={{ marginBottom: 8 }}>
                            <BoutonLancer title="Lancer"/>
                        </View>
                        <View style={{ marginBottom: 8 }}>
                            <BoutonNavigation nextRoute={"ProfilScreen"} title="Performances" IconComponent={Trophy}/>
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );
}
