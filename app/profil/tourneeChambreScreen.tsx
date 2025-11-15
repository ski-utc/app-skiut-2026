import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    RefreshControl,
    ScrollView,
} from 'react-native';
import DraggableFlatList, {
    ScaleDecorator,
    RenderItemParams,
} from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Collapsible from 'react-native-collapsible';
import { apiGet, apiPost } from '@/constants/api/apiCalls';
import BoutonRetour from '@/components/divers/boutonRetour';
import Header from '../../components/header';
import ErrorScreen from '@/components/pages/errorPage';
import { useUser } from '@/contexts/UserContext';
import { Colors, TextStyles } from '@/constants/GraphSettings';
import {
    Home,
    Users,
    CheckCircle,
    ChevronDown,
    ChevronUp,
    GripVertical,
} from 'lucide-react-native';
import Toast from 'react-native-toast-message';

interface Visit {
    id: number;
    room_id: string;
    room_info: {
        room_id: string;
        room_name?: string;
        mood?: string;
        occupants: Array<{
            id: number;
            name: string;
        }>;
        occupants_count: number;
    };
    visit_order: number;
    visited: boolean;
    visited_at: string | null;
    notes: string | null;
}

interface TourData {
    tour_id: number;
    tour_date: string;
    binome: {
        id: number;
        name: string;
        members: Array<{
            id: number;
            name: string;
        }>;
        stats: {
            total_rooms: number;
            visited_rooms: number;
            progress_percentage: number;
        };
    };
    visits: Visit[];
}

const getMoodStyle = (mood?: string) => {
    switch (mood) {
        case 'Chill':
            return { color: '#22c55e', label: 'Calme' };
        case 'Petite Night':
            return { color: '#eab308', label: 'Petite night' };
        case 'Grosse Night':
            return { color: '#f97316', label: 'Grosse night' };
        case 'Mega Grosse Night':
            return { color: '#ef4444', label: 'Méga grosse night' };
        default:
            return null;
    }
};

