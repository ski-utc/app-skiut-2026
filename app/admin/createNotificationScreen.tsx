import { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, ActivityIndicator, Platform, KeyboardAvoidingView, SafeAreaView, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Checkbox } from 'expo-checkbox';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { Send, PenTool, FileText, Users, Home, Globe, ChevronDown, ChevronRight } from 'lucide-react-native';
import Toast from 'react-native-toast-message';

import { useUser } from '@/contexts/UserContext';
import BoutonRetour from '@/components/divers/boutonRetour';
import BoutonActiverLarge from '@/components/divers/boutonActiverLarge';
import { apiPost, apiGet, AppError, handleApiErrorScreen, ApiError, handleApiErrorToast } from '@/constants/api/apiCalls';
import ErrorScreen from '@/components/pages/errorPage';
import { Colors, TextStyles } from '@/constants/GraphSettings';

import Header from "../../components/header";

type CreateNotificationStackParamList = {
    createNotificationScreen: undefined;
}

type User = {
    id: number;
    name: string;
    roomId: number;
    admin: boolean;
}

type Room = {
    id: number;
    roomNumber: number;
    name: string;
}

type RecipientsResponse = {
    users: User[];
    rooms: Room[];
}

type NotificationResponse = {
    recipients_count: number;
}

export default function CreateNotificationScreen() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState<'global' | 'targeted' | 'room_based'>('global');
    const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
    const [selectedRooms, setSelectedRooms] = useState<number[]>([]);
    const [sendPush, setSendPush] = useState(true);
    const [display, setDisplay] = useState(true);
    const [isChecked, setChecked] = useState(false);
    const [users, setUsers] = useState<User[]>([]);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [showUsersPicker, setShowUsersPicker] = useState(false);
    const [showRoomsPicker, setShowRoomsPicker] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [dataLoading, setDataLoading] = useState(true);

    const navigation = useNavigation<NavigationProp<CreateNotificationStackParamList>>();
    const { setUser } = useUser();

    const fetchRecipientsData = useCallback(async () => {
        try {
            setDataLoading(true);
            const response = await apiGet<RecipientsResponse>('admin/notifications/recipients');
            if (response.success) {
                setUsers(response.data.users);
                setRooms(response.data.rooms);
            } else {
                handleApiErrorScreen(new ApiError(response.message), setUser, setError);
            }
        } catch (error: unknown) {
            handleApiErrorScreen(error as AppError, setUser, setError);
        } finally {
            setDataLoading(false);
        }
    }, [setUser]);

    useEffect(() => {
        fetchRecipientsData();
    }, [fetchRecipientsData]);

    const handleSendNotification = async () => {
        setLoading(true);
        try {
            const payload = {
                title,
                description,
                type,
                target_users: type === 'targeted' ? selectedUsers : null,
                target_rooms: type === 'room_based' ? selectedRooms : null,
                send_push: sendPush,
                display
            };

            const response = await apiPost<NotificationResponse>('admin/notifications', payload);
            if (response.success) {
                Toast.show({
                    type: 'success',
                    text1: 'Notification créée !',
                    text2: `Envoyée à ${response.data.recipients_count} personnes`,
                });
                navigation.goBack();
            } else if (response.pending) {
                Toast.show({
                    type: 'info',
                    text1: 'Requête sauvegardée',
                    text2: response.message,
                });
                navigation.goBack();
            } else {
                handleApiErrorToast(new ApiError(response.message), setUser);
            }
        } catch (error: unknown) {
            handleApiErrorToast(error as AppError, setUser);
        } finally {
            setLoading(false);
        }
    };

    const handleUserSelection = (userId: number) => {
        setSelectedUsers(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    const handleRoomSelection = (roomId: number) => {
        setSelectedRooms(prev =>
            prev.includes(roomId)
                ? prev.filter(id => id !== roomId)
                : [...prev, roomId]
        );
    };

    const getRecipientsCount = () => {
        switch (type) {
            case 'global':
                return users.length;
            case 'targeted':
                return selectedUsers.length;
            case 'room_based':
                return users.filter(user => selectedRooms.includes(user.roomId)).length;
            default:
                return 0;
        }
    };

    const isFormValid = () => {
        if (!title.trim() || !description.trim() || !isChecked) return false;
        if (type === 'targeted' && selectedUsers.length === 0) return false;
        if (type === 'room_based' && selectedRooms.length === 0) return false;
        return true;
    };

    if (error) {
        return <ErrorScreen error={error} />;
    }

    if (dataLoading) {
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

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <Header refreshFunction={null} disableRefresh={true} />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                    <Text style={styles.loadingText}>Envoi en cours...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
                <Header refreshFunction={null} disableRefresh={true} />
                <View style={styles.headerContainer}>
                    <BoutonRetour title="Créer une notification" />
                </View>

                <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                    <View style={styles.heroSection}>
                        <View style={styles.heroIcon}>
                            <PenTool size={24} color={Colors.primary} />
                        </View>
                        <Text style={styles.heroTitle}>Nouvelle notification</Text>
                        <Text style={styles.heroSubtitle}>
                            Destinataires: {getRecipientsCount()} personnes
                        </Text>
                    </View>

                    <View style={styles.content}>
                        <View style={styles.typeSection}>
                            <Text style={styles.sectionTitle}>Type de notification</Text>
                            <View style={styles.typeButtons}>
                                <TouchableOpacity
                                    style={[styles.typeButton, type === 'global' && styles.typeButtonActive]}
                                    onPress={() => setType('global')}
                                >
                                    <Globe size={20} color={type === 'global' ? Colors.white : Colors.primary} />
                                    <Text style={[styles.typeButtonText, type === 'global' && styles.typeButtonTextActive]}>
                                        Globale
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.typeButton, type === 'targeted' && styles.typeButtonActive]}
                                    onPress={() => setType('targeted')}
                                >
                                    <Users size={20} color={type === 'targeted' ? Colors.white : Colors.primary} />
                                    <Text style={[styles.typeButtonText, type === 'targeted' && styles.typeButtonTextActive]}>
                                        Ciblée
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.typeButton, type === 'room_based' && styles.typeButtonActive]}
                                    onPress={() => setType('room_based')}
                                >
                                    <Home size={20} color={type === 'room_based' ? Colors.white : Colors.primary} />
                                    <Text style={[styles.typeButtonText, type === 'room_based' && styles.typeButtonTextActive]}>
                                        Par chambre
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {type === 'targeted' && (
                            <View style={styles.selectionSection}>
                                <TouchableOpacity
                                    style={styles.selectionHeader}
                                    onPress={() => setShowUsersPicker(!showUsersPicker)}
                                >
                                    <Text style={styles.selectionTitle}>
                                        Utilisateurs ({selectedUsers.length} sélectionnés)
                                    </Text>
                                    {showUsersPicker ?
                                        <ChevronDown size={20} color={Colors.primary} /> :
                                        <ChevronRight size={20} color={Colors.primary} />
                                    }
                                </TouchableOpacity>

                                {showUsersPicker && (
                                    <ScrollView
                                        style={styles.selectionList}
                                        nestedScrollEnabled={true}
                                        maximumZoomScale={1}
                                        showsVerticalScrollIndicator={true}
                                    >
                                        {users.map(user => (
                                            <TouchableOpacity
                                                key={user.id}
                                                style={styles.selectionItem}
                                                onPress={() => handleUserSelection(user.id)}
                                            >
                                                <Checkbox
                                                    value={selectedUsers.includes(user.id)}
                                                    onValueChange={() => handleUserSelection(user.id)}
                                                    color={Colors.primary}
                                                />
                                                <Text style={styles.selectionItemText}>{user.name}</Text>
                                                {user.admin && (
                                                    <View style={styles.adminBadge}>
                                                        <Text style={styles.adminBadgeText}>Admin</Text>
                                                    </View>
                                                )}
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                )}
                            </View>
                        )}

                        {type === 'room_based' && (
                            <View style={styles.selectionSection}>
                                <TouchableOpacity
                                    style={styles.selectionHeader}
                                    onPress={() => setShowRoomsPicker(!showRoomsPicker)}
                                >
                                    <Text style={styles.selectionTitle}>
                                        Chambres ({selectedRooms.length} sélectionnées)
                                    </Text>
                                    {showRoomsPicker ?
                                        <ChevronDown size={20} color={Colors.primary} /> :
                                        <ChevronRight size={20} color={Colors.primary} />
                                    }
                                </TouchableOpacity>

                                {showRoomsPicker && (
                                    <ScrollView
                                        style={styles.selectionList}
                                        nestedScrollEnabled={true}
                                        maximumZoomScale={1}
                                        showsVerticalScrollIndicator={true}
                                    >
                                        {rooms.map(room => (
                                            <TouchableOpacity
                                                key={room.id}
                                                style={styles.selectionItem}
                                                onPress={() => handleRoomSelection(room.id)}
                                            >
                                                <Checkbox
                                                    value={selectedRooms.includes(room.id)}
                                                    onValueChange={() => handleRoomSelection(room.id)}
                                                    color={Colors.primary}
                                                />
                                                <Text style={styles.selectionItemText}>{room.roomNumber} - {room.name}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                )}
                            </View>
                        )}

                        <View style={styles.inputSection}>
                            <View style={styles.inputHeader}>
                                <FileText size={16} color={Colors.primary} />
                                <Text style={styles.inputLabel}>Titre</Text>
                            </View>
                            <TextInput
                                style={styles.titleInput}
                                placeholder="Titre de la notification"
                                placeholderTextColor={Colors.muted}
                                onChangeText={setTitle}
                                value={title}
                            />
                        </View>

                        <View style={styles.inputSection}>
                            <View style={styles.inputHeader}>
                                <FileText size={16} color={Colors.primary} />
                                <Text style={styles.inputLabel}>Message</Text>
                            </View>
                            <TextInput
                                style={styles.textAreaInput}
                                placeholder="Contenu de la notification..."
                                placeholderTextColor={Colors.muted}
                                multiline
                                numberOfLines={6}
                                onChangeText={setDescription}
                                value={description}
                                textAlignVertical="top"
                            />
                        </View>

                        <View style={styles.optionsSection}>
                            <Text style={styles.sectionTitle}>Options</Text>

                            <View style={styles.optionRow}>
                                <Checkbox
                                    value={sendPush}
                                    onValueChange={setSendPush}
                                    color={Colors.primary}
                                />
                                <Text style={styles.optionText}>Envoyer notification push</Text>
                            </View>

                            <View style={styles.optionRow}>
                                <Checkbox
                                    value={display}
                                    onValueChange={setDisplay}
                                    color={Colors.primary}
                                />
                                <Text style={styles.optionText}>Afficher dans l'application</Text>
                            </View>
                        </View>

                        <View style={styles.termsSection}>
                            <View style={styles.termsRow}>
                                <Checkbox
                                    style={styles.checkbox}
                                    value={isChecked}
                                    onValueChange={setChecked}
                                    color={isChecked ? Colors.primary : undefined}
                                />
                                <View style={styles.termsTextContainer}>
                                    <Text style={styles.termsText}>
                                        Je certifie que cette notification respecte tous les participants
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </ScrollView>

                <View style={styles.buttonContainer}>
                    <BoutonActiverLarge
                        title="Envoyer la notification"
                        IconComponent={Send}
                        disabled={!isFormValid() || loading}
                        onPress={handleSendNotification}
                    />
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    adminBadge: {
        backgroundColor: Colors.primary,
        borderRadius: 4,
        paddingHorizontal: 8,
        paddingVertical: 2,
    },
    adminBadgeText: {
        ...TextStyles.small,
        color: Colors.white,
        fontWeight: '600',
    },
    buttonContainer: {
        bottom: 20,
        left: 20,
        position: 'absolute',
        right: 20,
    },
    checkbox: {
        height: 24,
        marginTop: 2,
        width: 24,
    },
    container: {
        backgroundColor: Colors.white,
        flex: 1,
    },
    content: {
        paddingBottom: 80,
        paddingHorizontal: 20,
    },
    headerContainer: {
        paddingBottom: 8,
        paddingHorizontal: 20,
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
        paddingHorizontal: 20,
        paddingVertical: 24,
    },
    heroSubtitle: {
        ...TextStyles.body,
        color: Colors.primary,
        fontWeight: '600',
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
        marginBottom: 8,
    },
    inputLabel: {
        ...TextStyles.body,
        color: Colors.primaryBorder,
        fontWeight: '600',
        marginLeft: 8,
    },
    inputSection: {
        marginBottom: 20,
    },
    keyboardView: {
        flex: 1,
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
    optionRow: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
    },
    optionText: {
        ...TextStyles.body,
        color: Colors.primaryBorder,
    },
    optionsSection: {
        marginBottom: 20,
    },
    scrollView: {
        flex: 1,
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
    selectionItem: {
        alignItems: 'center',
        borderBottomColor: Colors.lightMuted,
        borderBottomWidth: 1,
        flexDirection: 'row',
        gap: 12,
        padding: 12,
    },
    selectionItemText: {
        ...TextStyles.body,
        color: Colors.primaryBorder,
        flex: 1,
    },
    selectionList: {
        backgroundColor: Colors.white,
        maxHeight: 200,
    },
    selectionSection: {
        borderColor: Colors.lightMuted,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 24,
        overflow: 'hidden',
    },
    selectionTitle: {
        ...TextStyles.bodyBold,
        color: Colors.primaryBorder,
    },
    termsRow: {
        alignItems: 'flex-start',
        flexDirection: 'row',
        gap: 12,
    },
    termsSection: {
        marginTop: 10,
    },
    termsText: {
        ...TextStyles.small,
        color: Colors.primaryBorder,
        flex: 1,
        lineHeight: 18,
    },
    termsTextContainer: {
        alignItems: 'flex-start',
        flex: 1,
        flexDirection: 'row',
        gap: 8,
    },
    textAreaInput: {
        ...TextStyles.body,
        backgroundColor: Colors.white,
        borderColor: Colors.primary,
        borderRadius: 12,
        borderWidth: 1,
        color: Colors.primaryBorder,
        minHeight: 120,
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
    typeButton: {
        alignItems: 'center',
        backgroundColor: Colors.white,
        borderColor: Colors.primary,
        borderRadius: 8,
        borderWidth: 1,
        flex: 1,
        flexDirection: 'row',
        gap: 6,
        justifyContent: 'center',
        padding: 12,
    },
    typeButtonActive: {
        backgroundColor: Colors.primary,
    },
    typeButtonText: {
        ...TextStyles.small,
        color: Colors.primary,
        fontWeight: '600',
    },
    typeButtonTextActive: {
        color: Colors.white,
    },
    typeButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    typeSection: {
        marginBottom: 24,
    },
});
