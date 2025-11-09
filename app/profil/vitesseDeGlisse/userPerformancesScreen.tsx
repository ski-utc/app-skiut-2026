import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { useNavigation } from '@react-navigation/native';
import Header from "../../../components/header";
import BoutonRetour from "../../../components/divers/boutonRetour";
import { Colors, TextStyles } from '@/constants/GraphSettings';
import { Zap, MapPin, Timer, Activity, TrendingUp, Trash2 } from "lucide-react-native";
import { apiGet, apiPost, apiDelete } from "@/constants/api/apiCalls";
import { useUser } from "@/contexts/UserContext";
import Toast from 'react-native-toast-message';
import ErrorScreen from "@/components/pages/errorPage";

interface UserSession {
    id: number;
    max_speed: number;
    distance: number;
    duration: number;
    average_speed: number;
    session_date: string;
    session_id: string;
}

interface UserStats {
    total_sessions: number;
    total_distance: number;
    total_duration: number;
    best_speed: number;
    best_average_speed: number;
    best_distance: number;
}

export default function UserPerformancesScreen() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [sessions, setSessions] = useState<UserSession[]>([]);
    const [stats, setStats] = useState<UserStats | null>(null);
    const [disableRefresh, setDisableRefresh] = useState(false);

    const { user, setUser } = useUser();
    const navigation = useNavigation();

    useEffect(() => {
        fetchUserPerformances();
    }, []);

    const fetchUserPerformances = async () => {
        setLoading(true);
        setDisableRefresh(true);
        try {
            const response = await apiGet('user-performances');
            if (response.success) {
                setSessions(response.sessions);
                setStats(response.stats);
            } else {
                setError('Erreur lors de la récupération des performances');
            }
        } catch (error: any) {
            if (error.message === 'NoRefreshTokenError' || error.JWT_ERROR) {
                setUser(null);
            } else {
                setError(error.message);
            }
        } finally {
            setLoading(false);
            setTimeout(() => {
                setDisableRefresh(false);
            }, 3000);
        }
    };

    const deleteSession = async (sessionId: string) => {
        try {
            Alert.alert('Supprimer la session', 'Voulez-vous vraiment supprimer cette session ?', [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Supprimer', style: 'destructive', onPress: async () => {
                        const response = await apiDelete(`user-performances/${sessionId}`);
                        if (response.success) {
                            fetchUserPerformances();
                        }
                    }
                }]);
        } catch (error: any) {
            Toast.show({
                type: 'error',
                text1: 'Erreur',
                text2: error.message || 'Impossible de supprimer la session',
            });
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        if (mins === 0) return `${secs}s`;
        return `${mins}m ${secs}s`;
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
                <IconComponent size={20} color={Colors.white} />
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

    const SessionCard = ({ session }: { session: UserSession }) => (
        <View style={styles.sessionCard}>
            <View style={styles.sessionHeader}>
                <View style={styles.sessionHeaderContent}>
                    <Text style={styles.sessionDate}>{formatDate(session.session_date)}</Text>
                </View>
                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => deleteSession(session.session_id)}
                >
                    <Trash2 size={16} color={Colors.error} />
                </TouchableOpacity>
            </View>

            <View style={styles.sessionStats}>
                <View style={styles.sessionStat}>
                    <Zap size={14} color={Colors.primary} />
                    <Text style={styles.sessionStatLabel}>Max</Text>
                    <Text style={styles.sessionStatValue}>{session.max_speed.toFixed(1)} km/h</Text>
                </View>

                <View style={styles.sessionStat}>
                    <TrendingUp size={14} color={Colors.accent} />
                    <Text style={styles.sessionStatLabel}>Moy</Text>
                    <Text style={styles.sessionStatValue}>{session.average_speed.toFixed(1)} km/h</Text>
                </View>

                <View style={styles.sessionStat}>
                    <MapPin size={14} color={Colors.primaryBorder} />
                    <Text style={styles.sessionStatLabel}>Dist</Text>
                    <Text style={styles.sessionStatValue}>{session.distance.toFixed(2)} km</Text>
                </View>

                <View style={styles.sessionStat}>
                    <Timer size={14} color={Colors.muted} />
                    <Text style={styles.sessionStatLabel}>Durée</Text>
                    <Text style={styles.sessionStatValue}>{formatDuration(session.duration)}</Text>
                </View>
            </View>
        </View>
    );

    if (error) {
        return <ErrorScreen error={error} />;
    }

    if (loading) {
        return (
            <View style={styles.container}>
                <Header refreshFunction={null} disableRefresh={true} />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                    <Text style={styles.loadingText}>Chargement de vos performances...</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Header refreshFunction={fetchUserPerformances} disableRefresh={disableRefresh} />
            <View style={styles.headerContainer}>
                <BoutonRetour previousRoute="VitesseDeGlisseScreen" title="Mes enregistrements" />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Statistiques globales */}
                {stats && (
                    <View style={styles.statsSection}>
                        <Text style={styles.sectionTitle}>Statistiques globales</Text>

                        <View style={styles.statsGrid}>
                            <StatCard
                                icon={Activity}
                                title="Sessions"
                                value={stats.total_sessions.toString()}
                                unit=""
                                color={Colors.primary}
                            />

                            <StatCard
                                icon={Zap}
                                title="Meilleure vitesse"
                                value={stats.best_speed.toFixed(1)}
                                unit="km/h"
                                color={Colors.success}
                            />
                        </View>

                        <View style={styles.statsGrid}>
                            <StatCard
                                icon={MapPin}
                                title="Distance totale"
                                value={stats.total_distance.toFixed(1)}
                                unit="km"
                                color={Colors.primaryBorder}
                            />

                            <StatCard
                                icon={Timer}
                                title="Temps total"
                                value={Math.floor(stats.total_duration / 60).toString()}
                                unit="min"
                                color={Colors.accent}
                            />
                        </View>

                        <StatCard
                            icon={TrendingUp}
                            title="Meilleure vitesse moyenne"
                            value={stats.best_average_speed.toFixed(1)}
                            unit="km/h"
                            color={Colors.warning}
                        />
                    </View>
                )}

                {/* Liste des sessions */}
                <View style={styles.sessionsSection}>
                    <Text style={styles.sectionTitle}>
                        Vos enregistrements ({sessions.length})
                    </Text>

                    {sessions.length > 0 ? (
                        sessions.map((session) => (
                            <SessionCard key={session.session_id} session={session} />
                        ))
                    ) : (
                        <View style={styles.emptyState}>
                            <View style={styles.emptyIcon}>
                                <Zap size={48} color={Colors.lightMuted} />
                            </View>
                            <Text style={styles.emptyTitle}>Aucun enregistrement</Text>
                            <Text style={styles.emptyDescription}>
                                Lancez votre première session pour voir vos performances apparaître ici
                            </Text>
                        </View>
                    )}
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.white,
    },
    loadingText: {
        ...TextStyles.body,
        color: Colors.muted,
        marginTop: 16,
        textAlign: 'center',
    },
    sectionTitle: {
        ...TextStyles.h3Bold,
        color: Colors.primaryBorder,
        marginBottom: 16,
        marginTop: 8,
    },
    statsSection: {
        marginBottom: 32,
    },
    statsGrid: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
    },
    statCard: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.06)',
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowOffset: { width: 1, height: 2 },
        shadowRadius: 4,
        elevation: 2,
        padding: 12,
    },
    statIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    statContent: {
        flex: 1,
    },
    statTitle: {
        ...TextStyles.small,
        color: Colors.muted,
        marginBottom: 2,
    },
    statValueContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    statValue: {
        ...TextStyles.bodyBold,
        color: Colors.primaryBorder,
        marginRight: 2,
    },
    statUnit: {
        ...TextStyles.small,
        color: Colors.primary,
        fontWeight: '600',
    },
    sessionsSection: {
        marginBottom: 24,
    },
    sessionCard: {
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
    sessionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    sessionIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: Colors.lightMuted,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    sessionHeaderContent: {
        flex: 1,
    },
    sessionDate: {
        ...TextStyles.bodyBold,
        color: Colors.primaryBorder,
    },
    sessionId: {
        ...TextStyles.small,
        color: Colors.muted,
    },
    deleteButton: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
    },
    sessionStats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    sessionStat: {
        alignItems: 'center',
        flex: 1,
    },
    sessionStatLabel: {
        ...TextStyles.small,
        color: Colors.muted,
        marginTop: 2,
        marginBottom: 2,
    },
    sessionStatValue: {
        ...TextStyles.small,
        color: Colors.primaryBorder,
        fontWeight: '600',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 48,
        paddingHorizontal: 32,
    },
    emptyIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: Colors.lightMuted,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    emptyTitle: {
        ...TextStyles.h3Bold,
        color: Colors.primaryBorder,
        marginBottom: 8,
        textAlign: 'center',
    },
    emptyDescription: {
        ...TextStyles.body,
        color: Colors.muted,
        textAlign: 'center',
        lineHeight: 22,
    },
});
