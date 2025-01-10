import React, { useState, useEffect } from "react";
import { View, Text, Button, StyleSheet, Alert, TouchableOpacity } from "react-native";
import Header from "../../../components/header";
import BoutonRetour from "../../../components/divers/boutonRetour";
import { Colors } from '@/constants/GraphSettings';
import { Gauge, Trophy } from 'lucide-react-native';
import StatWidget from "../../../components/vitesseDeGlisse/statWidget";
import BoutonNavigation from "@/components/divers/boutonNavigation";
import * as Location from "expo-location";

export default function VitesseDeGlisseScreen() {
    const [isTracking, setIsTracking] = useState(false);
    const [distance, setDistance] = useState(0);
    const [speed, setSpeed] = useState(0);
    const [prevLocation, setPrevLocation] = useState(null);
    const [subscription, setSubscription] = useState(null);

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
                    setDistance((prev) => prev + deltaDistance);
                }
                setSpeed(coords.speed * 3.6); // Convert speed from m/s to km/h
                setPrevLocation(coords);
            }
        );

        setSubscription(locationSubscription);
    };

    const stopTracking = () => {
        setIsTracking(false);
        if (subscription) {
            subscription.remove();
            setSubscription(null);
        }
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
                    <StatWidget
                        topText="Vitesse max"
                        bottomText={`${speed.toFixed(2)} km/h`}
                        topTextPosition={{ top: 16, left: 46 }}
                        bottomTextPosition={{ top: 36, left: 26 }}
                    />
                    <StatWidget
                        topText="Distance"
                        bottomText={`${distance.toFixed(2)} m`}
                        topTextPosition={{ top: 16, left: 235 }}
                        bottomTextPosition={{ top: 36, left: 225 }}
                    />
                    <View style={styles.gaugeContainer}>
                        <Gauge color={Colors.orange} size={40} />
                    </View>
                    <View style={styles.buttonsContainer}>
                        <TouchableOpacity
                            style={[
                                styles.actionButton,
                                { backgroundColor: isTracking ? Colors.red : Colors.green },
                            ]}
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
        display: "flex",
        flexDirection: "column",
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
        alignSelf: "center",
        backgroundColor: Colors.orange,
        borderRadius: 12,
        padding: 16,
    },
    gaugeContainer: {
        top: 130,
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: Colors.white,
        justifyContent: "center",
        alignItems: "center",
        alignSelf: "center",
        marginTop: 16,
    },
    buttonsContainer: {
        position: "absolute",
        bottom: 15,
        flexDirection: "column",
        justifyContent: "space-between",
        width: "90%",
        alignSelf: "center",
    },
    actionButton: {
        height: 50,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 8,
        marginBottom: 8,
    },
    buttonText: {
        color: Colors.white,
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