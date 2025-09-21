import { Text, View, ScrollView, ActivityIndicator } from "react-native";
import Header from "@/components/header";
import React, { useState, useEffect } from "react";
import { Colors, loadFonts } from '@/constants/GraphSettings';
import { Crown } from "lucide-react-native";
import BoutonRetour from '@/components/divers/boutonRetour';
import RectanglePodium from '@/components/vitesseDeGlisse/rectanglePodium';
import RectangleReste from '@/components/vitesseDeGlisse/rectangleReste';
import { apiGet } from '@/constants/api/apiCalls';
import ErrorScreen from "@/components/pages/errorPage";

export default function PerformancesScreen() {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState('');
    const [podium, setPodium] = useState([]); // Les données du podium
    const [rest, setRest] = useState([]); // Le reste des chambres
    const [disableRefresh, setDisableRefresh] = useState(false);

    useEffect(() => {
        fetchPerformances(); // Charger les données
        const loadAsyncFonts = async () => { // Charger les polices
            await loadFonts();
        };
        loadAsyncFonts();
    }, []);

    const fetchPerformances = async () => {
        setLoading(true);
        setDisableRefresh(true);
        try {
            const response = await apiGet("classement-performances");
            if (response.success) {
                setPodium(response.podium); // Mettre à jour le podium
                setRest(response.rest);
            } else {
                setError(response.message);
            }
        } catch (error : any) {
            if (error.message === 'NoRefreshTokenError' || error.JWT_ERROR) {
                setPodium([]);
                setRest([]);
            } else {
                setError(error.message);
            }
        } finally {
            setLoading(false);
            setTimeout(() => {
                setDisableRefresh(false);
            }, 5000);
        }
    };

    if (error !== '') {
        return <ErrorScreen error={error} />;
    }

    if (loading) {
        return (
            <View
                style={{
                    height: '100%',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Header refreshFunction={undefined} disableRefresh={undefined} />
                <View
                    style={{
                        width: '100%',
                        flex: 1,
                        backgroundColor: Colors.white,
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <ActivityIndicator size="large" color={Colors.gray} />
                </View>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: Colors.white }}>
            <Header refreshFunction={fetchPerformances} disableRefresh={disableRefresh} />
            <View style={styles.headerContainer}>
                <BoutonRetour previousRoute={"VitesseDeGlisseScreen"} title={"Performances"} />
            </View>

            {/* Podium Section */}
            <View style={styles.podiumContainer}>
                <Text style={styles.podiumTitle}>Classement général</Text>
                <View style={styles.podiumRow}>
                    {podium.length > 1 && (
                        <RectanglePodium
                            height={65}
                            nom={podium[1].full_name}
                            vitesse={podium[1].max_speed}
                            style={styles.podiumItem}
                        />
                    )}
                    {podium.length > 0 && (
                        <View style={styles.firstPlaceContainer}>
                            <RectanglePodium
                                height={100}
                                nom={podium[0].full_name}
                                vitesse={podium[0].max_speed}
                                style={styles.podiumItem}
                            />
                            <Crown size={40} color={'#ffbc44'} style={styles.crownStyle} />
                        </View>
                    )}
                    {podium.length > 2 && (
                        <RectanglePodium
                            height={30}
                            nom={podium[2].full_name}
                            vitesse={podium[2].max_speed}
                            style={styles.podiumItem}
                        />
                    )}
                </View>
            </View>

            {/* Remainder Section */}
            <ScrollView contentContainerStyle={styles.scrollViewContainer}>
                {Object.values(rest).map((person: any, index: number) => (
                    <RectangleReste
                        key={person.user_id}
                        number={index + 4}
                        nom={person.full_name}
                        vitesse={person.max_speed}
                        style={styles.remainderItem}
                    />
                ))}
            </ScrollView>
        </View>
    );
}

const styles = {
    headerContainer: {
        width: '100%',
        backgroundColor: Colors.white,
        paddingHorizontal: 20,
        paddingBottom: 8,
    },
    podiumContainer: {
        backgroundColor: Colors.orange,
        padding: 16,
        alignItems: 'center',
        height: 250,
    },
    podiumTitle: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 32,
    },
    podiumRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'flex-end',
        width: '100%',
        position: 'absolute',
        bottom: 0,
    },
    podiumItem: {
        marginHorizontal: 5,
    },
    firstPlaceContainer: {
        position: 'relative',
        alignItems: 'center',
    },
    crownStyle: {
        position: 'absolute',
        top: -45,
        zIndex: 1,
    },
    scrollViewContainer: {
        paddingHorizontal: 0,
        paddingVertical: 0,
    },
    remainderItem: {
        width: '100%',
    },
};
