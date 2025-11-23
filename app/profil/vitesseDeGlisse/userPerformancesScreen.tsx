import { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { Zap, MapPin, Timer, Activity, TrendingUp, Trash2, LucideProps } from "lucide-react-native";
import Toast from 'react-native-toast-message';

import { Colors, TextStyles } from '@/constants/GraphSettings';
import { apiGet, apiDelete, isSuccessResponse, handleApiErrorScreen, handleApiErrorToast, AppError, isPendingResponse } from "@/constants/api/apiCalls";
import { useUser } from "@/contexts/UserContext";
import ErrorScreen from "@/components/pages/errorPage";

import BoutonRetour from "../../../components/divers/boutonRetour";
import Header from "../../../components/header";

type UserSession = {
    id: number;
    max_speed: number;
    distance: number;
    duration: number;
    average_speed: number;
    session_date: string;
    session_id: string;
}

type UserStats = {
    total_sessions: number;
    total_distance: number;
    total_duration: number;
    best_speed: number;
    best_average_speed: number;
    best_distance: number;
}

type UserPerformanceResponse = {
    sessions: UserSession[];
    stats: UserStats;
}

const StatCard = ({ icon: IconComponent, title, value, unit, color = Colors.primary }: {
    icon: React.FC<LucideProps>;
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

export default function UserPerformancesScreen() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [sessions, setSessions] = useState<UserSession[]>([]);
    const [stats, setStats] = useState<UserStats | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    const { setUser } = useUser();

    const fetchUserPerformances = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else if (sessions.length === 0) setLoading(true);

        if (!isRefresh) setError('');

        try {
            const response = await apiGet<UserPerformanceResponse>('user-performances');

            if (isSuccessResponse(response)) {
                setSessions(response.data.sessions || []);
                setStats(response.data.stats || null);
            }
        } catch (err: unknown) {
            if (isRefresh) {
                handleApiErrorToast(err as AppError, setUser);
            } else {
                handleApiErrorScreen(err, setUser, setError);
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [setUser, sessions.length]);

    useEffect(() => {
        fetchUserPerformances();
    }, [fetchUserPerformances]);

    const deleteSession = async (sessionId: string) => {
        Alert.alert('Supprimer la session', 'Voulez-vous vraiment supprimer cette session ?', [
            { text: 'Annuler', style: 'cancel' },
            {
                text: 'Supprimer',
                style: 'destructive',
                onPress: async () => {
                    try {
                        const response = await apiDelete(`user-performances/${sessionId}`);

                        if (isSuccessResponse(response)) {
                            setSessions(prev => prev.filter(s => s.session_id !== sessionId));
                            Toast.show({ type: 'success', text1: 'Session supprimée' });
                            fetchUserPerformances(true);
                        } else if (isPendingResponse(response)) {
                            setSessions(prev => prev.filter(s => s.session_id !== sessionId));
                            Toast.show({ type: 'info', text1: 'Suppression sauvegardée (Hors ligne)' });
                        } else {
                            Toast.show({ type: 'error', text1: 'Erreur', text2: response.message });
                        }
                    } catch (err: unknown) {
                        handleApiErrorToast(err as AppError, setUser);
                    }
                }
            }]);
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

    if (loading && sessions.length === 0) {
        return (
            <View style={styles.container}>
                <Header refreshFunction={undefined} disableRefresh={true} />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                    <Text style={styles.loadingText}>Chargement de vos performances...</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Header refreshFunction={() => fetchUserPerformances(true)} disableRefresh={refreshing} />
            <View style={styles.headerContainer}>
                <BoutonRetour title="Mes enregistrements" />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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
                            color={Colors.error}
                        />
                    </View>
                )}

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
        backgroundColor: Colors.white,
        flex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    deleteButton: {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderRadius: 8,
        padding: 8,
    },
    emptyDescription: {
        ...TextStyles.body,
        color: Colors.muted,
        lineHeight: 22,
        textAlign: 'center',
    },
    emptyIcon: {
        alignItems: 'center',
        backgroundColor: Colors.lightMuted,
        borderRadius: 40,
        height: 80,
        justifyContent: 'center',
        marginBottom: 24,
        width: 80,
    },
    emptyState: {
        alignItems: 'center',
        paddingHorizontal: 32,
        paddingVertical: 48,
    },
    emptyTitle: {
        ...TextStyles.h3Bold,
        color: Colors.primaryBorder,
        marginBottom: 8,
        textAlign: 'center',
    },
    headerContainer: {
        paddingBottom: 8,
        paddingHorizontal: 20,
        width: '100%',
    },
    loadingContainer: {
        alignItems: 'center',
        backgroundColor: Colors.white,
        flex: 1,
        justifyContent: 'center',
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
        marginBottom: 8,
    },
    sessionCard: {
        backgroundColor: Colors.white,
        borderColor: 'rgba(0,0,0,0.06)',
        borderRadius: 14,
        borderWidth: 1,
        elevation: 3,
        marginBottom: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 5,
    },
    sessionDate: {
        ...TextStyles.bodyBold,
        color: Colors.primaryBorder,
    },
    sessionHeader: {
        alignItems: 'center',
        flexDirection: 'row',
        marginBottom: 12,
    },
    sessionHeaderContent: {
        flex: 1,
    },
    sessionStat: {
        alignItems: 'center',
        flex: 1,
    },
    sessionStatLabel: {
        ...TextStyles.small,
        color: Colors.muted,
        marginBottom: 2,
        marginTop: 2,
    },
    sessionStatValue: {
        ...TextStyles.small,
        color: Colors.primaryBorder,
        fontWeight: '600',
    },
    sessionStats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    sessionsSection: {
        marginBottom: 24,
    },
    statCard: {
        alignItems: 'center',
        backgroundColor: Colors.white,
        borderColor: 'rgba(0,0,0,0.06)',
        borderRadius: 12,
        borderWidth: 1,
        elevation: 2,
        flex: 1,
        flexDirection: 'row',
        padding: 12,
        shadowColor: '#000',
        shadowOffset: { width: 1, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
    },
    statContent: {
        flex: 1,
    },
    statIcon: {
        alignItems: 'center',
        borderRadius: 18,
        height: 36,
        justifyContent: 'center',
        marginRight: 12,
        width: 36,
    },
    statTitle: {
        ...TextStyles.small,
        color: Colors.muted,
        marginBottom: 2,
    },
    statUnit: {
        ...TextStyles.small,
        color: Colors.primary,
        fontWeight: '600',
    },
    statValue: {
        ...TextStyles.bodyBold,
        color: Colors.primaryBorder,
        marginRight: 2,
    },
    statValueContainer: {
        alignItems: 'baseline',
        flexDirection: 'row',
    },
    statsGrid: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
    },
    statsSection: {
        marginBottom: 32,
    },
});
