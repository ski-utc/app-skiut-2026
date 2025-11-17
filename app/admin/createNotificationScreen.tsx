import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ActivityIndicator, Platform, KeyboardAvoidingView, SafeAreaView, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Checkbox from 'expo-checkbox';
import { Colors, TextStyles } from '@/constants/GraphSettings';
import Header from "../../components/header";
import { useNavigation } from '@react-navigation/native';
import { useUser } from '@/contexts/UserContext';
import BoutonRetour from '@/components/divers/boutonRetour';
import BoutonActiverLarge from '@/components/divers/boutonActiverLarge';
import { Send, PenTool, FileText, Users, Home, Globe, ChevronDown, ChevronRight } from 'lucide-react-native';
import { apiPost, apiGet } from '@/constants/api/apiCalls';
import ErrorScreen from '@/components/pages/errorPage';
import Toast from 'react-native-toast-message';

interface User {
    id: number;
    name: string;
    roomId: number;
    admin: boolean;
}

interface Room {
    id: number;
    name: string;
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

    const navigation = useNavigation();
    const { setUser } = useUser();

    useEffect(() => {
        fetchRecipientsData();
    }, []);

    const fetchRecipientsData = async () => {
        try {
            setDataLoading(true);
            const response = await apiGet('admin/notifications/recipients');
            if (response.success) {
                setUsers(response.data.users);
                setRooms(response.data.rooms);
            } else {
                setError('Erreur lors du chargement des données');
            }
        } catch (error: any) {
            if (error.message === 'NoRefreshTokenError' || error.JWT_ERROR) {
                setUser(null);
            } else {
                setError(error.message);
            }
        } finally {
            setDataLoading(false);
        }
    };

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

            const response = await apiPost('admin/notifications', payload);
            if (response.success) {
                Toast.show({
                    type: 'success',
                    text1: 'Notification créée !',
                    text2: `Envoyée à ${response.recipients_count} personnes`,
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
                Toast.show({
                    type: 'error',
                    text1: 'Une erreur est survenue...',
                    text2: response.message,
                });
            }
        } catch (error: any) {
            if (error.message === 'NoRefreshTokenError' || error.JWT_ERROR) {
                setUser(null);
            } else {
                setError(error.message);
            }
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
                    <BoutonRetour previousRoute="gestionNotificationsScreen" title="Créer une notification" />
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
                                                <Text style={styles.selectionItemText}>{room.name}</Text>
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
    container: {
        flex: 1,
        backgroundColor: Colors.white,
    },
    keyboardView: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
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
    headerContainer: {
        paddingHorizontal: 20,
        paddingBottom: 8,
    },
    heroSection: {
        alignItems: 'center',
        paddingVertical: 24,
        paddingHorizontal: 20,
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
        marginBottom: 8,
        textAlign: 'center',
    },
    heroSubtitle: {
        ...TextStyles.body,
        color: Colors.primary,
        textAlign: 'center',
        fontWeight: '600',
    },
    content: {
        paddingHorizontal: 20,
        paddingBottom: 80,
    },
    sectionTitle: {
        ...TextStyles.bodyBold,
        color: Colors.primaryBorder,
        marginBottom: 12,
    },
    typeSection: {
        marginBottom: 24,
    },
    typeButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    typeButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: Colors.primary,
        backgroundColor: Colors.white,
        gap: 6,
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
    selectionSection: {
        marginBottom: 24,
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
    selectionTitle: {
        ...TextStyles.bodyBold,
        color: Colors.primaryBorder,
    },
    selectionList: {
        backgroundColor: Colors.white,
        maxHeight: 200,
    },
    selectionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: Colors.lightMuted,
        gap: 12,
    },
    selectionItemText: {
        ...TextStyles.body,
        color: Colors.primaryBorder,
        flex: 1,
    },
    adminBadge: {
        backgroundColor: Colors.primary,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    adminBadgeText: {
        ...TextStyles.small,
        color: Colors.white,
        fontWeight: '600',
    },
    inputSection: {
        marginBottom: 20,
    },
    inputHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    inputLabel: {
        ...TextStyles.body,
        color: Colors.primaryBorder,
        fontWeight: '600',
        marginLeft: 8,
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
        minHeight: 120,
        textAlignVertical: 'top',
    },
    optionsSection: {
        marginBottom: 20,
    },
    optionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 12,
    },
    optionText: {
        ...TextStyles.body,
        color: Colors.primaryBorder,
    },
    termsSection: {
        marginTop: 10,
    },
    termsRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
    },
    checkbox: {
        width: 24,
        height: 24,
        marginTop: 2,
    },
    termsTextContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
    },
    termsText: {
        ...TextStyles.small,
        color: Colors.primaryBorder,
        lineHeight: 18,
        flex: 1,
    },
    buttonContainer: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
    },
});
