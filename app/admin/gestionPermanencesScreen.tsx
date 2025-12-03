import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, RefreshControl, Modal, TextInput, ScrollView, Platform, } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker, { DateTimePickerAndroid, DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Clock, Plus, Calendar, User, MapPin, Edit3, Trash2, Send, ChevronDown, ChevronRight, X as CloseIcon, FileText } from 'lucide-react-native';
import Toast from 'react-native-toast-message';

import { apiGet, apiPost, apiPut, apiDelete, isSuccessResponse, isPendingResponse, handleApiErrorToast, handleApiErrorScreen, AppError } from '@/constants/api/apiCalls';
import BoutonRetour from '@/components/divers/boutonRetour';
import ErrorScreen from '@/components/pages/errorPage';
import { useUser } from '@/contexts/UserContext';
import { Colors, TextStyles } from '@/constants/GraphSettings';

import Header from '../../components/header';

type PermanenceStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

type Permanence = {
    id: number;
    name: string;
    start_datetime: string;
    end_datetime: string;
    location: string;
    status: PermanenceStatus;
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

type Member = {
    id: number;
    firstName: string;
    lastName: string;
    name: string;
}

type PermanencePayload = {
    name: string;
    location: string;
    notes: string;
    start_datetime: string;
    end_datetime: string;
    responsible_user_id: number;
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

    const openStartDatePicker = () => {
        if (Platform.OS === 'android') {
            DateTimePickerAndroid.open({
                value: formStartDate,
                onChange: (event: DateTimePickerEvent, date?: Date) => {
                    if (event.type === 'set' && date) {
                        setFormStartDate(date);
                        DateTimePickerAndroid.open({
                            value: date,
                            onChange: (timeEvent: DateTimePickerEvent, timeDate?: Date) => {
                                if (timeEvent.type === 'set' && timeDate) {
                                    setFormStartDate(timeDate);
                                }
                            },
                            mode: 'time',
                            is24Hour: true,
                        });
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
                onChange: (event: DateTimePickerEvent, date?: Date) => {
                    if (event.type === 'set' && date) {
                        setFormEndDate(date);
                        DateTimePickerAndroid.open({
                            value: date,
                            onChange: (timeEvent: DateTimePickerEvent, timeDate?: Date) => {
                                if (timeEvent.type === 'set' && timeDate) {
                                    setFormEndDate(timeDate);
                                }
                            },
                            mode: 'time',
                            is24Hour: true,
                        });
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
        if (!refreshing) setLoading(true);
        setError('');

        try {
            const [permsRes, membersRes] = await Promise.all([
                apiGet<Permanence[]>("admin/permanences"),
                apiGet<Member[]>("admin/permanences/members")
            ]);

            if (isSuccessResponse(permsRes)) setPermanences(permsRes.data);
            if (isSuccessResponse(membersRes)) setMembers(membersRes.data);

        } catch (err: unknown) {
            if (refreshing) {
                handleApiErrorToast(err as AppError, setUser);
            } else {
                handleApiErrorScreen(err, setUser, setError);
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [refreshing, setUser]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
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
            Toast.show({ type: 'error', text1: 'Erreur', text2: 'Veuillez remplir tous les champs obligatoires.' });
            return;
        }
        if (formStartDate <= new Date()) {
            Toast.show({ type: 'error', text1: 'Erreur', text2: 'La date de début doit être dans le futur.' });
            return;
        }
        if (formStartDate >= formEndDate) {
            Toast.show({ type: 'error', text1: 'Erreur', text2: 'L\'heure de fin doit être postérieure au début.' });
            return;
        }

        setFormSubmitting(true);

        try {
            const payload: PermanencePayload = {
                name: formName.trim(),
                location: formLocation.trim(),
                notes: formNotes.trim(),
                start_datetime: formStartDate.toISOString(),
                end_datetime: formEndDate.toISOString(),
                responsible_user_id: formResponsibleId,
            };

            const endpoint = editingPermanence ? `admin/permanences/${editingPermanence.id}` : 'admin/permanences';
            const response = editingPermanence
                ? await apiPut(endpoint, payload)
                : await apiPost(endpoint, payload);

            if (isSuccessResponse(response)) {
                Toast.show({
                    type: 'success',
                    text1: 'Succès',
                    text2: `Permanence ${editingPermanence ? 'modifiée' : 'créée'} avec succès.`
                });
                setShowCreateModal(false);
                resetForm();
                fetchData();
            } else if (isPendingResponse(response)) {
                Toast.show({
                    type: 'info',
                    text1: 'Requête sauvegardée',
                    text2: response.message
                });
                setShowCreateModal(false);
                resetForm();
                fetchData();
            } else {
                Toast.show({ type: 'error', text1: 'Erreur', text2: response.message });
            }
        } catch (err: unknown) {
            handleApiErrorToast(err as AppError, setUser);
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

                            if (isSuccessResponse(response)) {
                                Toast.show({ type: 'success', text1: 'Succès', text2: 'Permanence supprimée.' });
                                setPermanences(prev => prev.filter(p => p.id !== permanence.id));
                            } else if (isPendingResponse(response)) {
                                Toast.show({ type: 'info', text1: 'Sauvegardé', text2: 'Suppression en attente de connexion.' });
                                setPermanences(prev => prev.filter(p => p.id !== permanence.id));
                            } else {
                                Toast.show({ type: 'error', text1: 'Erreur', text2: response.message });
                            }
                        } catch (err: unknown) {
                            handleApiErrorToast(err as AppError, setUser);
                        }
                    }
                }
            ]
        );
    };

    const sendReminders = async () => {
        Alert.alert(
            'Envoyer des rappels',
            'Envoyer des rappels pour les permanences dans l\'heure à venir ?',
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Envoyer',
                    onPress: async () => {
                        try {
                            const response = await apiPost('admin/permanences/send-reminders', {});
                            if (isSuccessResponse(response)) {
                                Toast.show({ type: 'success', text1: 'Succès', text2: 'Rappels envoyés.' });
                            } else {
                                Toast.show({ type: 'error', text1: 'Erreur', text2: response.message });
                            }
                        } catch (err: unknown) {
                            handleApiErrorToast(err as AppError, setUser);
                        }
                    }
                }
            ]
        );
    };

    const getStatusColor = (status: PermanenceStatus) => {
        switch (status) {
            case 'in_progress': return Colors.primary;
            case 'completed': return Colors.success;
            case 'cancelled': return Colors.error;
            default: return null;
        }
    };

    const getStatusText = (status: PermanenceStatus) => {
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
                    {item.status !== 'scheduled' && (
                        <View style={[
                            styles.statusBadge,
                            { backgroundColor: getStatusColor(item.status) || Colors.white }
                        ]}>
                            <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
                        </View>
                    )}
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

    if (error) {
        return <ErrorScreen error={error} />;
    }

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <Header refreshFunction={null} disableRefresh={true} />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                    <Text style={styles.loadingText}>Chargement...</Text>
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
            <Header refreshFunction={onRefresh} disableRefresh={refreshing} />

            <View style={styles.headerContainer}>
                <BoutonRetour title="Gestion des Permanences" />
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
                animationType="fade"
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
                            {/* Name */}
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
                    onChange={(event: DateTimePickerEvent, selectedDate?: Date) => {
                        if (event && selectedDate) setFormStartDate(selectedDate);
                        setShowStartDatePicker(false);
                    }}
                />
            )}

            {Platform.OS === 'ios' && showEndDatePicker && (
                <DateTimePicker
                    value={formEndDate}
                    mode="datetime"
                    display="spinner"
                    onChange={(event: DateTimePickerEvent, selectedDate?: Date) => {
                        if (event && selectedDate) setFormEndDate(selectedDate);
                        setShowEndDatePicker(false);
                    }}
                />
            )}
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
        ...TextStyles.small,
        fontWeight: '600',
        marginLeft: 6,
    },
    actionsContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
        paddingHorizontal: 20,
    },
    cardActions: {
        flexDirection: 'row',
        gap: 12,
    },
    cardDetails: {
        marginBottom: 16,
    },
    cardHeader: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
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
    dateTimeButton: {
        alignItems: 'center',
        backgroundColor: Colors.lightMuted,
        borderColor: Colors.primary,
        borderRadius: 12,
        borderWidth: 1,
        flexDirection: 'row',
        gap: 8,
        padding: 12,
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
    dateTimeRow: {
        flexDirection: 'row',
        gap: 12,
    },
    dateTimeSection: {
        marginBottom: 20,
    },
    dateTimeText: {
        ...TextStyles.small,
        color: Colors.primaryBorder,
        fontWeight: '600',
    },
    dateTimeTextContainer: {
        flex: 1,
    },
    dateTimeTime: {
        ...TextStyles.small,
        color: Colors.muted,
        marginTop: 2,
    },
    deleteButton: {
        backgroundColor: 'rgba(220, 53, 69, 0.1)',
    },
    detailRow: {
        alignItems: 'center',
        flexDirection: 'row',
        marginBottom: 6,
    },
    detailText: {
        ...TextStyles.small,
        color: Colors.muted,
        flex: 1,
        marginLeft: 8,
    },
    editButton: {
        backgroundColor: Colors.lightMuted,
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
    inputHeader: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: 8,
        marginBottom: 8,
    },
    inputLabel: {
        ...TextStyles.body,
        color: Colors.primaryBorder,
        fontWeight: '600',
    },
    inputSection: {
        marginBottom: 30,
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
    modalCard: {
        backgroundColor: Colors.white,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        elevation: 10,
        maxHeight: '80%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
    },
    modalCloseButton: {
        padding: 4,
    },
    modalContent: {
        maxHeight: '75%',
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    modalFooter: {
        backgroundColor: Colors.white,
        borderTopColor: Colors.lightMuted,
        borderTopWidth: 1,
        flexDirection: 'row',
        gap: 12,
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    modalHeader: {
        alignItems: 'center',
        borderBottomColor: Colors.lightMuted,
        borderBottomWidth: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingBottom: 16,
        paddingHorizontal: 20,
        paddingTop: 24,
    },
    modalHeaderContent: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: 12,
    },
    modalOverlay: {
        backgroundColor: 'rgba(0,0,0,0.5)',
        flex: 1,
        justifyContent: 'flex-end',
    },
    modalSaveButton: {
        alignItems: 'center',
        backgroundColor: Colors.primary,
        borderRadius: 12,
        flex: 1,
        flexDirection: 'row',
        gap: 8,
        justifyContent: 'center',
        paddingHorizontal: 20,
        paddingVertical: 14,
    },
    modalSaveButtonDisabled: {
        backgroundColor: Colors.muted,
        opacity: 0.5,
    },
    modalSaveText: {
        ...TextStyles.bodyBold,
        color: Colors.white,
    },
    modalTitle: {
        ...TextStyles.h3Bold,
        color: Colors.primaryBorder,
    },
    permanenceCard: {
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
    primaryButton: {
        alignItems: 'center',
        backgroundColor: Colors.primary,
        borderRadius: 12,
        flex: 1,
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
    secondaryButton: {
        alignItems: 'center',
        backgroundColor: Colors.lightMuted,
        borderRadius: 12,
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    secondaryButtonText: {
        ...TextStyles.bodyBold,
        color: Colors.primary,
        marginLeft: 8,
    },
    sectionTitle: {
        ...TextStyles.bodyBold,
        color: Colors.primaryBorder,
        marginBottom: 12,
    },
    selectionHeader: {
        alignItems: 'center',
        backgroundColor: Colors.lightMuted,
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 16,
    },
    selectionHeaderLeft: {
        alignItems: 'center',
        flexDirection: 'row',
        flex: 1,
        gap: 8,
    },
    selectionItem: {
        alignItems: 'center',
        borderBottomColor: Colors.lightMuted,
        borderBottomWidth: 1,
        flexDirection: 'row',
        padding: 16,
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
    selectionList: {
        backgroundColor: Colors.white,
        maxHeight: 200,
    },
    selectionSection: {
        borderColor: Colors.lightMuted,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 20,
        overflow: 'hidden',
    },
    selectionTitle: {
        ...TextStyles.body,
        color: Colors.primaryBorder,
        flex: 1,
        fontWeight: '600',
    },
    statusBadge: {
        borderRadius: 16,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    statusText: {
        ...TextStyles.small,
        color: Colors.white,
        fontWeight: '600',
    },
    textAreaInput: {
        ...TextStyles.body,
        backgroundColor: Colors.white,
        borderColor: Colors.primary,
        borderRadius: 12,
        borderWidth: 1,
        color: Colors.primaryBorder,
        minHeight: 100,
        padding: 14,
        textAlignVertical: 'top',
    },
    titleInput: {
        ...TextStyles.body,
        backgroundColor: Colors.white,
        borderColor: Colors.primary,
        borderRadius: 12,
        borderWidth: 1,
        color: Colors.primaryBorder,
        height: 50,
        padding: 14,
    },
});
