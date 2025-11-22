import { useEffect, useState, useCallback } from 'react';
import { NotificationService } from '../services/NotificationService';
import { useUser } from '@/contexts/UserContext';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useNotifications = () => {
    const [isInitialized, setIsInitialized] = useState(false);
    const [permissionStatus, setPermissionStatus] = useState<string>('undetermined');
    const [pushToken, setPushToken] = useState<string | null>(null);
    const { user, setUser } = useUser();

    const notificationService = NotificationService.getInstance();

    useEffect(() => {
        const loadInitialState = async () => {
            try {
                const notificationsRegistered = await AsyncStorage.getItem('notificationsRegistered');
                if (notificationsRegistered === 'true') {
                    setIsInitialized(true);
                    console.log('[useNotifications] Notifications déjà enregistrées - isInitialized = true');
                } else {
                    setIsInitialized(false);
                }
            } catch (error) {
                setIsInitialized(false);
                console.error('[useNotifications] Erreur lors du chargement de l\'état initial:', error);
            }
        };
        loadInitialState();
    }, []);

    const initializeNotifications = useCallback(async () => {
        if (!user || isInitialized) {
            return;
        }

        const notificationsRegistered = await AsyncStorage.getItem('notificationsRegistered');
        if (notificationsRegistered === 'true') {
            console.log('[useNotifications] Notifications déjà enregistrées - pas de ré-initialisation');
            setIsInitialized(true);
            return;
        }

        try {
            console.log('[useNotifications] Début initialisation...');
            const success = await notificationService.initialize();
            console.log('[useNotifications] Initialisation terminée, success:', success);

            if (success) {
                await AsyncStorage.setItem('notificationsRegistered', 'true');
                setIsInitialized(true);

                const status = await notificationService.getPermissionStatus();
                const token = notificationService.getPushToken();

                setPermissionStatus(status);
                setPushToken(token);

                if (token) {
                    console.log('[useNotifications] Token obtenu:', token.substring(0, 20) + '...');
                } else {
                    console.warn('[useNotifications] Aucun token push obtenu');
                }
            } else {
                setIsInitialized(true);
            }
        } catch (error: unknown) {
            console.error('[useNotifications] Erreur initialisation notifications:', error);

            Toast.show({
                type: 'error',
                text1: 'Erreur notifications',
                text2: error.message || 'Erreur inconnue',
                visibilityTime: 4000,
            });

            if (error.message === 'NoRefreshTokenError' || error.JWT_ERROR) {
                setUser(null);
            }

            setIsInitialized(true);
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

    const deactivateToken = useCallback(async () => {
        try {
            await notificationService.deactivateToken();
        } catch (error) {
            console.error('Erreur désactivation token:', error);
        }
    }, [notificationService]);

    const deleteToken = useCallback(async () => {
        try {
            await notificationService.deleteToken();
            setPushToken(null);
        } catch (error) {
            console.error('Erreur suppression token:', error);
        }
    }, [notificationService]);

    const cleanup = useCallback(() => {
        try {
            notificationService.cleanup();
            setIsInitialized(false);
            setPermissionStatus('undetermined');
            setPushToken(null);
        } catch (error) {
            console.error('Erreur cleanup notifications:', error);
        }
    }, [notificationService]);

    useEffect(() => {
        let timeoutId: NodeJS.Timeout;

        if (user && !isInitialized) {
            timeoutId = setTimeout(() => {
                if (!isInitialized) {
                    console.warn('Timeout initialisation notifications - l\'app continue sans notifications');
                    setIsInitialized(true);
                }
            }, 10000);

            initializeNotifications();
        }

        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, [user, isInitialized, initializeNotifications]);

    useEffect(() => {
        if (!user && isInitialized) {
            clearNotifications();
            deactivateToken();
            setIsInitialized(false);
            setPermissionStatus('undetermined');
            setPushToken(null);
        }
    }, [user, isInitialized, clearNotifications, deactivateToken]);

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
        deactivateToken,
        deleteToken,
        cleanup,
    };
};
