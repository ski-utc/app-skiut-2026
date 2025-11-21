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
    Platform,
} from 'react-native';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { apiGet, apiPost, apiPut, apiDelete } from '@/constants/api/apiCalls';
import BoutonRetour from '@/components/divers/boutonRetour';
import Header from '../../components/header';
import ErrorScreen from '@/components/pages/errorPage';
import { useUser } from '@/contexts/UserContext';
import { Colors, TextStyles } from '@/constants/GraphSettings';
import {
    Clock,
    Plus,
    Calendar,
    User,
    MapPin,
    Edit3,
    Trash2,
    Send,
    ChevronDown,
    ChevronRight,
    X as CloseIcon,
    FileText
} from 'lucide-react-native';
import Toast from 'react-native-toast-message';

interface Permanence {
    id: number;
    name: string;
    start_datetime: string;
    end_datetime: string;
    location: string;
    status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
    responsible: {
        id: number;
        name: string;
    };
    all_members: {
        id: number;
        name: string;
    }[];
    duration_minutes: number;
    notes?: string;
}

interface Member {
    id: number;
    firstName: string;
    lastName: string;
    name: string;
}

export default function GestionPermanencesScreen() {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState('');
    const [permanences, setPermanences] = useState<Permanence[]>([]);
    const [members, setMembers] = useState<Member[]>([]);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingPermanence, setEditingPermanence] = useState<Permanence | null>(null);

    const [formName, setFormName] = useState('');
    const [formLocation, setFormLocation] = useState('');
    const [formNotes, setFormNotes] = useState('');
    const [formStartDate, setFormStartDate] = useState(new Date());
    const [formEndDate, setFormEndDate] = useState(new Date());
    const [formResponsibleId, setFormResponsibleId] = useState<number | null>(null);
    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);
    const [formSubmitting, setFormSubmitting] = useState(false);
    const [showMembersPicker, setShowMembersPicker] = useState(false);

    const { setUser } = useUser();

    const showToast = (type: 'success' | 'info' | 'error', text1: string, text2: string) => {
        try {
            if (Toast && Toast.show) {
                Toast.show({ type, text1, text2 });
            }
        } catch (error) {
            console.warn('Toast error:', error);
        }
    };

    const openStartDatePicker = () => {
        if (Platform.OS === 'android') {
            DateTimePickerAndroid.open({
                value: formStartDate,
                onChange: (event: any, date?: Date) => {
                    if (date) {
                        setFormStartDate(date);
                        setTimeout(() => {
                            DateTimePickerAndroid.open({
                                value: date,
                                onChange: (timeEvent: any, timeDate?: Date) => {
                                    if (timeDate) {
                                        setFormStartDate(timeDate);
                                    }
                                },
                                mode: 'time',
                                is24Hour: true,
                            });
                        }, 100);
                    }
                },
                mode: 'date',
                is24Hour: true,
            });
        } else {
            setShowStartDatePicker(true);
        }
    };

    const openEndDatePicker = () => {
        if (Platform.OS === 'android') {
            DateTimePickerAndroid.open({
                value: formEndDate,
                onChange: (event: any, date?: Date) => {
                    if (date) {
                        setFormEndDate(date);
                        setTimeout(() => {
                            DateTimePickerAndroid.open({
                                value: date,
                                onChange: (timeEvent: any, timeDate?: Date) => {
                                    if (timeDate) {
                                        setFormEndDate(timeDate);
                                    }
                                },
                                mode: 'time',
                                is24Hour: true,
                            });
                        }, 100);
                    }
                },
                mode: 'date',
                is24Hour: true,
            });
        } else {
            setShowEndDatePicker(true);
        }
    };

    const fetchData = useCallback(async () => {
        try {
            const response = await apiGet("admin");
            if (!response.success) {
                setError("Accès non autorisé");
                return;
            }

            const permanencesResponse = await apiGet("admin/permanences");
            if (permanencesResponse.success) {
                setPermanences(permanencesResponse.data);
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
        setFormName('');
        setFormLocation('');
        setFormNotes('');
        setFormStartDate(new Date());
        setFormEndDate(new Date());
        setFormResponsibleId(null);
        setEditingPermanence(null);
    };

    const openCreateModal = () => {
        resetForm();
        setShowCreateModal(true);
    };

    const openEditModal = (permanence: Permanence) => {
        setFormName(permanence.name);
        setFormLocation(permanence.location);
        setFormNotes(permanence.notes || '');
        setFormStartDate(new Date(permanence.start_datetime));
        setFormEndDate(new Date(permanence.end_datetime));
        setFormResponsibleId(permanence.responsible.id);
        setEditingPermanence(permanence);
        setShowCreateModal(true);
    };

    const submitPermanence = async () => {
        if (!formName.trim() || !formResponsibleId) {
            showToast('error', 'Erreur', 'Veuillez remplir tous les champs obligatoires.');
            return;
        }

        const now = new Date();
        if (formStartDate <= now) {
            showToast('error', 'Erreur', 'La date de début doit être dans le futur.');
            return;
        }

        if (formStartDate >= formEndDate) {
            showToast('error', 'Erreur', 'L\'heure de fin doit être postérieure à l\'heure de début.');
            return;
        }

        setFormSubmitting(true);

        try {
            const data = {
                name: formName.trim(),
                location: formLocation.trim(),
                notes: formNotes.trim(),
                start_datetime: formStartDate.toISOString(),
                end_datetime: formEndDate.toISOString(),
                responsible_user_id: formResponsibleId,
            };

            const endpoint = editingPermanence ? `admin/permanences/${editingPermanence.id}` : 'admin/permanences';
            const method = editingPermanence ? 'PUT' : 'POST';

            const response = await (method === 'PUT' ?
                apiPut(endpoint, data) :
                apiPost(endpoint, data)
            );

            if (response.success) {
                showToast('success', 'Succès', `Permanence ${editingPermanence ? 'modifiée' : 'créée'} avec succès.`);
                setShowCreateModal(false);
                resetForm();
                fetchData();
            } else if (response.pending) {
                showToast('info', 'Requête sauvegardée', response.message);
                setShowCreateModal(false);
                resetForm();
                fetchData();
            } else {
                showToast('error', 'Erreur', response.message);
            }
        } catch (error: any) {
            setError(error.message || 'Une erreur est survenue.');
        } finally {
            setFormSubmitting(false);
        }
    };

    const deletePermanence = (permanence: Permanence) => {
        Alert.alert(
            'Supprimer la permanence',
            `Voulez-vous vraiment supprimer "${permanence.name}" ?`,
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Supprimer',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const response = await apiDelete(`admin/permanences/${permanence.id}`);
                            if (response.success) {
                                showToast('success', 'Succès', 'Permanence supprimée avec succès.');
                                fetchData();
                            } else if (response.pending) {
                                showToast('info', 'Requête sauvegardée', response.message);
                                fetchData();
                            } else {
                                showToast('error', 'Erreur', response.message);
                            }
                        } catch (error: any) {
                            setError(error.message || 'Une erreur est survenue.');
                            showToast('error', 'Erreur', error.message || 'Une erreur est survenue.');
                        }
                    }
                }
            ]
        );
    };

    const sendReminders = async () => {
        Alert.alert(
            'Envoyer des rappels',
            'Voulez-vous envoyer des rappels de permanence dans l\'heure à venir à tous les membres concernés ?',
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Envoyer',
                    onPress: async () => {
                        try {
                            const response = await apiPost('admin/permanences/send-reminders', {});
                            if (response.success) {
                                showToast('success', 'Succès', 'Rappels envoyés avec succès.');
                            } else if (response.pending) {
                                showToast('info', 'Requête sauvegardée', response.message);
                            } else {
                                showToast('error', 'Erreur', response.message);
                            }
                        } catch (error: any) {
                            setError(error.message || 'Une erreur est survenue.');
                            showToast('error', 'Erreur', error.message || 'Une erreur est survenue.');
                        }
                    }
                }
            ]
        );
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'in_progress': return Colors.primary;
            case 'completed': return Colors.success;
            case 'cancelled': return Colors.error;
            default: return null;
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'in_progress': return 'En cours';
            case 'completed': return 'Terminée';
            case 'cancelled': return 'Annulée';
            default: return null;
        }
    };

    const renderPermanenceCard = ({ item }: { item: Permanence }) => {
        const startDate = new Date(item.start_datetime);
        const endDate = new Date(item.end_datetime);

        return (
            <View style={styles.permanenceCard}>
                <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>{item.name}</Text>
                    <View style={[
                        styles.statusBadge,
                        { backgroundColor: getStatusColor(item.status) || Colors.white }
                    ]}>
                        <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
                    </View>
                </View>

                <View style={styles.cardDetails}>
                    <View style={styles.detailRow}>
                        <Calendar size={16} color={Colors.muted} />
                        <Text style={styles.detailText}>
                            {startDate.toLocaleDateString('fr-FR')} - {startDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} à {endDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                    </View>

                    <View style={styles.detailRow}>
                        <User size={16} color={Colors.muted} />
                        <Text style={styles.detailText}>Responsable: {item.responsible.name}</Text>
                    </View>

                    {item.location && (
                        <View style={styles.detailRow}>
                            <MapPin size={16} color={Colors.muted} />
                            <Text style={styles.detailText}>{item.location}</Text>
                        </View>
                    )}

                    <View style={styles.detailRow}>
                        <Clock size={16} color={Colors.muted} />
                        <Text style={styles.detailText}>Durée: {item.duration_minutes} minutes</Text>
                    </View>
                </View>

                <View style={styles.cardActions}>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.editButton]}
                        onPress={() => openEditModal(item)}
                    >
                        <Edit3 size={16} color={Colors.primary} />
                        <Text style={[styles.actionButtonText, { color: Colors.primary }]}>
                            Modifier
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionButton, styles.deleteButton]}
                        onPress={() => deletePermanence(item)}
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
                    <Text style={styles.loadingText}>Chargement des permanences...</Text>
                </View>
            </SafeAreaView>
        );
    }

    const filteredPermanences = permanences.filter(perm => {
        const endDate = new Date(perm.end_datetime);
        return endDate > new Date();
    });

    return (
        <SafeAreaView style={styles.container}>
            <Header refreshFunction={null} disableRefresh={true} />
            <View style={styles.headerContainer}>
                <BoutonRetour previousRoute="adminScreen" title="Gestion des Permanences" />
            </View>

            <View style={styles.heroSection}>
                <View style={styles.heroIcon}>
                    <Clock size={32} color={Colors.primary} />
                </View>
                <Text style={styles.heroTitle}>Permanences</Text>
                <Text style={styles.heroSubtitle}>
                    {filteredPermanences.length} permanence{filteredPermanences.length !== 1 ? 's' : ''} à venir
                </Text>
            </View>

            <View style={styles.actionsContainer}>
                <TouchableOpacity style={styles.primaryButton} onPress={openCreateModal}>
                    <Plus size={20} color={Colors.white} />
                    <Text style={styles.primaryButtonText}>Nouvelle permanence</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.secondaryButton} onPress={sendReminders}>
                    <Send size={20} color={Colors.primary} />
                    <Text style={styles.secondaryButtonText}>Envoyer rappels</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.contentContainer}>
                <FlatList
                    data={filteredPermanences}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderPermanenceCard}
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
                            <Clock size={48} color={Colors.muted} />
                            <Text style={styles.emptyTitle}>Aucune permanence</Text>
                            <Text style={styles.emptySubtitle}>
                                Créez votre première permanence pour commencer
                            </Text>
                        </View>
                    }
                />
            </View>

            <Modal
                visible={showCreateModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowCreateModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <View style={styles.modalHeader}>
                            <View style={styles.modalHeaderContent}>
                                <Clock size={24} color={Colors.primary} />
                                <Text style={styles.modalTitle}>
                                    {editingPermanence ? 'Modifier' : 'Nouvelle'} permanence
                                </Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => setShowCreateModal(false)}
                                style={styles.modalCloseButton}
                            >
                                <CloseIcon size={24} color={Colors.primaryBorder} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
                            <View style={styles.inputSection}>
                                <View style={styles.inputHeader}>
                                    <FileText size={16} color={Colors.primary} />
                                    <Text style={styles.inputLabel}>Nom de la permanence *</Text>
                                </View>
                                <TextInput
                                    style={styles.titleInput}
                                    value={formName}
                                    onChangeText={setFormName}
                                    placeholder="Ex: Maintenance matériel"
                                    placeholderTextColor={Colors.muted}
                                />
                            </View>

                            <View style={styles.inputSection}>
                                <View style={styles.inputHeader}>
                                    <MapPin size={16} color={Colors.primary} />
                                    <Text style={styles.inputLabel}>Lieu</Text>
                                </View>
                                <TextInput
                                    style={styles.titleInput}
                                    value={formLocation}
                                    onChangeText={setFormLocation}
                                    placeholder="Lieu de la permanence"
                                    placeholderTextColor={Colors.muted}
                                />
                            </View>

                            <View style={styles.selectionSection}>
                                <TouchableOpacity
                                    style={styles.selectionHeader}
                                    onPress={() => setShowMembersPicker(!showMembersPicker)}
                                >
                                    <View style={styles.selectionHeaderLeft}>
                                        <User size={16} color={Colors.primary} />
                                        <Text style={styles.selectionTitle}>
                                            Responsable * {formResponsibleId && `(${members.find(m => m.id === formResponsibleId)?.name})`}
                                        </Text>
                                    </View>
                                    {showMembersPicker ?
                                        <ChevronDown size={20} color={Colors.primary} /> :
                                        <ChevronRight size={20} color={Colors.primary} />
                                    }
                                </TouchableOpacity>

                                {showMembersPicker && (
                                    <ScrollView
                                        style={styles.selectionList}
                                        nestedScrollEnabled={true}
                                        showsVerticalScrollIndicator={true}
                                    >
                                        {members.map(member => (
                                            <TouchableOpacity
                                                key={member.id}
                                                style={[
                                                    styles.selectionItem,
                                                    formResponsibleId === member.id && styles.selectionItemActive
                                                ]}
                                                onPress={() => {
                                                    setFormResponsibleId(member.id);
                                                    setShowMembersPicker(false);
                                                }}
                                            >
                                                <Text style={[
                                                    styles.selectionItemText,
                                                    formResponsibleId === member.id && styles.selectionItemTextActive
                                                ]}>
                                                    {member.name}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                )}
                            </View>

                            <View style={styles.dateTimeSection}>
                                <Text style={styles.sectionTitle}>Horaires *</Text>

                                <View style={styles.dateTimeRow}>
                                    <View style={styles.dateTimeItem}>
                                        <Text style={styles.dateTimeLabel}>Début</Text>
                                        <TouchableOpacity
                                            style={styles.dateTimeButton}
                                            onPress={openStartDatePicker}
                                        >
                                            <Calendar size={16} color={Colors.primary} strokeWidth={2.5} />
                                            <View style={styles.dateTimeTextContainer}>
                                                <Text style={styles.dateTimeText}>
                                                    {formStartDate.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                                                </Text>
                                                <Text style={styles.dateTimeTime}>
                                                    {formStartDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                                </Text>
                                            </View>
                                        </TouchableOpacity>
                                    </View>

                                    <View style={styles.dateTimeItem}>
                                        <Text style={styles.dateTimeLabel}>Fin</Text>
                                        <TouchableOpacity
                                            style={styles.dateTimeButton}
                                            onPress={openEndDatePicker}
                                        >
                                            <Calendar size={16} color={Colors.primary} strokeWidth={2.5} />
                                            <View style={styles.dateTimeTextContainer}>
                                                <Text style={styles.dateTimeText}>
                                                    {formEndDate.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                                                </Text>
                                                <Text style={styles.dateTimeTime}>
                                                    {formEndDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                                </Text>
                                            </View>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>

                            <View style={styles.inputSection}>
                                <View style={styles.inputHeader}>
                                    <FileText size={16} color={Colors.primary} />
                                    <Text style={styles.inputLabel}>Notes</Text>
                                </View>
                                <TextInput
                                    style={styles.textAreaInput}
                                    value={formNotes}
                                    onChangeText={setFormNotes}
                                    placeholder="Notes additionnelles..."
                                    placeholderTextColor={Colors.muted}
                                    multiline
                                    numberOfLines={4}
                                    textAlignVertical="top"
                                />
                            </View>
                        </ScrollView>

                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                onPress={() => setShowCreateModal(false)}
                                style={styles.modalCancelButton}
                            >
                                <Text style={styles.modalCancelText}>Annuler</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={submitPermanence}
                                style={[styles.modalSaveButton, (!formName.trim() || !formResponsibleId) && styles.modalSaveButtonDisabled]}
                                disabled={formSubmitting || !formName.trim() || !formResponsibleId}
                            >
                                {formSubmitting ? (
                                    <ActivityIndicator size="small" color={Colors.white} />
                                ) : (
                                    <>
                                        <Send size={18} color={Colors.white} />
                                        <Text style={styles.modalSaveText}>
                                            {editingPermanence ? 'Modifier' : 'Créer'}
                                        </Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {Platform.OS === 'ios' && showStartDatePicker && (
                <DateTimePicker
                    value={formStartDate}
                    mode="datetime"
                    display="spinner"
                    onChange={(event: any, selectedDate?: Date) => {
                        if (selectedDate) {
                            setFormStartDate(selectedDate);
                        }
                        setShowStartDatePicker(false);
                    }}
                />
            )}

            {Platform.OS === 'ios' && showEndDatePicker && (
                <DateTimePicker
                    value={formEndDate}
                    mode="datetime"
                    display="spinner"
                    onChange={(event: any, selectedDate?: Date) => {
                        if (selectedDate) {
                            setFormEndDate(selectedDate);
                        }
                        setShowEndDatePicker(false);
                    }}
                />
            )}
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
        flexDirection: 'row',
        paddingHorizontal: 20,
        marginBottom: 16,
        gap: 12,
    },
    primaryButton: {
        flex: 1,
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
    secondaryButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.lightMuted,
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 16,
    },
    secondaryButtonText: {
        ...TextStyles.bodyBold,
        color: Colors.primary,
        marginLeft: 8,
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: 20,
    },
    listContainer: {
        paddingBottom: 20,
    },
    permanenceCard: {
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
        marginBottom: 12,
    },
    cardTitle: {
        ...TextStyles.bodyBold,
        color: Colors.primaryBorder,
        flex: 1,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 16,
    },
    statusText: {
        ...TextStyles.small,
        color: Colors.white,
        fontWeight: '600',
    },
    cardDetails: {
        marginBottom: 16,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    detailText: {
        ...TextStyles.small,
        color: Colors.muted,
        marginLeft: 8,
        flex: 1,
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
    editButton: {
        backgroundColor: Colors.lightMuted,
    },
    deleteButton: {
        backgroundColor: 'rgba(220, 53, 69, 0.1)',
    },
    actionButtonText: {
        ...TextStyles.small,
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalCard: {
        backgroundColor: Colors.white,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '90%',
        shadowColor: '#000',
        shadowOpacity: 0.25,
        shadowOffset: { width: 0, height: -4 },
        shadowRadius: 12,
        elevation: 10,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 24,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.lightMuted,
    },
    modalHeaderContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    modalCloseButton: {
        padding: 4,
    },
    modalTitle: {
        ...TextStyles.h3Bold,
        color: Colors.primaryBorder,
    },
    modalContent: {
        paddingHorizontal: 20,
        paddingTop: 20,
        maxHeight: '70%',
    },
    inputSection: {
        marginBottom: 20,
    },
    inputHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 8,
    },
    inputLabel: {
        ...TextStyles.body,
        color: Colors.primaryBorder,
        fontWeight: '600',
    },
    titleInput: {
        ...TextStyles.body,
        color: Colors.primaryBorder,
        backgroundColor: Colors.white,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.primary,
        padding: 14,
        height: 50,
    },
    textAreaInput: {
        ...TextStyles.body,
        color: Colors.primaryBorder,
        backgroundColor: Colors.white,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.primary,
        padding: 14,
        minHeight: 100,
        textAlignVertical: 'top',
    },
    sectionTitle: {
        ...TextStyles.bodyBold,
        color: Colors.primaryBorder,
        marginBottom: 12,
    },
    selectionSection: {
        marginBottom: 20,
        borderWidth: 1,
        borderColor: Colors.lightMuted,
        borderRadius: 12,
        overflow: 'hidden',
    },
    selectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: Colors.lightMuted,
    },
    selectionHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flex: 1,
    },
    selectionTitle: {
        ...TextStyles.body,
        color: Colors.primaryBorder,
        fontWeight: '600',
        flex: 1,
    },
    selectionList: {
        backgroundColor: Colors.white,
        maxHeight: 200,
    },
    selectionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.lightMuted,
    },
    selectionItemActive: {
        backgroundColor: Colors.lightMuted,
    },
    selectionItemText: {
        ...TextStyles.body,
        color: Colors.primaryBorder,
        flex: 1,
    },
    selectionItemTextActive: {
        color: Colors.primary,
        fontWeight: '600',
    },
    dateTimeSection: {
        marginBottom: 20,
    },
    dateTimeRow: {
        flexDirection: 'row',
        gap: 12,
    },
    dateTimeItem: {
        flex: 1,
    },
    dateTimeLabel: {
        ...TextStyles.small,
        color: Colors.muted,
        fontWeight: '600',
        marginBottom: 8,
    },
    dateTimeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: Colors.lightMuted,
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: Colors.primary,
    },
    dateTimeTextContainer: {
        flex: 1,
    },
    dateTimeText: {
        ...TextStyles.small,
        color: Colors.primaryBorder,
        fontWeight: '600',
    },
    dateTimeTime: {
        ...TextStyles.small,
        color: Colors.muted,
        marginTop: 2,
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
    modalSaveButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 12,
        backgroundColor: Colors.primary,
    },
    modalSaveButtonDisabled: {
        backgroundColor: Colors.muted,
        opacity: 0.5,
    },
    modalSaveText: {
        ...TextStyles.bodyBold,
        color: Colors.white,
    },
});
