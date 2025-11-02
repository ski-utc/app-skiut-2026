import React, { useState, useEffect, useCallback } from 'react';
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
import { apiGet, apiPost } from '@/constants/api/apiCalls';
import BoutonRetour from '@/components/divers/boutonRetour';
import Header from '../../components/header';
import ErrorScreen from '@/components/pages/errorPage';
import { useUser } from '@/contexts/UserContext';
import { Colors, TextStyles } from '@/constants/GraphSettings';
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
import Checkbox from 'expo-checkbox';

interface RoomTour {
    id: number;
    tour_date: string;
    is_active: boolean;
    binomes_count: number;
    total_rooms: number;
    visited_rooms: number;
    progress_percentage: number;
    created_at: string;
}

interface Room {
    room_id: string;
    occupants: Array<{
        id: number;
        name: string;
    }>;
    occupants_count: number;
}

interface Member {
    id: number;
    firstName: string;
    lastName: string;
    name: string;
}

interface Binome {
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

    // Modal states
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [formSubmitting, setFormSubmitting] = useState(false);
    const [showMemberPicker, setShowMemberPicker] = useState<number | null>(null); // Index du binôme
    const [showRoomPicker, setShowRoomPicker] = useState<number | null>(null); // Index du binôme

    // Form states
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

            // Récupérer les tournées
            const toursResponse = await apiGet("room-tours");
            if (toursResponse.success) {
                setTours(toursResponse.data);
            }

            // Récupérer les chambres disponibles
            const roomsResponse = await apiGet("room-tours/available-rooms");
            if (roomsResponse.success) {
                setRooms(roomsResponse.data);
            }

