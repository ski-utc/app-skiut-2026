import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { apiPost } from '@/constants/api/apiCalls';

// Configuration du gestionnaire de notifications
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldPlaySound: true,
        shouldShowAlert: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export class NotificationService {
    private static instance: NotificationService;
    private isInitialized = false;
    private pushToken: string | null = null;

    public static getInstance(): NotificationService {
        if (!NotificationService.instance) {
            NotificationService.instance = new NotificationService();
        }
        return NotificationService.instance;
    }

    /**
     * Initialise le service de notifications
     * À appeler au démarrage de l'app
     */
    public async initialize(): Promise<boolean> {
        if (this.isInitialized) {
            return true;
        }

        try {
            // Vérifier si c'est un appareil physique
            if (!Device.isDevice) {
                console.warn('Notifications push disponibles uniquement sur appareil physique');
                return false;
            }

            // Demander les permissions
            const hasPermission = await this.requestPermissions();
            if (!hasPermission) {
                console.warn('Permissions de notifications refusées');
                return false;
            }

            // Obtenir le token push
            const token = await this.getExpoPushToken();
            if (!token) {
                console.error('Impossible d\'obtenir le token push');
                return false;
            }

            // Envoyer le token au serveur
            await this.saveTokenToServer(token);

            // Configurer le canal Android
            await this.setupAndroidChannel();

            // Configurer les listeners
            this.setupNotificationListeners();

            this.isInitialized = true;
            console.log('Service de notifications initialisé avec succès');
            return true;

        } catch (error) {
            console.error('Erreur lors de l\'initialisation des notifications:', error);
            return false;
        }
    }

    /**
     * Demande les permissions de notifications
     */
    private async requestPermissions(): Promise<boolean> {
        try {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;

            // Si pas encore accordé, demander la permission
            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }

            return finalStatus === 'granted';
        } catch (error) {
            console.error('Erreur lors de la demande de permissions:', error);
            return false;
        }
    }

    /**
     * Obtient le token Expo Push
     */
    private async getExpoPushToken(): Promise<string | null> {
        try {
            const token = await Notifications.getExpoPushTokenAsync({
                projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
            });
            this.pushToken = token.data;
            return token.data;
        } catch (error) {
            console.error('Erreur lors de l\'obtention du token push:', error);
            return null;
        }
    }

    /**
     * Envoie le token au serveur
     */
    private async saveTokenToServer(token: string): Promise<void> {
        try {
            const response = await apiPost('save-token', { userToken: token });
            if (!response.success) {
                console.error('Erreur lors de la sauvegarde du token:', response.message);
            }
        } catch (error) {
            console.error('Erreur réseau lors de la sauvegarde du token:', error);
            // Ne pas lever l'erreur car l'app doit continuer de fonctionner
        }
    }

    /**
     * Configure le canal de notifications Android
     */
    private async setupAndroidChannel(): Promise<void> {
        if (Platform.OS === 'android') {
            try {
                await Notifications.setNotificationChannelAsync('default', {
                    name: 'Notifications Skiut',
                    importance: Notifications.AndroidImportance.MAX,
                    vibrationPattern: [0, 250, 250, 250],
                    lightColor: '#FF231F7C',
                    sound: 'default',
                    enableVibrate: true,
                    showBadge: true,
                });

                // Canal pour les notifications importantes (matches, etc.)
                await Notifications.setNotificationChannelAsync('important', {
                    name: 'Notifications importantes',
                    importance: Notifications.AndroidImportance.HIGH,
                    vibrationPattern: [0, 500, 250, 500],
                    lightColor: '#FF6B35',
                    sound: 'default',
                    enableVibrate: true,
                    showBadge: true,
                });

                // Canal pour les notifications silencieuses
                await Notifications.setNotificationChannelAsync('silent', {
                    name: 'Notifications silencieuses',
                    importance: Notifications.AndroidImportance.LOW,
                    sound: false,
                    enableVibrate: false,
                    showBadge: true,
                });

            } catch (error) {
                console.error('Erreur lors de la configuration du canal Android:', error);
            }
        }
    }

    /**
     * Configure les listeners de notifications
     */
    private setupNotificationListeners(): void {
        // Listener pour les notifications reçues quand l'app est ouverte
        Notifications.addNotificationReceivedListener((notification) => {
            console.log('Notification reçue:', notification);
            // Ici on peut traiter la notification reçue
            this.handleNotificationReceived(notification);
        });

        // Listener pour les interactions avec les notifications
        Notifications.addNotificationResponseReceivedListener((response) => {
            console.log('Interaction avec notification:', response);
            // Ici on peut naviguer vers l'écran approprié
            this.handleNotificationResponse(response);
        });
    }

    /**
     * Traite une notification reçue
     */
    private handleNotificationReceived(notification: Notifications.Notification): void {
        // Logique pour traiter les notifications reçues
        const { data } = notification.request.content;

        if (data?.type) {
            switch (data.type) {
                case 'skinder_match':
                    // Éventuellement jouer un son spécial ou afficher une animation
                    break;
                case 'permanence_reminder':
                    // Traitement spécifique aux rappels de permanence
                    break;
                default:
                    // Traitement par défaut
                    break;
            }
        }
    }

    /**
     * Traite la réponse à une notification (quand l'utilisateur tape dessus)
     */
    private handleNotificationResponse(response: Notifications.NotificationResponse): void {
        const { data } = response.notification.request.content;

        // Ici on pourrait implémenter la navigation vers l'écran approprié
        // Cela nécessiterait d'avoir accès au navigation, qu'on pourrait passer
        // ou utiliser un système d'événements

        if (data?.type) {
            switch (data.type) {
                case 'skinder_match':
                    // Naviguer vers les matches Skinder
                    break;
                case 'permanence_reminder':
                    // Naviguer vers l'écran des permanences
                    break;
                case 'room_tour':
                    // Naviguer vers la tournée des chambres
                    break;
                default:
                    // Navigation par défaut vers les notifications
                    break;
            }
        }
    }

    /**
     * Envoie une notification locale (pour les tests)
     */
    public async sendLocalNotification(title: string, body: string, data?: any): Promise<void> {
        try {
            await Notifications.scheduleNotificationAsync({
                content: {
                    title,
                    body,
                    data,
                    sound: 'default',
                },
                trigger: null, // Immédiatement
            });
        } catch (error) {
            console.error('Erreur lors de l\'envoi de notification locale:', error);
        }
    }

    /**
     * Obtient le statut des permissions
     */
    public async getPermissionStatus(): Promise<Notifications.PermissionStatus> {
        const { status } = await Notifications.getPermissionsAsync();
        return status;
    }

    /**
     * Obtient le token push actuel
     */
    public getPushToken(): string | null {
        return this.pushToken;
    }

    /**
     * Renouvelle le token push
     */
    public async refreshPushToken(): Promise<string | null> {
        const token = await this.getExpoPushToken();
        if (token) {
            await this.saveTokenToServer(token);
        }
        return token;
    }

    /**
     * Nettoie les notifications
     */
    public async clearAllNotifications(): Promise<void> {
        try {
            await Notifications.dismissAllNotificationsAsync();
        } catch (error) {
            console.error('Erreur lors du nettoyage des notifications:', error);
        }
    }

    /**
     * Obtient le nombre de notifications non lues
     */
    public async getBadgeCount(): Promise<number> {
        try {
            return await Notifications.getBadgeCountAsync();
        } catch (error) {
            console.error('Erreur lors de l\'obtention du badge count:', error);
            return 0;
        }
    }

    /**
     * Met à jour le badge count
     */
    public async setBadgeCount(count: number): Promise<void> {
        try {
            await Notifications.setBadgeCountAsync(count);
        } catch (error) {
            console.error('Erreur lors de la mise à jour du badge count:', error);
        }
    }
}
