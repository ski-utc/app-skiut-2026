import { Text, View, ScrollView, ActivityIndicator, Alert } from "react-native";
import Header from "../../components/header";
import React, { useState, useEffect } from "react";
import { Colors, Fonts, loadFonts } from '@/constants/GraphSettings';
import { Crown } from "lucide-react-native";
import BoutonRetour from '@/components/divers/boutonRetour';
import RectanglePodium from '@/components/classement/rectanglePodium';
import RectangleReste from '@/components/classement/rectangleReste';
import { apiGet } from '@/constants/api/apiCalls';
import ErrorScreen from "@/components/pages/errorPage";

export default function DefisClassement() {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState('');
    const [podium, setPodium] = useState([]); // Les données du podium
    const [rest, setRest] = useState([]); // Le reste des chambres
    const [disableRefresh, setDisableRefresh] = useState(false);

    useEffect(() => {
        fetchClassement(); // Charger les données
        const loadAsyncFonts = async () => { // Charger les polices
            await loadFonts();
        };
        loadAsyncFonts();
    }, []);

    const fetchClassement = async () => {
        setLoading(true);
        setDisableRefresh(true);
        try {
            const response = await apiGet("classement-chambres");
            if (response.success) {
                setPodium(response.podium); // Mettre à jour le podium
                setRest(response.rest);
            } else {
                setError(response.message);
            }
        } catch (error) {
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

    if (error != '') {
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
                <Header />
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
            <Header refreshFunction={fetchClassement} disableRefresh={disableRefresh} />
            <View
                style={{
                    width: '100%',
                    backgroundColor: Colors.white,
                    paddingHorizontal: 20,
                    paddingBottom: 8,
                }}
            >
                <BoutonRetour previousRoute={"defisScreen"} title={"Classement"} />
            </View>

            {/* Rectangle orange avec le podium */}
            <View
                style={{
                    backgroundColor: Colors.orange,
                    padding: 16,
                    alignItems: 'center',
                    height: 250,
                }}
            >
                <Text
                    style={{
                        color: Colors.white,
                        fontSize: 16,
                        fontFamily: 'Inter',
                        fontWeight: '600',
                        textAlign: 'center',
                        marginBottom: 32,
                    }}
                >
                    Classement général
                </Text>
                <Crown size={40} color={'#ffbc44'} />
                <View
                    style={{
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'flex-end',
                        width: '100%',
                        position: 'absolute',
                        bottom: 0,
                    }}
                >
                    {podium.length > 1 && (
                        <RectanglePodium
                            height={65}
                            num={podium[1].roomNumber}
                            nb_likes={podium[1].totalPoints}
                            style={{ marginHorizontal: 5 }}
                        />
                    )}
                    {podium.length > 0 && (
                        <RectanglePodium
                            height={100}
                            num={podium[0].roomNumber}
                            nb_likes={podium[0].totalPoints}
                            style={{ marginHorizontal: 5 }}
                        />
                    )}
                    {podium.length > 2 && (
                        <RectanglePodium
                            height={30}
                            num={podium[2].roomNumber}
                            nb_likes={podium[2].totalPoints}
                            style={{ marginHorizontal: 5 }}
                        />
                    )}
                </View>
            </View>

            {/* ScrollView avec le reste des chambres */}
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
                {Object.values(rest).map((room: any, index: number) => (
                    <RectangleReste
                        key={room.roomNumber}
                        bottom={55 - index * 50}
                        number={index + 4}
                        num={room.roomNumber}
                        nb_likes={room.totalPoints}
                        style={{ marginVertical: 10 }}
                    />
                ))}
            </ScrollView>
        </View>
    );
}