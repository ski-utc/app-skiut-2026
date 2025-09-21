import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Alert, TouchableOpacity } from "react-native";
import Header from "../../../components/header";
import BoutonRetour from "../../../components/divers/boutonRetour";
import { Colors } from "@/constants/GraphSettings";
import { Trophy } from "lucide-react-native";
import StatWidget from "../../../components/vitesseDeGlisse/statWidget";
import BoutonNavigation from "@/components/divers/boutonNavigation";
import * as Location from "expo-location";
import { apiPost } from "@/constants/api/apiCalls";
import { useUser } from "@/contexts/UserContext";
import Toast from 'react-native-toast-message';

export default function VitesseDeGlisseScreen() {
    const [isTracking, setIsTracking] = useState(false);
    const [distance, setDistance] = useState(0);
    const [trackingTimer, setTrackingTimer] = useState(null);
    const [, setSpeed] = useState(0);
    const [maxSpeed, setMaxSpeed] = useState(0); // Pour suivre la vitesse maximale atteinte
    const [prevLocation, setPrevLocation] = useState(null);
    const [subscription, setSubscription] = useState(null);

    const { user } = useUser();

    useEffect(() => {
        return () => {
            if (subscription) subscription.remove();
        };
    }, [subscription]);

    const startTracking = async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
            Alert.alert(
                "Permission refusée",
                "L'application a besoin de l'accès à votre localisation pour suivre vos mouvements."
            );
            return;
        }

        setIsTracking(true);
        setDistance(0);
        setSpeed(0);
        setMaxSpeed(0);
        setPrevLocation(null);

        const locationSubscription = await Location.watchPositionAsync(
            {
                accuracy: Location.Accuracy.Highest,
                timeInterval: 1000,
                distanceInterval: 1,
            },
            (location) => {
                const { coords } = location;
                if (prevLocation) {
                    const deltaDistance = getDistanceFromLatLonInMeters(
                        prevLocation.latitude,
                        prevLocation.longitude,
                        coords.latitude,
                        coords.longitude
                    );

                    const currentSpeed = coords.speed * 3.6; // Convert speed from m/s to km/h

                    if (deltaDistance <= 100 && currentSpeed <= 150) {
                        setDistance((prev) => prev + deltaDistance);
                    }

                    setSpeed(currentSpeed);
                    setMaxSpeed((prevMaxSpeed) =>
                        currentSpeed > prevMaxSpeed ? currentSpeed : prevMaxSpeed
                    );
                }

                setPrevLocation(coords);
            }
        );

        setSubscription(locationSubscription);

        // Définir un timer pour arrêter automatiquement l'enregistrement après 2 minutes
        const timer = setTimeout(() => {
            stopTracking();
        }, 2 * 60 * 1000); // 2 minutes en millisecondes

        setTrackingTimer(timer);
    };

    const stopTracking = async () => {
        setIsTracking(false);
        if (subscription) {
            subscription.remove();
            setSubscription(null);
        }

        if (trackingTimer) {
            clearTimeout(trackingTimer);
            setTrackingTimer(null);
        }

        try {
            const response = await apiPost("update-performance", {
                user_id: user?.id,
                speed: maxSpeed,
                distance: distance / 1000,
            });

            if (response.success) {
                Toast.show({
                    type: 'success',
                    text1: 'Succès',
                    text2: "Votre performance a été enregistrée !",
                  });
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Erreur',
                    text2: "Une erreur est survenue lors de l'enregistrement.",
                  });
            }
        } catch (error : any) {
            const errorMessage = error?.message || "Erreur inconnue";
            Alert.alert("Erreur", `Impossible d'enregistrer la performance : ${errorMessage}`);
        }

        setDistance(0);
        setSpeed(0);
        setMaxSpeed(0);
        setPrevLocation(null);
    };

    const getDistanceFromLatLonInMeters = (lat1, lon1, lat2, lon2) => {
        const R = 6371e3;
        const toRad = (value) => (value * Math.PI) / 180;
        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) *
            Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    return (
        <View style={styles.container}>
            <Header refreshFunction={undefined} disableRefresh={undefined} />
            <View style={styles.innerContainer}>
                <BoutonRetour previousRoute={"ProfilScreen"} title={"Vitesse de glisse"} />
                <View style={styles.card}>
                    {/* Titre en haut */}
                    <Text style={styles.title}>Enregistre ta perf!</Text>

                    {/* Conteneur pour Vitesse Max */}
                    <View style={styles.statWidgetContainer}>
                        <StatWidget
                            topText="Vitesse max"
                            bottomText={`${maxSpeed.toFixed(2)} km/h`}
                        />
                    </View>

                    {/* Conteneur pour Distance */}
                    <View style={styles.statWidgetContainer}>
                        <StatWidget
                            topText="Distance"
                            bottomText={`${(distance / 1000).toFixed(2)} km`}
                        />
                    </View>

                    {/* Boutons */}
                    <View style={styles.buttonsContainer}>
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={isTracking ? stopTracking : startTracking}
                        >
                            <Text style={styles.buttonText}>
                                {isTracking ? "Arrêter" : "Lancer"}
                            </Text>
                        </TouchableOpacity>
                        <View style={styles.navigationButton}>
                            <BoutonNavigation
                                nextRoute={"PerformancesScreen"}
                                title="Performances"
                                IconComponent={Trophy}
                            />
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        height: "100%",
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
    },
    innerContainer: {
        width: "100%",
        flex: 1,
        backgroundColor: Colors.white,
        paddingHorizontal: 20,
        paddingBottom: 16,
    },
    card: {
        width: "100%",
        height: "95%",
        marginBottom: 16,
        backgroundColor: Colors.orange,
        borderRadius: 12,
        padding: 16,
    },
    title: {
        color: Colors.white,
        top: 10,
        fontSize: 24, // Taille du texte
        fontWeight: "bold", // Texte en gras
        textAlign: "center", // Centrer horizontalement
        marginBottom: 20, // Espace sous le titre
    },
    statWidgetContainer: {
        top: 40,
        marginBottom: 40, // Espacement entre les widgets
        alignItems: "center", // Centrage horizontal
    },
    buttonsContainer: {
        position: "absolute",
        bottom: 15,
        width: "90%",
        alignSelf: "center",
    },
    actionButton: {
        height: 50,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 8,
        marginBottom: 8,
        backgroundColor: Colors.customWhite,
    },
    buttonText: {
        color: Colors.orange,
        fontSize: 16,
        fontWeight: "bold",
    },
    navigationButton: {
        marginBottom: 8,
        borderWidth: 2,
        borderColor: Colors.white,
        borderRadius: 8,
    },
});