            // Récupérer les membres
            const membersResponse = await apiGet("permanences/members");
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
            Alert.alert('Erreur', 'Veuillez ajouter au moins un binôme.');
            return;
        }

        for (let i = 0; i < binomes.length; i++) {
            const binome = binomes[i];
            if (binome.member_ids.length === 0 || binome.assigned_rooms.length === 0) {
                Alert.alert('Erreur', `Le ${binome.name} doit avoir au moins un membre et une chambre assignée.`);
                return;
            }
        }

        setFormSubmitting(true);

        try {
            const data = {
                tour_date: formDate.toISOString().split('T')[0],
                binomes: binomes
            };

            const response = await apiPost('room-tours', data);

            if (response.success) {
                Alert.alert('Succès', 'Tournée créée avec succès.');
                setShowCreateModal(false);
                resetForm();
                fetchData();
            } else {
                Alert.alert('Erreur', response.message);
            }
        } catch (error: any) {
            Alert.alert('Erreur', 'Impossible de créer la tournée.');
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
                            const response = await apiPost(`room-tours/${tour.id}/toggle`, {
                                activate: !tour.is_active
                            });

                            if (response.success) {
                                Alert.alert('Succès', response.message);
                                fetchData();
                            } else {
                                Alert.alert('Erreur', response.message);
                            }
                        }
                    }
                ]
            );
        } catch (error) {
            Alert.alert('Erreur', 'Impossible de modifier la tournée.');
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
                            const response = await apiPost(`room-tours/${tour.id}`, {}, 'DELETE');
                            if (response.success) {
                                Alert.alert('Succès', 'Tournée supprimée avec succès.');
                                fetchData();
                            } else {
                                Alert.alert('Erreur', response.message);
                            }
                        } catch (error) {
                            Alert.alert('Erreur', 'Impossible de supprimer la tournée.');
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
                        { backgroundColor: getStatusColor(item) }
                    ]}>
                        <Text style={styles.statusText}>{getStatusText(item)}</Text>
                    </View>
                </View>

                <View style={styles.cardStats}>
                    {/* <View style={styles.statRow}>
                        <Users size={16} color={Colors.muted} />
                        <Text style={styles.statText}>{item.binomes_count} binôme{item.binomes_count !== 1 ? 's' : ''}</Text>
                    </View> */}

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
                <BoutonRetour previousRoute="adminScreen" title="Tournée des Chambres" />
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

            {/* Modal de création */}
            <Modal
                visible={showCreateModal}
                animationType="slide"
                presentationStyle="pageSheet"
            >
                <SafeAreaView style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Nouvelle tournée</Text>
                    </View>

                    <ScrollView style={styles.modalContent} contentContainerStyle={{ paddingBottom: 100 }}>
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

                    {/* Boutons en bas */}
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

                    {/* Modal de sélection membres */}
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

                    {/* Modal de sélection chambres */}
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
    container: {
        flex: 1,
        backgroundColor: Colors.white,
    },
    headerContainer: {
        width: '100%',
        paddingHorizontal: 20,
        paddingBottom: 8,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    loadingText: {
        ...TextStyles.body,
        color: Colors.muted,
        marginTop: 16,
        textAlign: 'center',
    },
    heroSection: {
        alignItems: 'center',
        paddingHorizontal: 32,
        paddingBottom: 8,
        marginBottom: 16,
    },
    heroIcon: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: Colors.lightMuted,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    heroTitle: {
        ...TextStyles.h2Bold,
        color: Colors.primaryBorder,
        textAlign: 'center',
        marginBottom: 8,
    },
    heroSubtitle: {
        ...TextStyles.body,
        color: Colors.muted,
        textAlign: 'center',
        lineHeight: 22,
    },
    actionsContainer: {
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    primaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.primary,
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 16,
    },
    primaryButtonText: {
        ...TextStyles.bodyBold,
        color: Colors.white,
        marginLeft: 8,
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: 20,
    },
    listContainer: {
        paddingBottom: 20,
    },
    tourCard: {
        backgroundColor: Colors.white,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.06)',
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowOffset: { width: 2, height: 3 },
        shadowRadius: 5,
        elevation: 3,
        marginBottom: 16,
        padding: 16,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    cardTitle: {
        ...TextStyles.bodyBold,
        color: Colors.primaryBorder,
        flex: 1,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        ...TextStyles.small,
        color: Colors.white,
        fontWeight: '600',
    },
    cardStats: {
        marginBottom: 12,
    },
    statRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    statText: {
        ...TextStyles.small,
        color: Colors.muted,
        marginLeft: 8,
    },
    progressBar: {
        height: 6,
        backgroundColor: Colors.lightMuted,
        borderRadius: 3,
        marginBottom: 16,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 3,
    },
    cardActions: {
        flexDirection: 'row',
        gap: 12,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    toggleButton: {
        backgroundColor: Colors.lightMuted,
    },
    deleteButton: {
        backgroundColor: 'rgba(220, 53, 69, 0.1)',
    },
    actionButtonText: {
        ...TextStyles.body,
        fontWeight: '600',
        marginLeft: 6,
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyTitle: {
        ...TextStyles.h3Bold,
        color: Colors.primaryBorder,
        marginTop: 16,
        marginBottom: 8,
    },
    emptySubtitle: {
        ...TextStyles.body,
        color: Colors.muted,
        textAlign: 'center',
        lineHeight: 22,
    },
    // Modal styles
    modalContainer: {
        flex: 1,
        backgroundColor: Colors.white,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.lightMuted,
    },
    modalCloseButton: {
        paddingVertical: 8,
    },
    modalCloseText: {
        ...TextStyles.body,
        color: Colors.danger,
    },
    modalTitle: {
        ...TextStyles.h3Bold,
        color: Colors.primaryBorder,
    },
    modalSaveButton: {
        paddingVertical: 8,
    },
    modalSaveText: {
        ...TextStyles.bodyBold,
        color: Colors.primary,
    },
    modalContent: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    formGroup: {
        marginBottom: 20,
    },
    label: {
        ...TextStyles.bodyBold,
        color: Colors.primaryBorder,
        marginBottom: 8,
    },
    dateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.lightMuted,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    dateText: {
        ...TextStyles.body,
        color: Colors.primaryBorder,
        marginLeft: 8,
    },
    binomesSection: {
        marginBottom: 20,
    },
    binomesHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        ...TextStyles.h3Bold,
        color: Colors.primaryBorder,
    },
    addBinomeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.primary,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    addBinomeText: {
        ...TextStyles.small,
        color: Colors.white,
        marginLeft: 6,
        fontWeight: '600',
    },
    binomeCard: {
        backgroundColor: Colors.lightMuted,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    binomeHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    binomeNameInput: {
        flex: 1,
        ...TextStyles.bodyBold,
        color: Colors.primaryBorder,
        borderBottomWidth: 1,
        borderBottomColor: Colors.primary,
        paddingVertical: 4,
    },
    removeBinomeButton: {
        padding: 8,
    },
    binomeLabel: {
        ...TextStyles.small,
        color: Colors.primaryBorder,
        fontWeight: '600',
        marginTop: 8,
    },
    binomeSubLabel: {
        ...TextStyles.small,
        color: Colors.muted,
        marginTop: 2,
    },
    noBinomesContainer: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    noBinomesText: {
        ...TextStyles.bodyBold,
        color: Colors.primaryBorder,
        marginTop: 12,
    },
    noBinomesSubtext: {
        ...TextStyles.small,
        color: Colors.muted,
        textAlign: 'center',
        marginTop: 4,
    },
    binomeField: {
        marginTop: 12,
    },
    selectButton: {
        borderWidth: 1,
        borderColor: Colors.primary,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginTop: 6,
    },
    selectButtonText: {
        ...TextStyles.body,
        color: Colors.primaryBorder,
    },
    modalFooter: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: Colors.lightMuted,
        backgroundColor: Colors.white,
        gap: 12,
    },
    modalCancelButton: {
        flex: 1,
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.muted,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalCancelText: {
        ...TextStyles.bodyBold,
        color: Colors.muted,
    },
    modalSaveButtonBottom: {
        flex: 1,
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 12,
        backgroundColor: Colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalSaveTextBottom: {
        ...TextStyles.bodyBold,
        color: Colors.white,
    },
    pickerModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    pickerModalContent: {
        backgroundColor: Colors.white,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '80%',
    },
    pickerModalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.lightMuted,
    },
    pickerModalTitle: {
        ...TextStyles.h3Bold,
        color: Colors.primaryBorder,
    },
    pickerModalClose: {
        ...TextStyles.bodyBold,
        color: Colors.primary,
    },
    pickerModalList: {
        maxHeight: 400,
    },
    pickerModalItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.lightMuted,
        gap: 12,
    },
    pickerModalItemDisabled: {
        opacity: 0.5,
    },
    pickerModalItemText: {
        ...TextStyles.body,
        color: Colors.primaryBorder,
        flex: 1,
    },
});