export default function TourneeChambreScreen() {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState('');
    const [tourData, setTourData] = useState<TourData | null>(null);
    const [visits, setVisits] = useState<Visit[]>([]);
    const [expandedRooms, setExpandedRooms] = useState<Set<number>>(new Set());
    const [hasChanges, setHasChanges] = useState(false);
    const [savingOrder, setSavingOrder] = useState(false);

    const { setUser } = useUser();

    const fetchTourData = useCallback(async () => {
        try {
            const response = await apiGet("room-tours/my-tour");

            if (response.success && response.data) {
                setTourData(response.data);
                setVisits(response.data.visits || []);
                setError('');
            } else {
                if (response.message && response.message.includes('membres de l\'association')) {
                    setError("Cette fonctionnalité est réservée aux membres de l'association.");
                } else {
                    setTourData(null);
                    setVisits([]);
                }
            }
        } catch (error: any) {
            if (error.message === 'NoRefreshTokenError' || error.JWT_ERROR) {
                setUser(null);
            } else {
                setError(error.message || 'Erreur lors du chargement');
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [setUser]);

    useEffect(() => {
        fetchTourData();
    }, [fetchTourData]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchTourData();
    }, [fetchTourData]);

    const toggleRoomExpanded = (visitId: number) => {
        setExpandedRooms(prev => {
            const newSet = new Set(prev);
            if (newSet.has(visitId)) {
                newSet.delete(visitId);
            } else {
                newSet.add(visitId);
            }
            return newSet;
        });
    };

    const markAsVisited = async (visit: Visit) => {
        try {
            const response = await apiPost(`room-tours/visits/${visit.id}/mark-visited`, {});

            if (response.success) {
                setVisits(prevVisits =>
                    prevVisits.map(v =>
                        v.id === visit.id
                            ? { ...v, visited: true, visited_at: new Date().toISOString() }
                            : v
                    )
                );
                fetchTourData();
            } else if (response.pending) {
                Toast.show({
                    type: 'info',
                    text1: 'Requête sauvegardée',
                    text2: response.message,
                });
                fetchTourData();
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Erreur',
                    text2: response.message || 'Impossible de marquer la chambre comme visitée',
                });
            }
        } catch (error: any) {
            Toast.show({
                type: 'error',
                text1: 'Erreur',
                text2: error.message || 'Une erreur est survenue',
            });
        }
    };

    const cancelVisit = async (visit: Visit) => {
        Alert.alert(
            'Annuler la visite',
            `Voulez-vous vraiment annuler la visite de la chambre ${visit.room_id} ?`,
            [
                { text: 'Non', style: 'cancel' },
                {
                    text: 'Oui',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const response = await apiPost(`room-tours/visits/${visit.id}/unmark-visited`, {});

                            if (response.success) {
                                setVisits(prevVisits =>
                                    prevVisits.map(v =>
                                        v.id === visit.id
                                            ? { ...v, visited: false, visited_at: null }
                                            : v
                                    )
                                );
                                fetchTourData();
                            } else {
                                Toast.show({
                                    type: 'error',
                                    text1: 'Erreur',
                                    text2: response.message || 'Impossible d\'annuler la visite',
                                });
                            }
                        } catch (error: any) {
                            Toast.show({
                                type: 'error',
                                text1: 'Erreur',
                                text2: error.message || 'Une erreur est survenue',
                            });
                        }
                    }
                }
            ]
        );
    };

    const onDragEnd = ({ data }: { data: Visit[] }) => {
        setVisits(data);
        setHasChanges(true);
    };

    const saveOrder = async () => {
        if (!tourData) return;

        setSavingOrder(true);
        try {
            const roomOrder: { [key: string]: number } = {};
            visits.forEach((visit, index) => {
                roomOrder[visit.room_id] = index + 1;
            });

            const response = await apiPost('room-tours/my-tour/reorder', { room_order: roomOrder });

            if (response.success) {
                setHasChanges(false);
                Alert.alert('Succès', 'L\'ordre des chambres a été enregistré');
                fetchTourData();
            } else if (response.pending) {
                Toast.show({
                    type: 'info',
                    text1: 'Requête sauvegardée',
                    text2: response.message,
                });
                fetchTourData();
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Erreur',
                    text2: response.message,
                });
            }
        } catch (error: any) {
            Alert.alert('Erreur', error.message || 'Une erreur est survenue');
        } finally {
            setSavingOrder(false);
        }
    };

    const renderVisitItem = ({ item, drag, isActive }: RenderItemParams<Visit>) => {
        const isExpanded = expandedRooms.has(item.id);

        return (
            <ScaleDecorator>
                <View style={[
                    styles.roomCard,
                    item.visited && styles.roomCardVisited,
                    isActive && styles.roomCardDragging
                ]}>
                    <View style={styles.roomMainRow}>
                        <View style={styles.roomInfo}>
                            <View style={styles.roomHeaderRow}>
                                <Text style={[styles.roomNumber, item.visited && styles.textVisited]}>
                                    Chambre {item.room_id}
                                </Text>
                                {item.room_info.mood && (() => {
                                    const moodStyle = getMoodStyle(item.room_info.mood);
                                    if (moodStyle) {
                                        return (
                                            <View style={[styles.moodBadge, { backgroundColor: `${moodStyle.color}20`, borderColor: moodStyle.color }]}>
                                                <Text style={[styles.moodBadgeText, { color: moodStyle.color }]}>
                                                    {moodStyle.label}
                                                </Text>
                                            </View>
                                        );
                                    }
                                    return null;
                                })()}
                            </View>
                            {item.room_info.room_name && (
                                <Text style={[styles.roomName, item.visited && styles.textVisited]}>
                                    {item.room_info.room_name}
                                </Text>
                            )}
                        </View>

                        <View style={styles.roomActions}>
                            {!item.visited ? (
                                <TouchableOpacity
                                    style={styles.visitedButtonCompact}
                                    onPress={() => markAsVisited(item)}
                                >
                                    <CheckCircle size={14} color={Colors.white} />
                                    <Text style={styles.visitedButtonTextCompact}>Visitée</Text>
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity
                                    style={styles.cancelButtonCompact}
                                    onPress={() => cancelVisit(item)}
                                >
                                    <Text style={styles.cancelButtonTextCompact}>Annuler</Text>
                                </TouchableOpacity>
                            )}

                            <TouchableOpacity
                                onLongPress={drag}
                                disabled={isActive}
                                style={styles.dragHandle}
                            >
                                <GripVertical size={18} color={Colors.muted} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity
                        onPress={() => toggleRoomExpanded(item.id)}
                        style={styles.expandButton}
                    >
                        <Text style={styles.expandButtonText}>
                            {isExpanded ? 'Masquer' : 'Voir'} les occupants
                        </Text>
                        {isExpanded ? (
                            <ChevronUp size={14} color={Colors.primary} />
                        ) : (
                            <ChevronDown size={14} color={Colors.primary} />
                        )}
                    </TouchableOpacity>

                    <Collapsible collapsed={!isExpanded}>
                        <View style={styles.occupantsList}>
                            {item.room_info.occupants.map((occupant) => (
                                <Text key={occupant.id} style={styles.occupantName}>
                                    • {occupant.name}
                                </Text>
                            ))}
                        </View>
                    </Collapsible>
                </View>
            </ScaleDecorator>
        );
    };

    if (error) {
        return (
            <ErrorScreen error={error} />
        );
    }

    if (loading) {
        return (
            <View style={{
                flex: 1,
                backgroundColor: Colors.white,
            }}>
                <Header refreshFunction={undefined} disableRefresh={true} />
                <View style={{
                    width: '100%',
                    flex: 1,
                    backgroundColor: Colors.white,
                    justifyContent: 'center',
                    alignItems: 'center',
                }}>
                    <ActivityIndicator size="large" color={Colors.primaryBorder} />
                    <Text style={[TextStyles.body, { color: Colors.muted, marginTop: 16 }]}>
                        Chargement...
                    </Text>
                </View>
            </View>
        );
    }

    if (!tourData) {
        return (
            <SafeAreaView style={styles.container}>
                <Header refreshFunction={null} disableRefresh={true} />
                <View style={styles.headerContainer}>
                    <BoutonRetour previousRoute="homeNavigator" title="Tournée des chambres" />
                </View>
                <ScrollView
                    contentContainerStyle={styles.centerContainer}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                >
                    <Home size={64} color={Colors.muted} />
                    <Text style={styles.noTourText}>Aucune tournée active aujourd'hui</Text>
                    <Text style={styles.noTourSubtext}>
                        Revenez plus tard ou contactez un administrateur
                    </Text>
                </ScrollView>
            </SafeAreaView>
        );
    }

    return (
        <GestureHandlerRootView style={styles.container}>
            <SafeAreaView style={styles.container}>
                <Header refreshFunction={null} disableRefresh={true} />
                <View style={styles.headerContainer}>
                    <BoutonRetour previousRoute="homeNavigator" title="Tournée des chambres" />
                </View>

                <View style={styles.binomeCard}>
                    <View style={styles.binomeHeader}>
                        <View style={styles.binomeTitleRow}>
                            <Users size={16} color={Colors.white} />
                            <Text style={styles.binomeTitle}>{tourData.binome.name}</Text>
                        </View>
                        <Text style={styles.binomeStats}>
                            {tourData.binome.stats.visited_rooms}/{tourData.binome.stats.total_rooms}
                        </Text>
                    </View>
                </View>

                <View style={styles.titleSection}>
                    <Text style={styles.sectionTitle}>
                        Chambres à visiter ({visits.length})
                    </Text>
                    <Text style={styles.dragHint}>
                        Maintenez l'icône <GripVertical size={12} color={Colors.muted} /> pour réorganiser
                    </Text>
                </View>

                <View style={{ flex: 1 }}>
                    <DraggableFlatList
                        data={visits}
                        onDragEnd={onDragEnd}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={renderVisitItem}
                        contentContainerStyle={styles.flatListContent}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                        }
                        ListFooterComponent={
                            hasChanges ? (
                                <View style={styles.saveButtonContainer}>
                                    <TouchableOpacity
                                        style={styles.saveButton}
                                        onPress={saveOrder}
                                        disabled={savingOrder}
                                    >
                                        {savingOrder ? (
                                            <ActivityIndicator size="small" color={Colors.white} />
                                        ) : (
                                            <Text style={styles.saveButtonText}>Enregistrer l'ordre</Text>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            ) : null
                        }
                    />
                </View>
            </SafeAreaView>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.white,
    },
    headerContainer: {
        paddingHorizontal: 20,
        paddingBottom: 8,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    binomeCard: {
        backgroundColor: Colors.primary,
        marginHorizontal: 16,
        marginTop: 0,
        marginBottom: 12,
        padding: 16,
        borderRadius: 12,
    },
    binomeHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    binomeTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flex: 1,
    },
    binomeTitle: {
        ...TextStyles.h3,
        color: Colors.white,
    },
    binomeStats: {
        ...TextStyles.h3,
        color: Colors.white,
        fontWeight: '700',
    },
    titleSection: {
        paddingHorizontal: 16,
        marginBottom: 8,
    },
    sectionTitle: {
        ...TextStyles.h3,
        color: Colors.primaryBorder,
        marginBottom: 4,
    },
    dragHint: {
        ...TextStyles.small,
        color: Colors.muted,
    },
    flatListContent: {
        paddingBottom: 20,
    },
    roomCard: {
        backgroundColor: Colors.white,
        padding: 12,
        width: '90%',
        alignSelf: 'center',
        borderRadius: 8,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: Colors.lightMuted,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    roomCardVisited: {
        backgroundColor: Colors.lightMuted,
        opacity: 0.7,
    },
    roomCardDragging: {
        opacity: 0.95,
        transform: [{ scale: 1.01 }],
    },
    roomMainRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    roomInfo: {
        flex: 1,
    },
    roomHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flexWrap: 'wrap',
    },
    moodBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 12,
        borderWidth: 1,
    },
    moodBadgeText: {
        ...TextStyles.small,
        fontSize: 10,
        fontWeight: '600',
    },
    roomNumber: {
        ...TextStyles.body,
        fontWeight: '600',
        color: Colors.primaryBorder,
    },
    roomName: {
        ...TextStyles.small,
        color: Colors.muted,
        marginTop: 2,
    },
    occupantsCount: {
        ...TextStyles.small,
        color: Colors.muted,
        marginTop: 2,
    },
    textVisited: {
        color: Colors.muted,
    },
    roomActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    visitedButtonCompact: {
        backgroundColor: Colors.success,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 6,
        gap: 4,
    },
    visitedButtonTextCompact: {
        ...TextStyles.small,
        color: Colors.white,
        fontWeight: '600',
    },
    cancelButtonCompact: {
        backgroundColor: Colors.error,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 6,
    },
    cancelButtonTextCompact: {
        ...TextStyles.small,
        color: Colors.white,
        fontWeight: '600',
    },
    dragHandle: {
        padding: 4,
    },
    expandButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 8,
        marginTop: 8,
        borderTopWidth: 1,
        borderTopColor: Colors.lightMuted,
        gap: 4,
    },
    expandButtonText: {
        ...TextStyles.small,
        color: Colors.primary,
        fontWeight: '500',
    },
    occupantsList: {
        paddingTop: 8,
        paddingLeft: 8,
    },
    occupantName: {
        ...TextStyles.small,
        color: Colors.primaryBorder,
        marginBottom: 3,
    },
    saveButtonContainer: {
        padding: 16,
    },
    saveButton: {
        backgroundColor: Colors.primary,
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    saveButtonText: {
        ...TextStyles.button,
        color: Colors.white,
        fontWeight: '600',
    },
    noTourText: {
        ...TextStyles.h2,
        color: Colors.primaryBorder,
        marginTop: 16,
        textAlign: 'center',
    },
    noTourSubtext: {
        ...TextStyles.body,
        color: Colors.muted,
        marginTop: 8,
        textAlign: 'center',
    },
});
