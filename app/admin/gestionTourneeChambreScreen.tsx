import { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    RefreshControl,
    Modal,
    TextInput,
    ScrollView,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
    Home,
    Plus,
    Calendar,
    Users,
    Trash2,
    Play,
    Square,
    CheckCircle,
} from 'lucide-react-native';
import { Checkbox } from 'expo-checkbox';
import Toast from 'react-native-toast-message';

import { apiGet, apiPost, apiDelete } from '@/constants/api/apiCalls';
import BoutonRetour from '@/components/divers/boutonRetour';
import ErrorScreen from '@/components/pages/errorPage';
import { useUser } from '@/contexts/UserContext';
import { Colors, TextStyles } from '@/constants/GraphSettings';

import Header from '../../components/header';

type RoomTour = {
    id: number;
    tour_date: string;
    is_active: boolean;
    binomes_count: number;
    total_rooms: number;
    visited_rooms: number;
    progress_percentage: number;
    created_at: string;
}

type Room = {
    room_id: string;
    occupants: {
        id: number;
        name: string;
    }[];
    occupants_count: number;
}

type Member = {
    id: number;
    firstName: string;
    lastName: string;
    name: string;
}

type Binome = {
    name: string;
    member_ids: number[];
    assigned_rooms: string[];
}

export default function GestionTourneeChambreScreen() {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState('');
    const [tours, setTours] = useState<RoomTour[]>([]);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [members, setMembers] = useState<Member[]>([]);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [formSubmitting, setFormSubmitting] = useState(false);
    const [showMemberPicker, setShowMemberPicker] = useState<number | null>(null);
    const [showRoomPicker, setShowRoomPicker] = useState<number | null>(null);

    const [formDate, setFormDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [binomes, setBinomes] = useState<Binome[]>([]);

    const { setUser } = useUser();

    const fetchData = useCallback(async () => {
        try {
            const response = await apiGet("admin");
            if (!response.success) {
                setError("Accès non autorisé");
                return;
            }

            const toursResponse = await apiGet("admin/room-tours");
            if (toursResponse.success) {
                setTours(toursResponse.data);
            }

            const roomsResponse = await apiGet("admin/room-tours/available-rooms");
            if (roomsResponse.success) {
                setRooms(roomsResponse.data);
            }

            const membersResponse = await apiGet("admin/permanences/members");
            if (membersResponse.success) {
                setMembers(membersResponse.data);
            }

        } catch (error: any) {
            if (error.message === 'NoRefreshTokenError' || error.JWT_ERROR) {
                setUser(null);
            } else {
                setError(error.message);
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [setUser]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setError('');
        fetchData();
    }, [fetchData]);

    const resetForm = () => {
        setFormDate(new Date());
        setBinomes([]);
    };

    const openCreateModal = () => {
        resetForm();
        setShowCreateModal(true);
    };

    const addBinome = () => {
        setBinomes([...binomes, {
            name: `Binôme ${String.fromCharCode(65 + binomes.length)}`,
            member_ids: [],
            assigned_rooms: []
        }]);
    };

    const updateBinome = (index: number, field: keyof Binome, value: any) => {
        const updatedBinomes = [...binomes];
        updatedBinomes[index] = { ...updatedBinomes[index], [field]: value };
        setBinomes(updatedBinomes);
    };

    const removeBinome = (index: number) => {
        setBinomes(binomes.filter((_, i) => i !== index));
    };

    const submitTour = async () => {
        if (binomes.length === 0) {
            Toast.show({
                type: 'error',
                text1: 'Erreur',
                text2: 'Veuillez ajouter au moins un binôme.',
            });
            return;
        }

        for (let i = 0; i < binomes.length; i++) {
            const binome = binomes[i];
            if (binome.member_ids.length === 0 || binome.assigned_rooms.length === 0) {
                Toast.show({
                    type: 'error',
                    text1: 'Erreur',
                    text2: `Le ${binome.name} doit avoir au moins un membre et une chambre assignée.`,
                });
                return;
            }
        }

        setFormSubmitting(true);

        try {
            const data = {
                tour_date: formDate.toISOString().split('T')[0],
                binomes: binomes
            };

            const response = await apiPost('admin/room-tours', data);

            if (response.success) {
                Toast.show({
                    type: 'success',
                    text1: 'Succès',
                    text2: 'Tournée créée avec succès.',
                });
                setShowCreateModal(false);
                resetForm();
                fetchData();
            } else if (response.pending) {
                Toast.show({
                    type: 'info',
                    text1: 'Requête sauvegardée',
                    text2: response.message,
                });
                setShowCreateModal(false);
                resetForm();
                fetchData();
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Erreur',
                    text2: response.message,
                });
            }
        } catch (error: any) {
            setError(error.message || 'Une erreur est survenue.');
            Toast.show({
                type: 'error',
                text1: 'Erreur',
                text2: error.message || 'Une erreur est survenue.',
            });
        } finally {
            setFormSubmitting(false);
        }
    };

    const toggleTour = async (tour: RoomTour) => {
        try {
            const action = tour.is_active ? 'désactiver' : 'activer';
            Alert.alert(
                `${action.charAt(0).toUpperCase() + action.slice(1)} la tournée`,
                `Voulez-vous ${action} la tournée du ${new Date(tour.tour_date).toLocaleDateString('fr-FR')} ?`,
                [
                    { text: 'Annuler', style: 'cancel' },
                    {
                        text: action.charAt(0).toUpperCase() + action.slice(1),
                        onPress: async () => {
                            const response = await apiPost(`admin/room-tours/${tour.id}/toggle`, {
                                activate: !tour.is_active
                            });

                            if (response.success) {
                                Toast.show({
                                    type: 'success',
                                    text1: 'Succès',
                                    text2: response.message,
                                });
                                fetchData();
                            } else if (response.pending) {
                                Toast.show({
                                    type: 'info',
                                    text1: 'Requête sauvegardée',
                                    text2: response.message,
                                });
                                fetchData();
                            } else {
                                Toast.show({
                                    type: 'error',
                                    text1: 'Erreur',
                                    text2: response.message,
                                });
                            }
                        }
                    }
                ]
            );
        } catch (error: any) {
            setError(error.message || 'Une erreur est survenue.');
            Toast.show({
                type: 'error',
                text1: 'Erreur',
                text2: error.message || 'Une erreur est survenue.',
            });
        }
    };

    const deleteTour = (tour: RoomTour) => {
        Alert.alert(
            'Supprimer la tournée',
            `Voulez-vous vraiment supprimer la tournée du ${new Date(tour.tour_date).toLocaleDateString('fr-FR')} ?`,
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Supprimer',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const response = await apiDelete(`admin/room-tours/${tour.id}`);
                            if (response.success) {
                                Toast.show({
                                    type: 'success',
                                    text1: 'Succès',
                                    text2: 'Tournée supprimée avec succès.',
                                });
                                fetchData();
                            } else if (response.pending) {
                                Toast.show({
                                    type: 'info',
                                    text1: 'Requête sauvegardée',
                                    text2: response.message,
                                });
                                fetchData();
                            } else {
                                Toast.show({
                                    type: 'error',
                                    text1: 'Erreur',
                                    text2: response.message,
                                });
                            }
                        } catch (error: any) {
                            setError(error.message || 'Une erreur est survenue.');
                            Toast.show({
                                type: 'error',
                                text1: 'Erreur',
                                text2: error.message || 'Une erreur est survenue.',
                            });
                        }
                    }
                }
            ]
        );
    };

    const getStatusColor = (tour: RoomTour) => {
        if (tour.is_active) return Colors.success;
        if (tour.progress_percentage > 0) return Colors.primary;
        return null;
    };

    const getStatusText = (tour: RoomTour) => {
        if (tour.is_active) return 'Active';
        if (tour.progress_percentage > 0) return 'En pause';
        return null;
    };

    const renderTourCard = ({ item }: { item: RoomTour }) => {
        const tourDate = new Date(item.tour_date);

        return (
            <View style={styles.tourCard}>
                <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>
                        Tournée du {tourDate.toLocaleDateString('fr-FR')}
                    </Text>
                    <View style={[
                        styles.statusBadge,
                        { backgroundColor: getStatusColor(item) || Colors.white }
                    ]}>
                        <Text style={styles.statusText}>{getStatusText(item)}</Text>
                    </View>
                </View>

                <View style={styles.cardStats}>
                    <View style={styles.statRow}>
                        <Home size={16} color={Colors.muted} />
                        <Text style={styles.statText}>
                            {item.visited_rooms}/{item.total_rooms} chambres visitées
                        </Text>
                    </View>

                    <View style={styles.statRow}>
                        <CheckCircle size={16} color={Colors.muted} />
                        <Text style={styles.statText}>{item.progress_percentage}% complété</Text>
                    </View>
                </View>

                <View style={styles.progressBar}>
                    <View
                        style={[
                            styles.progressFill,
                            {
                                width: `${item.progress_percentage}%`,
                                backgroundColor: item.progress_percentage === 100 ? Colors.success : Colors.primary
                            }
                        ]}
                    />
                </View>

                <View style={styles.cardActions}>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.toggleButton, { backgroundColor: Colors.primary }]}
                        onPress={() => toggleTour(item)}
                    >
                        {item.is_active ? (
                            <Square size={16} color={Colors.white} />
                        ) : (
                            <Play size={16} color={Colors.white} />
                        )}
                        <Text style={[styles.actionButtonText, {
                            color: Colors.white
                        }]}>
                            {item.is_active ? 'Pause' : 'Lancer'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionButton, styles.deleteButton]}
                        onPress={() => deleteTour(item)}
                    >
                        <Trash2 size={16} color={Colors.error} />
                        <Text style={[styles.actionButtonText, { color: Colors.error }]}>
                            Supprimer
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    if (error !== '') {
        return <ErrorScreen error={error} />;
    }

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <Header refreshFunction={null} disableRefresh={true} />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                    <Text style={styles.loadingText}>Chargement des tournées...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <Header refreshFunction={null} disableRefresh={true} />
            <View style={styles.headerContainer}>
                <BoutonRetour title="Tournée des Chambres" />
            </View>

            <View style={styles.heroSection}>
                <View style={styles.heroIcon}>
                    <Home size={32} color={Colors.primary} />
                </View>
                <Text style={styles.heroTitle}>Tournées des chambres</Text>
                <Text style={styles.heroSubtitle}>
                    {tours.length} tournée{tours.length !== 1 ? 's' : ''} planifiée{tours.length !== 1 ? 's' : ''}
                </Text>
            </View>

            <View style={styles.actionsContainer}>
                <TouchableOpacity style={styles.primaryButton} onPress={openCreateModal}>
                    <Plus size={20} color={Colors.white} />
                    <Text style={styles.primaryButtonText}>Nouvelle tournée</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.contentContainer}>
                <FlatList
                    data={tours}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderTourCard}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[Colors.primary]}
                            tintColor={Colors.primary}
                        />
                    }
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.listContainer}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Home size={48} color={Colors.muted} />
                            <Text style={styles.emptyTitle}>Aucune tournée</Text>
                            <Text style={styles.emptySubtitle}>
                                Créez votre première tournée de chambres
                            </Text>
                        </View>
                    }
                />
            </View>

            <Modal
                visible={showCreateModal}
                animationType="slide"
                presentationStyle="pageSheet"
            >
                <SafeAreaView style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Nouvelle tournée</Text>
                    </View>

                    <ScrollView style={styles.modalContent} contentContainerStyle={styles.modalContentContainer}>
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Date de la tournée *</Text>
                            <TouchableOpacity
                                style={styles.dateButton}
                                onPress={() => setShowDatePicker(true)}
                            >
                                <Calendar size={16} color={Colors.muted} />
                                <Text style={styles.dateText}>
                                    {formDate.toLocaleDateString('fr-FR')}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.binomesSection}>
                            <View style={styles.binomesHeader}>
                                <Text style={styles.sectionTitle}>Binômes</Text>
                                <TouchableOpacity style={styles.addBinomeButton} onPress={addBinome}>
                                    <Plus size={20} color={Colors.white} />
                                    <Text style={styles.addBinomeText}>Ajouter</Text>
                                </TouchableOpacity>
                            </View>

                            {binomes.map((binome, index) => (
                                <View key={index} style={styles.binomeCard}>
                                    <View style={styles.binomeHeader}>
                                        <TextInput
                                            style={styles.binomeNameInput}
                                            value={binome.name}
                                            onChangeText={(text) => updateBinome(index, 'name', text)}
                                            placeholder="Nom du binôme"
                                        />
                                        <TouchableOpacity
                                            style={styles.removeBinomeButton}
                                            onPress={() => removeBinome(index)}
                                        >
                                            <Trash2 size={16} color={Colors.error} />
                                        </TouchableOpacity>
                                    </View>

                                    <View style={styles.binomeField}>
                                        <Text style={styles.binomeLabel}>Membres (2 requis) *</Text>
                                        <TouchableOpacity
                                            style={styles.selectButton}
                                            onPress={() => setShowMemberPicker(index)}
                                        >
                                            <Text style={styles.selectButtonText}>
                                                {binome.member_ids.length === 2
                                                    ? `${members.find(m => m.id === binome.member_ids[0])?.name || ''} & ${members.find(m => m.id === binome.member_ids[1])?.name || ''}`
                                                    : binome.member_ids.length > 0
                                                        ? `${binome.member_ids.length} membre(s) sélectionné(s)`
                                                        : 'Sélectionner 2 membres'
                                                }
                                            </Text>
                                        </TouchableOpacity>
                                    </View>

                                    <View style={styles.binomeField}>
                                        <Text style={styles.binomeLabel}>Chambres assignées *</Text>
                                        <TouchableOpacity
                                            style={styles.selectButton}
                                            onPress={() => setShowRoomPicker(index)}
                                        >
                                            <Text style={styles.selectButtonText}>
                                                {binome.assigned_rooms.length > 0
                                                    ? `${binome.assigned_rooms.length} chambre(s) assignée(s)`
                                                    : 'Sélectionner des chambres'
                                                }
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))}

                            {binomes.length === 0 && (
                                <View style={styles.noBinomesContainer}>
                                    <Users size={32} color={Colors.muted} />
                                    <Text style={styles.noBinomesText}>Aucun binôme créé</Text>
                                    <Text style={styles.noBinomesSubtext}>
                                        Ajoutez des binômes pour organiser la tournée
                                    </Text>
                                </View>
                            )}
                        </View>
                    </ScrollView>

                    {showDatePicker && (
                        <DateTimePicker
                            value={formDate}
                            mode="date"
                            display="default"
                            minimumDate={new Date()}
                            onChange={(event, selectedDate) => {
                                setShowDatePicker(false);
                                if (selectedDate) {
                                    setFormDate(selectedDate);
                                }
                            }}
                        />
                    )}

                    <View style={styles.modalFooter}>
                        <TouchableOpacity
                            onPress={() => setShowCreateModal(false)}
                            style={styles.modalCancelButton}
                        >
                            <Text style={styles.modalCancelText}>Annuler</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={submitTour}
                            style={styles.modalSaveButtonBottom}
                            disabled={formSubmitting}
                        >
                            {formSubmitting ? (
                                <ActivityIndicator size="small" color={Colors.white} />
                            ) : (
                                <Text style={styles.modalSaveTextBottom}>Créer</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    <Modal
                        visible={showMemberPicker !== null}
                        transparent={true}
                        animationType="slide"
                    >
                        <View style={styles.pickerModalOverlay}>
                            <View style={styles.pickerModalContent}>
                                <View style={styles.pickerModalHeader}>
                                    <Text style={styles.pickerModalTitle}>Sélectionner 2 membres</Text>
                                    <TouchableOpacity onPress={() => setShowMemberPicker(null)}>
                                        <Text style={styles.pickerModalClose}>Fermer</Text>
                                    </TouchableOpacity>
                                </View>
                                <ScrollView style={styles.pickerModalList}>
                                    {members.map(member => {
                                        const binomeIndex = showMemberPicker!;
                                        const currentBinome = binomes[binomeIndex];
                                        const isSelected = currentBinome?.member_ids.includes(member.id) || false;
                                        const canSelect = currentBinome?.member_ids.length < 2 || isSelected;

                                        return (
                                            <TouchableOpacity
                                                key={member.id}
                                                style={[styles.pickerModalItem, !canSelect && styles.pickerModalItemDisabled]}
                                                onPress={() => {
                                                    if (!canSelect) return;
                                                    const newBinomes = [...binomes];
                                                    if (isSelected) {
                                                        newBinomes[binomeIndex].member_ids = newBinomes[binomeIndex].member_ids.filter(id => id !== member.id);
                                                    } else {
                                                        if (newBinomes[binomeIndex].member_ids.length < 2) {
                                                            newBinomes[binomeIndex].member_ids.push(member.id);
                                                        }
                                                    }
                                                    setBinomes(newBinomes);
                                                }}
                                                disabled={!canSelect}
                                            >
                                                <Checkbox
                                                    value={isSelected}
                                                    onValueChange={() => { }}
                                                    color={Colors.primary}
                                                    disabled={!canSelect}
                                                />
                                                <Text style={styles.pickerModalItemText}>{member.name}</Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </ScrollView>
                            </View>
                        </View>
                    </Modal>

                    <Modal
                        visible={showRoomPicker !== null}
                        transparent={true}
                        animationType="slide"
                    >
                        <View style={styles.pickerModalOverlay}>
                            <View style={styles.pickerModalContent}>
                                <View style={styles.pickerModalHeader}>
                                    <Text style={styles.pickerModalTitle}>Sélectionner les chambres</Text>
                                    <TouchableOpacity onPress={() => setShowRoomPicker(null)}>
                                        <Text style={styles.pickerModalClose}>Fermer</Text>
                                    </TouchableOpacity>
                                </View>
                                <ScrollView style={styles.pickerModalList}>
                                    {rooms.map(room => {
                                        const binomeIndex = showRoomPicker!;
                                        const currentBinome = binomes[binomeIndex];
                                        const isSelected = currentBinome?.assigned_rooms.includes(room.room_id) || false;

                                        return (
                                            <TouchableOpacity
                                                key={room.room_id}
                                                style={styles.pickerModalItem}
                                                onPress={() => {
                                                    const newBinomes = [...binomes];
                                                    if (isSelected) {
                                                        newBinomes[binomeIndex].assigned_rooms = newBinomes[binomeIndex].assigned_rooms.filter(id => id !== room.room_id);
                                                    } else {
                                                        newBinomes[binomeIndex].assigned_rooms.push(room.room_id);
                                                    }
                                                    setBinomes(newBinomes);
                                                }}
                                            >
                                                <Checkbox
                                                    value={isSelected}
                                                    onValueChange={() => { }}
                                                    color={Colors.primary}
                                                />
                                                <Text style={styles.pickerModalItemText}>
                                                    Chambre {room.room_id} ({room.occupants_count} occupant{room.occupants_count !== 1 ? 's' : ''})
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </ScrollView>
                            </View>
                        </View>
                    </Modal>
                </SafeAreaView>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    actionButton: {
        alignItems: 'center',
        borderRadius: 8,
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    actionButtonText: {
        ...TextStyles.body,
        fontWeight: '600',
        marginLeft: 6,
    },
    actionsContainer: {
        marginBottom: 16,
        paddingHorizontal: 20,
    },
    addBinomeButton: {
        alignItems: 'center',
        backgroundColor: Colors.primary,
        borderRadius: 8,
        flexDirection: 'row',
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    addBinomeText: {
        ...TextStyles.small,
        color: Colors.white,
        fontWeight: '600',
        marginLeft: 6,
    },
    binomeCard: {
        backgroundColor: Colors.lightMuted,
        borderRadius: 12,
        marginBottom: 12,
        padding: 16,
    },
    binomeField: {
        marginTop: 12,
    },
    binomeHeader: {
        alignItems: 'center',
        flexDirection: 'row',
        marginBottom: 12,
    },
    binomeLabel: {
        ...TextStyles.small,
        color: Colors.primaryBorder,
        fontWeight: '600',
        marginTop: 8,
    },
    binomeNameInput: {
        flex: 1,
        ...TextStyles.bodyBold,
        borderBottomColor: Colors.primary,
        borderBottomWidth: 1,
        color: Colors.primaryBorder,
        paddingVertical: 4,
    },
    binomesHeader: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    binomesSection: {
        marginBottom: 20,
    },
    cardActions: {
        flexDirection: 'row',
        gap: 12,
    },
    cardHeader: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    cardStats: {
        marginBottom: 12,
    },
    cardTitle: {
        ...TextStyles.bodyBold,
        color: Colors.primaryBorder,
        flex: 1,
    },
    container: {
        backgroundColor: Colors.white,
        flex: 1,
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: 20,
    },
    dateButton: {
        alignItems: 'center',
        borderColor: Colors.lightMuted,
        borderRadius: 12,
        borderWidth: 1,
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    dateText: {
        ...TextStyles.body,
        color: Colors.primaryBorder,
        marginLeft: 8,
    },
    deleteButton: {
        backgroundColor: 'rgba(220, 53, 69, 0.1)',
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptySubtitle: {
        ...TextStyles.body,
        color: Colors.muted,
        lineHeight: 22,
        textAlign: 'center',
    },
    emptyTitle: {
        ...TextStyles.h3Bold,
        color: Colors.primaryBorder,
        marginBottom: 8,
        marginTop: 16,
    },
    formGroup: {
        marginBottom: 20,
    },
    headerContainer: {
        paddingBottom: 8,
        paddingHorizontal: 20,
        width: '100%',
    },
    heroIcon: {
        alignItems: 'center',
        backgroundColor: Colors.lightMuted,
        borderRadius: 32,
        height: 64,
        justifyContent: 'center',
        marginBottom: 16,
        width: 64,
    },
    heroSection: {
        alignItems: 'center',
        marginBottom: 16,
        paddingBottom: 8,
        paddingHorizontal: 32,
    },
    heroSubtitle: {
        ...TextStyles.body,
        color: Colors.muted,
        lineHeight: 22,
        textAlign: 'center',
    },
    heroTitle: {
        ...TextStyles.h2Bold,
        color: Colors.primaryBorder,
        marginBottom: 8,
        textAlign: 'center',
    },
    label: {
        ...TextStyles.bodyBold,
        color: Colors.primaryBorder,
        marginBottom: 8,
    },
    listContainer: {
        paddingBottom: 20,
    },
    loadingContainer: {
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    loadingText: {
        ...TextStyles.body,
        color: Colors.muted,
        marginTop: 16,
        textAlign: 'center',
    },
    modalCancelButton: {
        alignItems: 'center',
        borderColor: Colors.muted,
        borderRadius: 12,
        borderWidth: 1,
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 20,
        paddingVertical: 14,
    },
    modalCancelText: {
        ...TextStyles.bodyBold,
        color: Colors.muted,
    },
    modalContainer: {
        backgroundColor: Colors.white,
        flex: 1,
    },
    modalContent: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    modalContentContainer: {
        paddingBottom: 100
    },
    modalFooter: {
        backgroundColor: Colors.white,
        borderTopColor: Colors.lightMuted,
        borderTopWidth: 1,
        flexDirection: 'row',
        gap: 12,
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    modalHeader: {
        alignItems: 'center',
        borderBottomColor: Colors.lightMuted,
        borderBottomWidth: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    modalSaveButtonBottom: {
        alignItems: 'center',
        backgroundColor: Colors.primary,
        borderRadius: 12,
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 20,
        paddingVertical: 14,
    },
    modalSaveTextBottom: {
        ...TextStyles.bodyBold,
        color: Colors.white,
    },
    modalTitle: {
        ...TextStyles.h3Bold,
        color: Colors.primaryBorder,
    },
    noBinomesContainer: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    noBinomesSubtext: {
        ...TextStyles.small,
        color: Colors.muted,
        marginTop: 4,
        textAlign: 'center',
    },
    noBinomesText: {
        ...TextStyles.bodyBold,
        color: Colors.primaryBorder,
        marginTop: 12,
    },
    pickerModalClose: {
        ...TextStyles.bodyBold,
        color: Colors.primary,
    },
    pickerModalContent: {
        backgroundColor: Colors.white,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '80%',
    },
    pickerModalHeader: {
        alignItems: 'center',
        borderBottomColor: Colors.lightMuted,
        borderBottomWidth: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    pickerModalItem: {
        alignItems: 'center',
        borderBottomColor: Colors.lightMuted,
        borderBottomWidth: 1,
        flexDirection: 'row',
        gap: 12,
        padding: 16,
    },
    pickerModalItemDisabled: {
        opacity: 0.5,
    },
    pickerModalItemText: {
        ...TextStyles.body,
        color: Colors.primaryBorder,
        flex: 1,
    },
    pickerModalList: {
        maxHeight: 400,
    },
    pickerModalOverlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        flex: 1,
        justifyContent: 'flex-end',
    },
    pickerModalTitle: {
        ...TextStyles.h3Bold,
        color: Colors.primaryBorder,
    },
    primaryButton: {
        alignItems: 'center',
        backgroundColor: Colors.primary,
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    primaryButtonText: {
        ...TextStyles.bodyBold,
        color: Colors.white,
        marginLeft: 8,
    },
    progressBar: {
        backgroundColor: Colors.lightMuted,
        borderRadius: 3,
        height: 6,
        marginBottom: 16,
        overflow: 'hidden',
    },
    progressFill: {
        borderRadius: 3,
        height: '100%',
    },
    removeBinomeButton: {
        padding: 8,
    },
    sectionTitle: {
        ...TextStyles.h3Bold,
        color: Colors.primaryBorder,
    },
    selectButton: {
        borderColor: Colors.primary,
        borderRadius: 8,
        borderWidth: 1,
        marginTop: 6,
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    selectButtonText: {
        ...TextStyles.body,
        color: Colors.primaryBorder,
    },
    statRow: {
        alignItems: 'center',
        flexDirection: 'row',
        marginBottom: 6,
    },
    statText: {
        ...TextStyles.small,
        color: Colors.muted,
        marginLeft: 8,
    },
    statusBadge: {
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    statusText: {
        ...TextStyles.small,
        color: Colors.white,
        fontWeight: '600',
    },
    toggleButton: {
        backgroundColor: Colors.lightMuted,
    },
    tourCard: {
        backgroundColor: Colors.white,
        borderColor: 'rgba(0,0,0,0.06)',
        borderRadius: 16,
        borderWidth: 1,
        elevation: 3,
        marginBottom: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 5,
    },
});
