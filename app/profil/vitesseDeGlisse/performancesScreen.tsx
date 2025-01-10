import React, { useState, useEffect } from "react";
import { Text, View, ScrollView, ActivityIndicator } from "react-native";
import Header from "../../../components/header";
import BoutonRetour from "@/components/divers/boutonRetour";
import RectanglePodium from "@/components/vitesseDeGlisse/rectanglePodium";
import RectangleReste from "@/components/vitesseDeGlisse/rectangleReste";
import { Colors, loadFonts } from "@/constants/GraphSettings";
import { apiGet } from "@/constants/api/apiCalls";
import ErrorScreen from "@/components/pages/errorPage";

export default function PerformancesScreen() {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [podium, setPodium] = useState<any[]>([]); // Les données du podium
    const [rest, setRest] = useState<any[]>([]); // Les performances restantes

    useEffect(() => {
        fetchPerformances();
        const loadAsyncFonts = async () => {
            await loadFonts();
        };
        loadAsyncFonts();
    }, []);

    const fetchPerformances = async () => {
        setLoading(true);
        try {
            const response = await apiGet("classement-performances");
            if (response.success) {
                setPodium(response.podium);
                setRest(Object.values(response.rest));
            } else {
                setError(response.message);
            }
        } catch (error: any) {
            setError(error.message || "Erreur inattendue");
        } finally {
            setLoading(false);
        }
    };

    if (error) {
        return <ErrorScreen error={error} />;
    }

    if (loading) {
        return (
            <View
                style={{
                    height: "100%",
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: Colors.white,
                }}
            >
                <Header refreshFunction={undefined} disableRefresh={undefined} />
                <ActivityIndicator size="large" color={Colors.gray} />
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: Colors.white }}>
            <Header refreshFunction={fetchPerformances} disableRefresh={false} />
            <View
                style={{
                    width: "100%",
                    backgroundColor: Colors.white,
                    paddingHorizontal: 20,
                    paddingBottom: 16,
                    marginBottom: 12,
                }}
            >
                <BoutonRetour previousRoute={"VitesseDeGlisseScreen"} title={"Performances"} />
            </View>

            {/* Rectangle orange avec le podium */}
            <View
                style={{
                    backgroundColor: Colors.orange,
                    padding: 16,
                    alignItems: "center",
                    marginTop: 16,
                    height: 200,
                }}
            >
                <Text
                    style={{
                        color: Colors.white,
                        fontSize: 16,
                        fontFamily: "Inter",
                        fontWeight: "600",
                        textAlign: "center",
                        marginBottom: 16,
                    }}
                >
                    Classement des performances
                </Text>
                <View
                    style={{
                        flexDirection: "row",
                        justifyContent: "center",
                        alignItems: "flex-end",
                        width: "100%",
                        position: "absolute",
                        bottom: 0,
                    }}
                >
                    {podium.length > 1 && (
                        <RectanglePodium
                            height={65}
                            nom={podium[1]?.full_name}
                            vitesse={podium[1].max_speed}
                            style={{ marginHorizontal: 5 }}
                        />
                    )}
                    {podium.length > 0 && (
                        <RectanglePodium
                            height={100}
                            nom={podium[0]?.full_name}
                            vitesse={podium[0].max_speed}
                            style={{ marginHorizontal: 5 }}
                        />
                    )}
                    {podium.length > 2 && (
                        <RectanglePodium
                            height={30}
                            nom={podium[2]?.full_name}
                            vitesse={podium[2].max_speed}
                            style={{ marginHorizontal: 5 }}
                        />
                    )}
                </View>
            </View>

            {/* ScrollView avec le reste des performances */}
            <ScrollView
                style={{
                    flex: 1,
                    backgroundColor: Colors.white,
                }}
                contentContainerStyle={{
                    paddingHorizontal: 20,
                    paddingVertical: 16,
                    paddingBottom: 100,
                }}
            >
                {rest.map((person: any, index: number) => (
                    <RectangleReste
                        key={person.user_id}
                        bottom={55 - index * 50}
                        number={index + 4}
                        nom={person.full_name}
                        vitesse={person.max_speed}
                        style={{ marginVertical: 10 }}
                    />
                ))}
            </ScrollView>
        </View>
    );
}