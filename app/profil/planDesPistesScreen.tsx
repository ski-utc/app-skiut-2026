import { View, ScrollView } from "react-native";
import { Colors } from '@/constants/GraphSettings';
import Header from "../../components/header";
import React from 'react';
import BoutonRetour from "../../components/divers/boutonRetour";
import { Image } from "react-native";
import BoutonLien from "../../components/divers/boutonLien";
import { Link, Download } from 'lucide-react-native';
import BoutonTelecharger from "@/components/divers/boutonTelecharger";

export default function PlanDesPistes() {
    const pisteImage = "../../assets/images/plan-des-pistes-les-2-alpes-2025.jpg";
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
                <BoutonRetour previousRoute={"ProfilScreen"} title={"Plan des pistes"} />
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
                            source={require(pisteImage)} style={{
                            width: '100%',
                            height: '100%',
                        }} resizeMode="contain" />
                    </View>
                </ScrollView>
                <View style={{ marginBottom: 9 }}>
                    <BoutonLien
                        url="https://www.skipass-2alpes.com/fr/plan-des-pistes-live-les2alpes"
                        title="Voir les pistes en ligne"
                        IconComponent={Link}
                    />
                </View>
                <View style={{ marginBottom: 9 }}>
                    <BoutonLien
                        url="https://www.skipass-2alpes.com/fr/plan-des-pistes-live-les2alpes"
                        title="Webcam en live"
                        IconComponent={Link}
                    />
                </View>
                <View>
                    <BoutonTelecharger
                        url="https://www.skipass-2alpes.com/media/download/dalb2c/cms/media/PLANS/2025/2025-Plan_Hiver_les2alpes.pdf"
                        title="Télécharger le plan"
                        IconComponent={Download}
                    />
                </View>
            </View>
        </View>
    );
}
