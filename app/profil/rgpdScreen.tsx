import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Alert, TouchableOpacity, Modal, StatusBar } from 'react-native';
import { Colors, TextStyles } from '@/constants/GraphSettings';
import Header from '@/components/header';
import BoutonRetour from '@/components/divers/boutonRetour';
import { Shield, FileText, Trash2, UserX, Download, X } from 'lucide-react-native';
import { apiPost, apiDelete } from '@/constants/api/apiCalls';
import { useUser } from '@/contexts/UserContext';
import Toast from 'react-native-toast-message';
import { WebView } from 'react-native-webview';
import * as config from '@/constants/api/apiConfig';
import { downloadAsync, documentDirectory } from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as SecureStore from 'expo-secure-store';

export default function RGPDScreen() {
    const { logout } = useUser();
    const [loading, setLoading] = useState(false);
    const [showWebView, setShowWebView] = useState(false);

    const handleAnonymizeData = () => {
        Alert.alert(
            'Anonymiser mes données',
            'Cette action est irréversible. Vos données personnelles seront anonymisées mais votre compte restera actif avec des données génériques.\n\nVoulez-vous continuer ?',
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Anonymiser',
                    style: 'destructive',
                    onPress: async () => {
                        setLoading(true);
                        try {
                            const response = await apiPost('rgpd/anonymize-my-data', null);
                            if (response.success) {
                                Toast.show({
                                    type: 'success',
                                    text1: 'Données anonymisées',
                                    text2: 'Vos données personnelles ont été anonymisées avec succès. Vous allez être déconnecté.',
                                });
                                setTimeout(() => logout(), 2000);
                            } else {
                                Toast.show({
                                    type: 'error',
                                    text1: 'Erreur',
                                    text2: response.message || 'Impossible d\'anonymiser vos données.',
                                });
                            }
                        } catch (error: any) {
                            Toast.show({
                                type: 'error',
                                text1: 'Erreur',
                                text2: error.message || 'Une erreur est survenue.',
                            });
                        } finally {
                            setLoading(false);
                        }
                    },
                },
            ]
        );
    };

    const handleDeleteData = () => {
        Alert.alert(
            'Supprimer mon compte',
            'ATTENTION : Cette action est définitive et irréversible.\n\nToutes vos données seront définitivement supprimées de nos serveurs :\n• Votre profil\n• Vos anecdotes\n• Vos défis\n• Vos likes et interactions\n\nVoulez-vous vraiment supprimer votre compte ?',
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Supprimer définitivement',
                    style: 'destructive',
                    onPress: () => {
                        Alert.alert(
                            'Confirmation finale',
                            'Êtes-vous absolument certain ? Cette action ne peut pas être annulée.',
                            [
                                { text: 'Non, annuler', style: 'cancel' },
                                {
                                    text: 'Oui, supprimer',
                                    style: 'destructive',
                                    onPress: async () => {
                                        setLoading(true);
                                        try {
                                            const response = await apiDelete('rgpd/delete-my-data');
                                            if (response.success) {
                                                Toast.show({
                                                    type: 'success',
                                                    text1: 'Compte supprimé',
                                                    text2: 'Votre compte a été définitivement supprimé.',
                                                });
                                                setTimeout(() => logout(), 2000);
                                            } else {
                                                Toast.show({
                                                    type: 'error',
                                                    text1: 'Erreur',
                                                    text2: response.message || 'Impossible de supprimer votre compte.',
                                                });
                                            }
                                        } catch (error: any) {
                                            Toast.show({
                                                type: 'error',
                                                text1: 'Erreur',
                                                text2: error.message || 'Une erreur est survenue.',
                                            });
                                        } finally {
                                            setLoading(false);
                                        }
                                    },
                                },
                            ]
                        );
                    },
                },
            ]
        );
    };

    const handleExportData = async () => {
        setLoading(true);
        try {
            const accessToken = await SecureStore.getItemAsync('accessToken');
            if (!accessToken) {
                Toast.show({
                    type: 'error',
                    text1: 'Erreur',
                    text2: 'Vous devez être connecté.',
                });
                return;
            }

            const timestamp = new Date().toISOString().split('T')[0];
            const fileName = `mes-donnees-skiut-${timestamp}.zip`;
            const fileUri = `${documentDirectory}${fileName}`;

            const downloadResult = await downloadAsync(
                `${config.API_BASE_URL}/rgpd/export-my-data`,
                fileUri,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            if (downloadResult.status === 200) {
                const isAvailable = await Sharing.isAvailableAsync();

                if (isAvailable) {
                    await Sharing.shareAsync(downloadResult.uri, {
                        mimeType: 'application/zip',
                        dialogTitle: 'Sauvegarder mes données',
                        UTI: 'public.zip-archive',
                    });

                    Toast.show({
                        type: 'success',
                        text1: 'Export réussi',
                        text2: 'Fichier ZIP téléchargé avec succès.',
                    });
                } else {
                    Toast.show({
                        type: 'success',
                        text1: 'Export réussi',
                        text2: `Fichier sauvegardé : ${fileName}`,
                    });
                }
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Erreur',
                    text2: `Erreur de téléchargement (${downloadResult.status})`,
                });
            }
        } catch (error: any) {
            console.error('Erreur export:', error);
            Toast.show({
                type: 'error',
                text1: 'Erreur',
                text2: error.message || 'Impossible d\'exporter vos données.',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleOpenCGU = () => {
        setShowWebView(true);
    };

    const ActionCard = ({
        title,
        description,
        icon: IconComponent,
        color,
        onPress,
        dangerous = false
    }: {
        title: string;
        description: string;
        icon: any;
        color: string;
        onPress: () => void;
        dangerous?: boolean;
    }) => (
        <TouchableOpacity
            style={[
                styles.actionCard,
                dangerous && styles.dangerCard,
            ]}
            onPress={onPress}
            disabled={loading}
            activeOpacity={0.7}
        >
            <View style={[styles.iconContainer, { backgroundColor: `${color}20` }, dangerous && { backgroundColor: Colors.white }]}>
                <IconComponent size={24} color={color} />
            </View>
            <View style={[styles.cardContent, dangerous && styles.dangerCard]}>
                <Text style={[styles.cardTitle, dangerous && { color: Colors.white }]}>
                    {title}
                </Text>
                <Text style={[styles.cardDescription, dangerous && { color: Colors.white }]}>{description}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <Header refreshFunction={null} disableRefresh={true} />
            <View style={styles.headerContainer}>
                <BoutonRetour previousRoute="homeNavigator" title="RGPD & Données" />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.heroSection}>
                    <View style={styles.heroIcon}>
                        <Shield size={32} color={Colors.primary} />
                    </View>
                    <Text style={styles.heroTitle}>Vos données, vos droits</Text>
                    <Text style={styles.heroSubtitle}>
                        Conformément au RGPD, vous disposez d'un contrôle total sur vos données personnelles.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Consulter nos documents</Text>
                    <ActionCard
                        title="Charte RGPD & CGU"
                        description="Consultez notre politique de confidentialité et nos conditions générales d'utilisation"
                        icon={FileText}
                        color={Colors.primary}
                        onPress={handleOpenCGU}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Gérer mes données</Text>

                    <ActionCard
                        title="Exporter mes données"
                        description="Téléchargez une copie de toutes vos données personnelles au format JSON"
                        icon={Download}
                        color={Colors.success}
                        onPress={handleExportData}
                    />

                    <ActionCard
                        title="Anonymiser mes données"
                        description="Remplacez vos données personnelles par des informations anonymes"
                        icon={UserX}
                        color={Colors.accent}
                        onPress={handleAnonymizeData}
                    />

                    <ActionCard
                        title="Supprimer mon compte"
                        description="Supprimez définitivement votre compte et toutes vos données"
                        icon={Trash2}
                        color={Colors.error}
                        onPress={handleDeleteData}
                        dangerous={true}
                    />
                </View>

                <View style={styles.infoBox}>
                    <Shield size={16} color={Colors.primary} />
                    <Text style={styles.infoText}>
                        Toutes les actions de suppression ou d'anonymisation sont irréversibles.
                        Nous vous recommandons d'exporter vos données avant toute action définitive.
                    </Text>
                </View>
            </ScrollView>

            <Modal
                visible={showWebView}
                transparent={false}
                animationType="slide"
                onRequestClose={() => setShowWebView(false)}
            >
                <StatusBar hidden />
                <SafeAreaView style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Charte RGPD & CGU</Text>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setShowWebView(false)}
                        >
                            <X size={24} color={Colors.primaryBorder} />
                        </TouchableOpacity>
                    </View>
                    <WebView
                        source={{ uri: `${config.BASE_URL}/rgpd` }}
                        style={styles.webview}
                        startInLoadingState={true}
                    />
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
        paddingHorizontal: 20,
        paddingBottom: 8,
    },
    content: {
        flex: 1,
    },
    heroSection: {
        alignItems: 'center',
        paddingBottom: 32,
        paddingHorizontal: 20,
    },
    heroIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: `${Colors.primary}15`,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    heroTitle: {
        ...TextStyles.h1Bold,
        color: Colors.primaryBorder,
        marginBottom: 8,
        textAlign: 'center',
    },
    heroSubtitle: {
        ...TextStyles.body,
        color: Colors.muted,
        textAlign: 'center',
        lineHeight: 22,
        maxWidth: '90%',
    },
    section: {
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    sectionTitle: {
        ...TextStyles.h3Bold,
        color: Colors.primaryBorder,
        marginBottom: 16,
    },
    actionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.lightMuted,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    dangerCard: {
        borderColor: Colors.error,
        backgroundColor: Colors.error,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    cardContent: {
        flex: 1,
    },
    cardTitle: {
        ...TextStyles.bodyBold,
        color: Colors.primaryBorder,
        marginBottom: 4,
    },
    cardDescription: {
        ...TextStyles.small,
        color: Colors.muted,
        lineHeight: 18,
    },
    infoBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: `${Colors.primary}10`,
        borderRadius: 12,
        padding: 16,
        marginHorizontal: 20,
        marginBottom: 32,
        gap: 12,
    },
    infoText: {
        ...TextStyles.small,
        color: Colors.primaryBorder,
        lineHeight: 20,
        flex: 1,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: Colors.white,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.lightMuted,
    },
    modalTitle: {
        ...TextStyles.h3Bold,
        color: Colors.primaryBorder,
    },
    closeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.lightMuted,
    },
    webview: {
        flex: 1,
    },
});

