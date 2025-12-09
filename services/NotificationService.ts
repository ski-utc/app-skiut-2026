import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import * as Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { apiPost } from '@/constants/api/apiCalls';

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
  private notificationSubscriptions: Array<() => void> = [];

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
      if (!Device.isDevice) {
        this.isInitialized = true;
        return true;
      }

      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        this.isInitialized = true;
        return true;
      }

      const tokenPromise = this.getExpoPushToken();
      const timeoutPromise = new Promise<null>((resolve) =>
        setTimeout(() => resolve(null), 8000),
      );
      const token = await Promise.race([tokenPromise, timeoutPromise]);

      if (!token) {
        this.isInitialized = true;
        return true;
      }

      this.saveTokenToServer(token).catch((err) => {
        console.error('Erreur sauvegarde token (non bloquant):', err);
      });

      await this.setupAndroidChannel();

      this.setupNotificationListeners();

      this.isInitialized = true;
      await AsyncStorage.setItem('notificationsRegistered', 'true');
      return true;
    } catch (error) {
      this.isInitialized = true;
      return true;
    }
  }

  /**
   * Demande les permissions de notifications
   */
  private async requestPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      return finalStatus === 'granted';
    } catch (error) {
      return false;
    }
  }

  /**
   * Obtient le token Expo Push
   */
  private async getExpoPushToken(): Promise<string | null> {
    try {
      console.log('🔵 [NotificationService] Getting Expo Push Token...');
      const token = await Notifications.getExpoPushTokenAsync({
        projectId:
          Constants.expoConfig?.extra?.eas?.projectId ||
          'f03f1a56-74c7-4c87-a0b2-60b420f7de94',
      });
      this.pushToken = token.data;
      console.log(
        '[NotificationService] Expo Push Token obtained:',
        token.data,
      );
      return token.data;
    } catch (error) {
      console.error(
        '[NotificationService] Error getting Expo push token:',
        error,
      );
      return null;
    }
  }


  /**
   * Envoie le token au serveur
   */
  private async saveTokenToServer(token: string): Promise<void> {
    try {
      console.log('🔵 [NotificationService] Saving token to server...', token);
      const deviceType = Platform.OS === 'ios' ? 'ios' : 'android';
      const deviceName =
        `${Device.brand || 'Unknown'} ${Device.modelName || 'Device'}`.trim();

      const response = await apiPost(
        'push-tokens',
        {
          token,
          device_type: deviceType,
          device_name: deviceName,
        },
        false,
        undefined,
        true,
      );

      if (!response.success) {
        console.error(
          '[NotificationService] Error saving token to server:',
          response,
        );
      } else {
        console.log('[NotificationService] Token successfully saved to server');
      }
    } catch (error) {
      console.error('Erreur réseau lors de la sauvegarde du token:', error);
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

        await Notifications.setNotificationChannelAsync('important', {
          name: 'Notifications importantes',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 500, 250, 500],
          lightColor: '#FF6B35',
          sound: 'default',
          enableVibrate: true,
          showBadge: true,
        });

        await Notifications.setNotificationChannelAsync('silent', {
          name: 'Notifications silencieuses',
          importance: Notifications.AndroidImportance.LOW,
          sound: 'default',
          enableVibrate: false,
          showBadge: true,
        });
      } catch (error) {
        console.error(
          'Erreur lors de la configuration du canal Android:',
          error,
        );
      }
    }
  }

  /**
   * Configure les listeners de notifications
   */
  private setupNotificationListeners(): void {
    this.cleanupNotificationListeners();

    const notificationReceivedSubscription =
      Notifications.addNotificationReceivedListener((notification) => {
        this.handleNotificationReceived(notification);
      });

    const notificationResponseSubscription =
      Notifications.addNotificationResponseReceivedListener((response) => {
        this.handleNotificationResponse(response);
      });

    this.notificationSubscriptions = [
      () => notificationReceivedSubscription.remove(),
      () => notificationResponseSubscription.remove(),
    ];
  }

  /**
   * Nettoie les listeners de notifications
   */
  private cleanupNotificationListeners(): void {
    this.notificationSubscriptions.forEach((unsubscribe) => {
      try {
        unsubscribe();
      } catch (error) {
        console.error('Erreur lors du nettoyage du listener:', error);
      }
    });
    this.notificationSubscriptions = [];
  }

  /**
   * Traite une notification reçue
   */
  private handleNotificationReceived(
    notification: Notifications.Notification,
  ): void {
    const { data } = notification.request.content;

    if (data?.type) {
      switch (data.type) {
        case 'skinder_match':
          break;
        case 'permanence_reminder':
          break;
        default:
          break;
      }
    }
  }

  /**
   * Traite la réponse à une notification (quand l'utilisateur tape dessus)
   */
  private handleNotificationResponse(
    response: Notifications.NotificationResponse,
  ): void {
    const { data } = response.notification.request.content;

    if (data?.type) {
      switch (data.type) {
        case 'skinder_match':
          break;
        case 'permanence_reminder':
          break;
        case 'room_tour':
          break;
        default:
          break;
      }
    }
  }

  /**
   * Envoie une notification locale (pour les tests)
   */
  public async sendLocalNotification(
    title: string,
    body: string,
    data?: any,
  ): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: 'default',
        },
        trigger: null,
      });
    } catch (error) {
      console.error("Erreur lors de l'envoi de notification locale:", error);
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
   * Nettoyage complet du service de notifications
   */
  public cleanup(): void {
    this.cleanupNotificationListeners();
    this.isInitialized = false;
    this.pushToken = null;
  }

  /**
   * Obtient le nombre de notifications non lues
   */
  public async getBadgeCount(): Promise<number> {
    try {
      return await Notifications.getBadgeCountAsync();
    } catch (error) {
      console.error("Erreur lors de l'obtention du badge count:", error);
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

  /**
   * Désactive le push token sur le serveur (sans le supprimer)
   */
  public async deactivateToken(): Promise<void> {
    if (!this.pushToken) {
      console.warn('Aucun token à désactiver');
      return;
    }

    try {
      const response = await apiPost(
        'push-tokens/deactivate',
        {
          token: this.pushToken,
        },
        false,
        undefined,
        true,
      );

      if (response.success) {
        console.log('Token désactivé avec succès');
      }
    } catch (error) {
      console.error('Erreur lors de la désactivation du token:', error);
    }
  }

  /**
   * Supprime le push token du serveur
   */
  public async deleteToken(): Promise<void> {
    if (!this.pushToken) {
      console.warn('Aucun token à supprimer');
      return;
    }

    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/push-tokens`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token: this.pushToken }),
        },
      );

      if (response.ok) {
        console.log('Token supprimé avec succès');
        this.pushToken = null;
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du token:', error);
    }
  }
}
