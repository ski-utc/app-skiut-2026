import { useEffect, useState, useCallback } from 'react';
import { NotificationService } from '../services/NotificationService';
import { useUser } from '@/contexts/UserContext';

export const useNotifications = () => {
    const [isInitialized, setIsInitialized] = useState(false);
    const [permissionStatus, setPermissionStatus] = useState<string>('undetermined');
    const [pushToken, setPushToken] = useState<string | null>(null);
    const { user, setUser } = useUser();

    const notificationService = NotificationService.getInstance();

    const initializeNotifications = useCallback(async () => {
        if (!user || isInitialized) {
            return;
        }

        try {
            const success = await notificationService.initialize();
            setIsInitialized(success);

            if (success) {
                const status = await notificationService.getPermissionStatus();
                const token = notificationService.getPushToken();

                setPermissionStatus(status);
                setPushToken(token);
            }
        } catch (error: any) {
            console.error('Erreur initialisation notifications:', error);

            // Si erreur JWT, déconnecter l'utilisateur
            if (error.message === 'NoRefreshTokenError' || error.JWT_ERROR) {
                setUser(null);
            }
        }
    }, [user, isInitialized, notificationService, setUser]);

    const requestPermissions = useCallback(async () => {
        try {
            const success = await notificationService.initialize();
            if (success) {
                const status = await notificationService.getPermissionStatus();
                setPermissionStatus(status);
                setIsInitialized(true);
            }
            return success;
        } catch (error) {
            console.error('Erreur demande permissions:', error);
            return false;
        }
    }, [notificationService]);

    const refreshToken = useCallback(async () => {
        try {
            const token = await notificationService.refreshPushToken();
            setPushToken(token);
            return token;
        } catch (error) {
            console.error('Erreur refresh token:', error);
            return null;
        }
    }, [notificationService]);

    const sendLocalNotification = useCallback(async (title: string, body: string, data?: any) => {
        try {
            await notificationService.sendLocalNotification(title, body, data);
        } catch (error) {
            console.error('Erreur notification locale:', error);
        }
    }, [notificationService]);

    const clearNotifications = useCallback(async () => {
        try {
            await notificationService.clearAllNotifications();
        } catch (error) {
            console.error('Erreur clear notifications:', error);
        }
    }, [notificationService]);

    const setBadgeCount = useCallback(async (count: number) => {
        try {
            await notificationService.setBadgeCount(count);
        } catch (error) {
            console.error('Erreur badge count:', error);
        }
    }, [notificationService]);

    // Auto-initialisation quand l'utilisateur se connecte
    useEffect(() => {
        if (user && !isInitialized) {
            initializeNotifications();
        }
    }, [user, isInitialized, initializeNotifications]);

    // Nettoyer les notifications à la déconnexion
    useEffect(() => {
        if (!user && isInitialized) {
            clearNotifications();
            setIsInitialized(false);
            setPermissionStatus('undetermined');
            setPushToken(null);
        }
    }, [user, isInitialized, clearNotifications]);

    return {
        isInitialized,
        permissionStatus,
        pushToken,
        initializeNotifications,
        requestPermissions,
        refreshToken,
        sendLocalNotification,
        clearNotifications,
        setBadgeCount,
    };
};
