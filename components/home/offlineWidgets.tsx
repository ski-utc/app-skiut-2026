import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Colors, FontSizes, TextStyles } from '@/constants/GraphSettings';
import { WifiOff, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react-native';
import NetInfo from '@react-native-community/netinfo';
import { getPendingRequests, syncPendingRequests } from '@/constants/api/apiCalls';

interface OfflineStatusProps {
    onNetworkChange?: (isConnected: boolean) => void;
}

export const OfflineStatusBanner: React.FC<OfflineStatusProps> = ({ onNetworkChange }) => {
    const [isOnline, setIsOnline] = useState(true);

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            const online = state.isConnected && state.isInternetReachable !== false;
            setIsOnline(online ?? false);
            onNetworkChange?.(online ?? false);
        });

        return () => unsubscribe();
    }, [onNetworkChange]);

    if (isOnline) {
        return null;
    }

    return (
        <View style={styles.offlineBanner}>
            <WifiOff size={18} color={Colors.white} strokeWidth={2} />
            <Text style={styles.offlineBannerText}>
                Vous êtes hors ligne. Les données affichées peuvent ne pas être à jour.
            </Text>
        </View>
    );
};

export const PendingRequestsWidget: React.FC = () => {
    const [pendingCount, setPendingCount] = useState(0);
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncResult, setSyncResult] = useState<any>(null);
    const [isOnline, setIsOnline] = useState(true);

    const loadPendingCount = async () => {
        const pending = await getPendingRequests();
        setPendingCount(pending.length);
    };

    useEffect(() => {
        loadPendingCount();

        const interval = setInterval(loadPendingCount, 30000);

        const unsubscribe = NetInfo.addEventListener(state => {
            const online = state.isConnected && state.isInternetReachable !== false;
            setIsOnline(online ?? false);
            if (online) {
                loadPendingCount();
            }
        });

        return () => {
            clearInterval(interval);
            unsubscribe();
        };
    }, []);

    const handleSync = async () => {
        if (!isOnline) {
            return;
        }

        setIsSyncing(true);
        setSyncResult(null);

        try {
            const result = await syncPendingRequests();
            setSyncResult(result);
            await loadPendingCount();

            setTimeout(() => {
                setSyncResult(null);
            }, 5000);
        } catch {
            setSyncResult({
                success: 0,
                failed: pendingCount,
                errors: [{ error: 'Erreur de synchronisation' }]
            });
        } finally {
            setIsSyncing(false);
        }
    };

    if (pendingCount === 0 && !syncResult) {
        return null;
    }

    return (
        <View style={styles.pendingWidget}>
            {syncResult ? (
                <View style={styles.syncResultContainer}>
                    {syncResult.success > 0 && (
                        <View style={styles.syncResultRow}>
                            <CheckCircle size={20} color={Colors.success} strokeWidth={2} />
                            <Text style={styles.syncResultText}>
                                {syncResult.success} transaction{syncResult.success > 1 ? 's' : ''} synchronisée{syncResult.success > 1 ? 's' : ''}
                            </Text>
                        </View>
                    )}
                    {syncResult.failed > 0 && (
                        <View style={styles.syncResultRow}>
                            <AlertCircle size={20} color={Colors.error} strokeWidth={2} />
                            <Text style={[styles.syncResultText, { color: Colors.error }]}>
                                {syncResult.failed} transaction{syncResult.failed > 1 ? 's' : ''} échouée{syncResult.failed > 1 ? 's' : ''}
                            </Text>
                        </View>
                    )}
                </View>
            ) : (
                <>
                    <View style={styles.pendingHeader}>
                        <AlertCircle size={20} color={Colors.accent} strokeWidth={2} />
                        <Text style={styles.pendingTitle}>
                            {pendingCount} transaction{pendingCount > 1 ? 's' : ''} en attente
                        </Text>
                    </View>
                    <Text style={styles.pendingDescription}>
                        Ces actions n'ont pas pu être effectuées en raison d'un problème de connexion.
                    </Text>
                    <TouchableOpacity
                        style={[
                            styles.syncButton,
                            (!isOnline || isSyncing) && styles.syncButtonDisabled
                        ]}
                        onPress={handleSync}
                        disabled={!isOnline || isSyncing}
                    >
                        {isSyncing ? (
                            <>
                                <ActivityIndicator size="small" color={Colors.white} />
                                <Text style={styles.syncButtonText}>Synchronisation...</Text>
                            </>
                        ) : (
                            <>
                                <RefreshCw size={18} color={Colors.white} strokeWidth={2} />
                                <Text style={styles.syncButtonText}>
                                    {isOnline ? 'Synchroniser' : 'Hors ligne'}
                                </Text>
                            </>
                        )}
                    </TouchableOpacity>
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    offlineBanner: {
        backgroundColor: Colors.error || '#ef4444',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
        marginHorizontal: 20,
        marginBottom: 16,
        borderRadius: 12,
        gap: 8,
    },
    offlineBannerText: {
        ...TextStyles.small,
        color: Colors.white,
        fontSize: FontSizes.medium,
        fontWeight: '600',
        flex: 1,
    },

    pendingWidget: {
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: Colors.accent || '#f59e0b',
        shadowColor: Colors.primaryBorder,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    pendingHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 8,
    },
    pendingTitle: {
        ...TextStyles.bodyBold,
        color: Colors.primaryBorder,
        fontSize: FontSizes.large,
    },
    pendingDescription: {
        ...TextStyles.body,
        color: Colors.muted,
        fontSize: FontSizes.medium,
        marginBottom: 16,
        lineHeight: 20,
    },
    syncButton: {
        backgroundColor: Colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 12,
        gap: 8,
    },
    syncButtonDisabled: {
        backgroundColor: Colors.muted,
        opacity: 0.6,
    },
    syncButtonText: {
        ...TextStyles.bodyBold,
        color: Colors.white,
        fontSize: FontSizes.medium,
    },

    syncResultContainer: {
        gap: 12,
    },
    syncResultRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    syncResultText: {
        ...TextStyles.body,
        color: Colors.primaryBorder,
        fontSize: FontSizes.medium,
        flex: 1,
    },
});
