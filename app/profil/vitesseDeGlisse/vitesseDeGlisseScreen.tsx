import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, Alert, TouchableOpacity, ScrollView, AppState, Platform } from "react-native";
import { useNavigation } from '@react-navigation/native';
import Header from "../../../components/header";
import BoutonRetour from "../../../components/divers/boutonRetour";
import { Colors, TextStyles } from '@/constants/GraphSettings';
import { Trophy, Play, Square, Zap, MapPin, Timer, Gauge, Activity, TrendingUp } from "lucide-react-native";
import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import { apiPost } from "@/constants/api/apiCalls";
import { useUser } from "@/contexts/UserContext";
import Toast from 'react-native-toast-message';

const LOCATION_TASK_NAME = 'background-location-task';

// Tâche en arrière-plan pour la géolocalisation
TaskManager.defineTask(LOCATION_TASK_NAME, ({ data, error }) => {
    if (error) {
        console.error('Erreur dans la tâche de localisation:', error);
        return;
    }
    if (data) {
        const { locations } = data as any;
        console.log('Localisation reçue en arrière-plan:', locations);
    }
});

export default function VitesseDeGlisseScreen() {
    const [isTracking, setIsTracking] = useState(false);
    const [distance, setDistance] = useState(0);
    const [maxSpeed, setMaxSpeed] = useState(0);
    const [averageSpeed, setAverageSpeed] = useState(0);
    const [currentSpeed, setCurrentSpeed] = useState(0);
    const [prevLocation, setPrevLocation] = useState<Location.LocationObjectCoords | null>(null);
    const [subscription, setSubscription] = useState<Location.LocationSubscription | null>(null);
    const [trackingTime, setTrackingTime] = useState(0);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [speedHistory, setSpeedHistory] = useState<number[]>([]);

    // Statistiques de session
    const [sessionStats, setSessionStats] = useState({
        startTime: 0,
        totalSpeed: 0,
        speedReadings: 0,
        validReadings: 0
    });

    const { user, setUser } = useUser();
    const navigation = useNavigation();
    const appState = useRef(AppState.currentState);
    const trackingInterval = useRef<NodeJS.Timeout | null>(null);

    // Nettoyer lors du démontage
    useEffect(() => {
        return () => {
            if (subscription) subscription.remove();
            if (trackingInterval.current) clearInterval(trackingInterval.current);
        };
    }, [subscription]);

    // Gérer les changements d'état de l'app (arrière-plan)
    useEffect(() => {
        const subscription = AppState.addEventListener('change', (nextAppState) => {
            if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
                console.log('App revenue au premier plan');
            } else if (appState.current === 'active' && nextAppState.match(/inactive|background/)) {
                console.log('App passée en arrière-plan');
                if (isTracking) {
                    // Continuer le tracking en arrière-plan
                    enableBackgroundLocation();
                }
            }
            appState.current = nextAppState;
        });

        return () => subscription?.remove();
    }, [isTracking]);

    // Timer pour le temps de tracking
    useEffect(() => {
        if (isTracking) {
            trackingInterval.current = setInterval(() => {
                setTrackingTime(time => time + 1);
            }, 1000);
        } else {
            if (trackingInterval.current) {
                clearInterval(trackingInterval.current);
                trackingInterval.current = null;
            }
            setTrackingTime(0);
        }
        return () => {
            if (trackingInterval.current) clearInterval(trackingInterval.current);
        };
    }, [isTracking]);

    // Activer la géolocalisation en arrière-plan
    const enableBackgroundLocation = async () => {
        try {
            if (Platform.OS === 'ios') {
                const backgroundPermission = await Location.requestBackgroundPermissionsAsync();
                if (backgroundPermission.status !== 'granted') {
                    console.log('Permission arrière-plan refusée sur iOS');
                    return;
                }
            }

            await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
                accuracy: Location.Accuracy.Highest,
                timeInterval: 2000,
                distanceInterval: 5,
                showsBackgroundLocationIndicator: Platform.OS === 'ios',
            });
        } catch (error) {
            console.error('Erreur lors de l\'activation de la géolocalisation en arrière-plan:', error);
        }
    };

    const startTracking = async () => {
        // Demander les permissions de localisation
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
            Alert.alert(
                "Permission refusée",
                "L'application a besoin de l'accès à votre localisation pour suivre vos mouvements."
            );
            return;
        }

        // Pour iOS, demander la permission d'arrière-plan
        if (Platform.OS === 'ios') {
            const backgroundStatus = await Location.requestBackgroundPermissionsAsync();
            if (backgroundStatus.status !== 'granted') {
                Alert.alert(
                    "Permission arrière-plan recommandée",
                    "Pour une mesure continue même avec le téléphone en veille, autorisez la localisation en arrière-plan."
                );
            }
        }

        // Réinitialiser les données
        const newSessionId = Date.now().toString();
        setSessionId(newSessionId);
        setIsTracking(true);
        setDistance(0);
        setMaxSpeed(0);
        setAverageSpeed(0);
        setCurrentSpeed(0);
        setPrevLocation(null);
        setSpeedHistory([]);
        setSessionStats({
            startTime: Date.now(),
            totalSpeed: 0,
            speedReadings: 0,
            validReadings: 0
        });

        try {
            const locationSubscription = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.BestForNavigation,
                    timeInterval: 1000, // Mise à jour chaque seconde
                    distanceInterval: 1, // Mise à jour chaque mètre
                    mayShowUserSettingsDialog: true,
                },
                (location) => {
                    processLocationUpdate(location);
                }
            );

            setSubscription(locationSubscription);

            // Activer le mode arrière-plan après un délai
            setTimeout(() => {
                if (isTracking) {
                    enableBackgroundLocation();
                }
            }, 2000);

        } catch (error) {
            console.error('Erreur lors du démarrage du tracking:', error);
            Alert.alert('Erreur', 'Impossible de démarrer le suivi de localisation.');
            setIsTracking(false);
        }
    };

    const processLocationUpdate = (location: Location.LocationObject) => {
        const { coords } = location;

        // Vérifier la précision GPS
        if (coords.accuracy && coords.accuracy > 20) {
            console.log(`Précision GPS faible: ${coords.accuracy}m`);
            return; // Ignorer les lectures imprécises
        }

        setCurrentSpeed((coords.speed || 0) * 3.6); // Conversion m/s vers km/h

        if (prevLocation && coords.speed !== null) {
            const deltaDistance = getDistanceFromLatLonInMeters(
                prevLocation.latitude,
                prevLocation.longitude,
                coords.latitude,
                coords.longitude
            );

            const currentSpeedKmh = coords.speed * 3.6;

            // Filtrage des valeurs aberrantes
            const isValidSpeed = currentSpeedKmh >= 0 && currentSpeedKmh <= 200; // Maximum 200 km/h
            const isValidDistance = deltaDistance < 200; // Maximum 200m entre deux lectures

            if (isValidSpeed && isValidDistance) {
                // Mettre à jour la distance
                setDistance(prev => prev + deltaDistance);

                // Mettre à jour la vitesse maximale
                setMaxSpeed(prevMaxSpeed =>
                    currentSpeedKmh > prevMaxSpeed ? currentSpeedKmh : prevMaxSpeed
                );

                // Mettre à jour l'historique des vitesses
                setSpeedHistory(prev => {
                    const newHistory = [...prev, currentSpeedKmh];
                    // Garder seulement les 60 dernières lectures (1 minute)
                    return newHistory.slice(-60);
                });

                // Calculer la vitesse moyenne
                setSessionStats(prev => {
                    const newTotalSpeed = prev.totalSpeed + currentSpeedKmh;
                    const newReadings = prev.speedReadings + 1;
                    const newValidReadings = prev.validReadings + 1;

                    setAverageSpeed(newTotalSpeed / newReadings);

                    return {
                        ...prev,
                        totalSpeed: newTotalSpeed,
                        speedReadings: newReadings,
                        validReadings: newValidReadings
                    };
                });
            }
        }

        setPrevLocation(coords);
    };

    const stopTracking = async () => {
        setIsTracking(false);

        // Arrêter l'abonnement à la localisation
        if (subscription) {
            subscription.remove();
            setSubscription(null);
        }

        // Arrêter la tâche en arrière-plan
        if (await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME)) {
            await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
        }

        // Calculer les statistiques finales de la session
        const sessionDuration = trackingTime;
        const totalDistanceKm = distance / 1000;
        const avgSpeedFinal = sessionStats.speedReadings > 0 ?
            sessionStats.totalSpeed / sessionStats.speedReadings : 0;

        // Enregistrer la performance si significative
        if (totalDistanceKm > 0.01 && sessionDuration > 5) { // Minimum 10m et 5 secondes
            try {
                const response = await apiPost("update-performance", {
                    user_id: user?.id,
                    speed: maxSpeed,
                    distance: totalDistanceKm,
                    duration: sessionDuration,
                    average_speed: avgSpeedFinal,
                    session_id: sessionId
                });

                if (response.success) {
                    Toast.show({
                        type: 'success',
                        text1: 'Performance enregistrée !',
                        text2: `${maxSpeed.toFixed(1)} km/h max • ${totalDistanceKm.toFixed(2)} km`,
                    });
                } else {
                    throw new Error(response.message || 'Erreur serveur');
                }
            } catch (error: any) {
                if (error.message === 'NoRefreshTokenError' || error.JWT_ERROR) {
                    setUser(null);
                } else {
                    Toast.show({
                        type: 'error',
                        text1: 'Erreur d\'enregistrement',
                        text2: error.message || 'Impossible de sauvegarder la performance',
                    });
                }
            }
        } else {
            Toast.show({
                type: 'info',
                text1: 'Session trop courte',
                text2: 'Session non enregistrée (minimum 10m et 5s)',
            });
        }

        // Réinitialiser les données
        resetSession();
    };

    const resetSession = () => {
        setDistance(0);
        setMaxSpeed(0);
        setAverageSpeed(0);
        setCurrentSpeed(0);
        setPrevLocation(null);
        setSpeedHistory([]);
        setSessionStats({
            startTime: 0,
            totalSpeed: 0,
            speedReadings: 0,
            validReadings: 0
        });
        setSessionId(null);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const StatCard = ({ icon: IconComponent, title, value, unit, color = Colors.primary, isLive = false }: {
        icon: any;
        title: string;
        value: string;
        unit: string;
        color?: string;
        isLive?: boolean;
    }) => (
        <View style={[styles.statCard, isLive && styles.statCardLive]}>
            <View style={[styles.statIcon, { backgroundColor: color }]}>
                <IconComponent size={24} color={Colors.white} />
            </View>
            <View style={styles.statContent}>
                <Text style={styles.statTitle}>{title}</Text>
                <View style={styles.statValueContainer}>
                    <Text style={[styles.statValue, isLive && styles.statValueLive]}>{value}</Text>
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
        const R = 6371e3; // Rayon de la Terre en mètres
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
            <Header refreshFunction={null} disableRefresh={true} />
            <View style={styles.headerContainer}>
                <BoutonRetour previousRoute={"homeNavigator"} title={"Vitesse de glisse"} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.heroSection}>
                    <View style={[styles.heroIcon, isTracking && styles.heroIconActive]}>
                        <Zap size={32} color={isTracking ? Colors.white : Colors.primary} />
                    </View>
                    <Text style={styles.heroTitle}>
                        {isTracking ? 'Enregistrement en cours...' : 'Suivi de performance'}
                    </Text>
                    {isTracking && (
                        <Text style={styles.heroSubtitle}>
                            Session active • {formatTime(trackingTime)}
                        </Text>
                    )}
                </View>

                <View style={styles.statsSection}>
                    <StatCard
                        icon={Activity}
                        title="Vitesse actuelle"
                        value={currentSpeed.toFixed(1)}
                        unit="km/h"
                        color={Colors.success}
                        isLive={isTracking}
                    />

                    <StatCard
                        icon={Zap}
                        title="Vitesse maximale"
                        value={maxSpeed.toFixed(1)}
                        unit="km/h"
                        color={Colors.primary}
                    />

                    <StatCard
                        icon={TrendingUp}
                        title="Vitesse moyenne"
                        value={averageSpeed.toFixed(1)}
                        unit="km/h"
                        color={Colors.accent}
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
                        title="Durée"
                        value={formatTime(trackingTime)}
                        unit=""
                        color={Colors.muted}
                    />
                </View>

                <View style={styles.controlsSection}>
                    <Text style={styles.sectionTitle}>Contrôles</Text>

                    <ActionButton
                        title={isTracking ? "Arrêter l'enregistrement" : "Commencer l'enregistrement"}
                        icon={isTracking ? Square : Play}
                        onPress={isTracking ? stopTracking : startTracking}
                        variant="primary"
                    />

                    <ActionButton
                        title="Voir le classement"
                        icon={Trophy}
                        onPress={() => (navigation as any).navigate('PerformancesScreen')}
                        variant="secondary"
                        disabled={isTracking}
                    />

                    <ActionButton
                        title="Mes enregistrements"
                        icon={Gauge}
                        onPress={() => (navigation as any).navigate('UserPerformancesScreen')}
                        variant="secondary"
                        disabled={isTracking}
                    />
                </View>
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
        paddingBottom: 24,
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
    heroIconActive: {
        backgroundColor: Colors.primary,
    },
    heroTitle: {
        ...TextStyles.h2Bold,
        color: Colors.primaryBorder,
        textAlign: 'center',
        marginBottom: 4,
    },
    heroSubtitle: {
        ...TextStyles.body,
        color: Colors.primary,
        textAlign: 'center',
        fontWeight: '600',
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
    statCardLive: {
        borderColor: Colors.success,
        borderWidth: 2,
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
        ...TextStyles.h3Bold,
        color: Colors.primaryBorder,
        marginRight: 4,
    },
    statValueLive: {
        color: Colors.success,
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
        ...TextStyles.h3Bold,
        color: Colors.primaryBorder,
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
});