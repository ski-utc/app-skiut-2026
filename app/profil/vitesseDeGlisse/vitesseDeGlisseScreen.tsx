import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Alert, TouchableOpacity, ScrollView } from "react-native";
import { useNavigation } from '@react-navigation/native';
import Header from "../../../components/header";
import BoutonRetour from "../../../components/divers/boutonRetour";
import { Colors, TextStyles, loadFonts } from "@/constants/GraphSettings";
import { Trophy, Play, Square, Zap, MapPin, Timer } from "lucide-react-native";
import * as Location from "expo-location";
import { apiPost } from "@/constants/api/apiCalls";
import { useUser } from "@/contexts/UserContext";
import Toast from 'react-native-toast-message';

export default function VitesseDeGlisseScreen() {
    const [isTracking, setIsTracking] = useState(false);
    const [distance, setDistance] = useState(0);
    const [trackingTimer, setTrackingTimer] = useState<number | null>(null);
    const [maxSpeed, setMaxSpeed] = useState(0);
    const [prevLocation, setPrevLocation] = useState<Location.LocationObjectCoords | null>(null);
    const [subscription, setSubscription] = useState<Location.LocationSubscription | null>(null);
    const [trackingTime, setTrackingTime] = useState(0);

    const { user } = useUser();
    const navigation = useNavigation();

    useEffect(() => {
        const loadAsyncFonts = async () => {
            await loadFonts();
        };
        loadAsyncFonts();
    }, []);

    useEffect(() => {
        return () => {
            if (subscription) subscription.remove();
        };
    }, [subscription]);

    useEffect(() => {
        let interval = null;
        if (isTracking) {
            interval = setInterval(() => {
                setTrackingTime(time => time + 1);
            }, 1000);
        } else {
            setTrackingTime(0);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isTracking]);

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

                    const currentSpeed = (coords.speed || 0) * 3.6;

                    if (deltaDistance <= 100 && currentSpeed <= 150) {
                        setDistance((prev) => prev + deltaDistance);
                    }

                    setMaxSpeed((prevMaxSpeed) =>
                        currentSpeed > prevMaxSpeed ? currentSpeed : prevMaxSpeed
                    );
                }

                setPrevLocation(coords);
            }
        );

        setSubscription(locationSubscription);

        const timer = setTimeout(() => {
            stopTracking();
        }, 2 * 60 * 1000);

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
        } catch (error: any) {
            const errorMessage = error?.message || "Erreur inconnue";
            Alert.alert("Erreur", `Impossible d'enregistrer la performance : ${errorMessage}`);
        }

        setDistance(0);
        setMaxSpeed(0);
        setPrevLocation(null);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const StatCard = ({ icon: IconComponent, title, value, unit, color = Colors.primary }: {
        icon: any;
        title: string;
        value: string;
        unit: string;
        color?: string;
    }) => (
        <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: color }]}>
                <IconComponent size={24} color={Colors.white} />
            </View>
            <View style={styles.statContent}>
                <Text style={styles.statTitle}>{title}</Text>
                <View style={styles.statValueContainer}>
                    <Text style={styles.statValue}>{value}</Text>
                    <Text style={styles.statUnit}>{unit}</Text>
                </View>
            </View>
        </View>
    );

    const ActionButton = ({ onPress, title, icon: IconComponent, variant = 'primary', disabled = false }: {
        onPress: () => void;
        title: string;
        icon: any;
        variant?: 'primary' | 'secondary';
        disabled?: boolean;
    }) => (
        <TouchableOpacity
            style={[
                styles.actionButton,
                variant === 'secondary' && styles.actionButtonSecondary,
                disabled && styles.actionButtonDisabled
            ]}
            onPress={onPress}
            activeOpacity={0.7}
            disabled={disabled}
        >
            <View style={[styles.actionButtonIcon, variant === 'secondary' && styles.actionButtonIconSecondary]}>
                <IconComponent size={20} color={variant === 'primary' ? Colors.primary : Colors.primaryBorder} />
            </View>
            <Text style={[styles.actionButtonText, variant === 'secondary' && styles.actionButtonTextSecondary]}>
                {title}
            </Text>
        </TouchableOpacity>
    );

    const getDistanceFromLatLonInMeters = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371e3;
        const toRad = (value: number) => (value * Math.PI) / 180;
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
            <Header refreshFunction={null} disableRefresh={null} />
            <View style={styles.headerContainer}>
                <BoutonRetour previousRoute={"homeNavigator"} title={"Vitesse de glisse"} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.heroSection}>
                    <View style={styles.heroIcon}>
                        <Zap size={32} color={Colors.primary} />
                    </View>
                    <Text style={styles.heroTitle}>Enregistre ta performance</Text>
                </View>

                <View style={styles.statsSection}>
                    <StatCard
                        icon={Zap}
                        title="Vitesse maximale"
                        value={maxSpeed.toFixed(1)}
                        unit="km/h"
                        color={Colors.primary}
                    />

                    <StatCard
                        icon={MapPin}
                        title="Distance parcourue"
                        value={(distance / 1000).toFixed(2)}
                        unit="km"
                        color={Colors.primaryBorder}
                    />

                    <StatCard
                        icon={Timer}
                        title="Temps d'enregistrement"
                        value={formatTime(trackingTime)}
                        unit="min"
                        color={Colors.accent}
                    />
                </View>

                <View style={styles.controlsSection}>
                    <Text style={styles.sectionTitle}>Contrôles</Text>

                    <ActionButton
                        title={isTracking ? "Arrêter l'enregistrement" : "Démarrer l'enregistrement"}
                        icon={isTracking ? Square : Play}
                        onPress={isTracking ? stopTracking : startTracking}
                        variant="primary"
                    />

                    <ActionButton
                        title="Voir mes performances"
                        icon={Trophy}
                        onPress={() => {
                            (navigation as any).navigate('PerformancesScreen');
                        }}
                        variant="secondary"
                    />
                </View>

                {isTracking && (
                    <View style={styles.infoSection}>
                        <View style={styles.infoCard}>
                            <Text style={styles.infoTitle}>📱 Enregistrement en cours</Text>
                            <Text style={styles.infoText}>
                                L'enregistrement s'arrêtera automatiquement après 2 minutes ou lorsque vous appuyez sur "Arrêter".
                            </Text>
                        </View>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.white,
    },
    headerContainer: {
        width: '100%',
        paddingHorizontal: 20,
        paddingBottom: 8,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    heroSection: {
        alignItems: 'center',
        paddingVertical: 24,
        marginBottom: 16,
    },
    heroIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: Colors.lightMuted,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    heroTitle: {
        ...TextStyles.h2,
        color: Colors.primaryBorder,
        fontWeight: '700',
        textAlign: 'center',
    },
    statsSection: {
        marginBottom: 24,
    },
    statCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.06)',
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowOffset: { width: 2, height: 3 },
        shadowRadius: 5,
        elevation: 3,
        padding: 16,
        marginBottom: 12,
    },
    statIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    statContent: {
        flex: 1,
    },
    statTitle: {
        ...TextStyles.body,
        color: Colors.muted,
        marginBottom: 4,
    },
    statValueContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    statValue: {
        ...TextStyles.h3,
        color: Colors.primaryBorder,
        fontWeight: '700',
        marginRight: 4,
    },
    statUnit: {
        ...TextStyles.body,
        color: Colors.primary,
        fontWeight: '600',
    },
    controlsSection: {
        marginBottom: 24,
    },
    sectionTitle: {
        ...TextStyles.h3,
        color: Colors.primaryBorder,
        fontWeight: '700',
        marginBottom: 16,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.primary,
        borderRadius: 12,
        paddingVertical: 16,
        paddingHorizontal: 20,
        marginBottom: 12,
    },
    actionButtonSecondary: {
        backgroundColor: Colors.white,
        borderWidth: 2,
        borderColor: Colors.primaryBorder,
    },
    actionButtonDisabled: {
        opacity: 0.6,
    },
    actionButtonIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    actionButtonIconSecondary: {
        backgroundColor: Colors.lightMuted,
    },
    actionButtonText: {
        ...TextStyles.button,
        color: Colors.white,
        fontWeight: '600',
        flex: 1,
    },
    actionButtonTextSecondary: {
        color: Colors.primaryBorder,
    },
    infoSection: {
        marginBottom: 24,
    },
    infoCard: {
        backgroundColor: Colors.lightMuted,
        borderRadius: 12,
        padding: 16,
        borderLeftWidth: 4,
        borderLeftColor: Colors.primary,
    },
    infoTitle: {
        ...TextStyles.body,
        color: Colors.primaryBorder,
        fontWeight: '600',
        marginBottom: 8,
    },
    infoText: {
        ...TextStyles.small,
        color: Colors.muted,
        lineHeight: 20,
    },
});