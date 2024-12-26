import { View, ScrollView } from "react-native";
import { Text } from "react-native";
import { Colors } from '@/constants/GraphSettings';
import Header from "../../components/header";
import React from 'react';
import BoutonRetour from "../../components/divers/boutonRetour";
import { Image } from "react-native";
import BoutonLien from "../../components/divers/boutonLien";
import { Link, Download } from 'lucide-react-native';
import BoutonTelecharger from "@/components/divers/boutonTelecharger";

export default function PlanStation() {
    const stationImage = "../../assets/images/plan-station-les-2-alpes-1480.jpg";
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
                <BoutonRetour previousRoute={"ProfilScreen"} title={"Plan de la station"} />
                <ScrollView 
                    contentContainerStyle={{
                        flexGrow: 1,
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                    }}>
                    <View style={{
                        width: '100%',
                        height: '100%',
                        marginBottom: 16,
                    }}>
                        <Image 
                            source={require(stationImage)} style={{
                            width: '100%',
                            height: '100%',
                        }} resizeMode="contain" />
                    </View>
                </ScrollView>
                <View style={{ marginBottom: 9 }}>
                    <BoutonLien
                        url="https://reservation.les2alpes.com/plan-station-2-alpes.html"
                        title="Voir la station en ligne"
                        IconComponent={Link}
                    />
                </View>
                <View>
                    <BoutonTelecharger
                        url="https://www.les2alpes.com/app/uploads/les-deux-alpes/2022/10/Les-2-Alpes-Plan-de-Station.pdf"
                        title="Télécharger le plan"
                        IconComponent={Download}
                    />
                </View>
            </View>
        </View>
    );
}
