import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {
  WifiOff,
  RefreshCw,
  CheckCircle,
  AlertCircle,
} from 'lucide-react-native';
import { addEventListener } from '@react-native-community/netinfo';

import { Colors, FontSizes, TextStyles } from '@/constants/GraphSettings';
import {
  getPendingRequests,
  syncPendingRequests,
  SyncPendingRequestsResult,
  handleApiErrorToast,
} from '@/constants/api/apiCalls';
import { useUser } from '@/contexts/UserContext';

type OfflineStatusProps = {
  onNetworkChange?: (isConnected: boolean) => void;
};

export const OfflineStatusBanner: React.FC<OfflineStatusProps> = ({
  onNetworkChange,
}) => {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const unsubscribe = addEventListener((state) => {
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
  const [syncPendingRequestsResult, setSyncPendingRequestsResult] =
    useState<SyncPendingRequestsResult | null>(null);
  const [isOnline, setIsOnline] = useState(true);

  const { setUser } = useUser();

  const loadPendingCount = useCallback(async () => {
    const pending = await getPendingRequests();
    setPendingCount(pending.length);
  }, []);

  useEffect(() => {
    loadPendingCount();

    const interval = setInterval(loadPendingCount, 30000);

    const unsubscribe = addEventListener((state) => {
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
  }, [loadPendingCount]);

  const handleSync = async () => {
    if (!isOnline) return;

    setIsSyncing(true);
    setSyncPendingRequestsResult(null);

    try {
      const result = await syncPendingRequests();
      setSyncPendingRequestsResult(result);

      await loadPendingCount();

      setTimeout(() => {
        setSyncPendingRequestsResult(null);
      }, 5000);
    } catch (error) {
      handleApiErrorToast(error, setUser);
      setSyncPendingRequestsResult({
        success: 0,
        failed: pendingCount,
        retrying: 0,
        errors: [{ error: 'Erreur technique lors de la synchronisation' }],
      });
    } finally {
      setIsSyncing(false);
    }
  };

  if (pendingCount === 0 && !syncPendingRequestsResult) {
    return null;
  }

  return (
    <View style={styles.pendingWidget}>
      {syncPendingRequestsResult ? (
        <View style={styles.syncPendingRequestsResultContainer}>
          {syncPendingRequestsResult.success > 0 && (
            <View style={styles.syncPendingRequestsResultRow}>
              <CheckCircle size={20} color={Colors.success} strokeWidth={2} />
              <Text style={styles.syncPendingRequestsResultText}>
                {syncPendingRequestsResult.success} transaction
                {syncPendingRequestsResult.success > 1 ? 's' : ''} synchronisée
                {syncPendingRequestsResult.success > 1 ? 's' : ''}
              </Text>
            </View>
          )}
          {syncPendingRequestsResult.failed > 0 && (
            <View style={styles.syncPendingRequestsResultRow}>
              <AlertCircle size={20} color={Colors.error} strokeWidth={2} />
              <Text
                style={[
                  styles.syncPendingRequestsResultText,
                  { color: Colors.error },
                ]}
              >
                {syncPendingRequestsResult.failed} transaction
                {syncPendingRequestsResult.failed > 1 ? 's' : ''} abandonnée
                {syncPendingRequestsResult.failed > 1 ? 's' : ''}
              </Text>
            </View>
          )}
          {syncPendingRequestsResult.retrying > 0 && (
            <View style={styles.syncPendingRequestsResultRow}>
              <RefreshCw size={20} color={Colors.accent} strokeWidth={2} />
              <Text
                style={[
                  styles.syncPendingRequestsResultText,
                  { color: Colors.accent },
                ]}
              >
                {syncPendingRequestsResult.retrying} transaction
                {syncPendingRequestsResult.retrying > 1 ? 's' : ''} re-planifiée
                {syncPendingRequestsResult.retrying > 1 ? 's' : ''}
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
            Ces actions n'ont pas pu être effectuées en raison d'un problème de
            connexion.
          </Text>
          <TouchableOpacity
            style={[
              styles.syncButton,
              (!isOnline || isSyncing) && styles.syncButtonDisabled,
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
                  {isOnline
                    ? 'Synchroniser maintenant'
                    : 'En attente de connexion'}
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
    alignItems: 'center',
    backgroundColor: Colors.error || '#ef4444',
    borderRadius: 12,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginBottom: 16,
    marginHorizontal: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  offlineBannerText: {
    ...TextStyles.small,
    color: Colors.white,
    flex: 1,
    fontSize: FontSizes.medium,
    fontWeight: '600',
  },

  pendingDescription: {
    ...TextStyles.body,
    color: Colors.muted,
    fontSize: FontSizes.medium,
    lineHeight: 20,
    marginBottom: 16,
  },
  pendingHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  pendingTitle: {
    ...TextStyles.bodyBold,
    color: Colors.primaryBorder,
    fontSize: FontSizes.large,
  },
  pendingWidget: {
    backgroundColor: Colors.white,
    borderColor: Colors.accent || '#f59e0b',
    borderRadius: 16,
    borderWidth: 1,
    elevation: 3,
    marginBottom: 16,
    padding: 20,
    shadowColor: Colors.primaryBorder,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  syncButton: {
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 12,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
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

  syncPendingRequestsResultContainer: {
    gap: 12,
  },
  syncPendingRequestsResultRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  syncPendingRequestsResultText: {
    ...TextStyles.body,
    color: Colors.primaryBorder,
    flex: 1,
    fontSize: FontSizes.medium,
  },
});
