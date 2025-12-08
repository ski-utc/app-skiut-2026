import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  FlatList,
  StatusBar,
  StyleSheet,
} from 'react-native';
import { BlurView } from 'expo-blur';
import {
  X,
  Bell,
  Clock,
  AlertCircle,
  Globe,
  Users,
  Home,
  Check,
} from 'lucide-react-native';
import Toast from 'react-native-toast-message';

import { Colors, TextStyles, FontSizes } from '@/constants/GraphSettings';
import {
  apiGet,
  apiPost,
  isSuccessResponse,
  isPendingResponse,
  handleApiErrorToast,
  AppError,
} from '@/constants/api/apiCalls';
import { useUser } from '@/contexts/UserContext';

type NotificationItem = {
  id: number;
  title: string;
  description: string;
  type?: 'global' | 'targeted' | 'room_based';
  created_at: string;
  read: boolean;
  read_at?: string;
  delete?: boolean;
};

type NotificationPopupProps = {
  visible: boolean;
  onClose: () => void;
};

export default function NotificationPopup({
  visible,
  onClose,
}: NotificationPopupProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { setUser } = useUser();

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await apiGet<NotificationItem[]>('notifications');

      if (isSuccessResponse(response)) {
        setNotifications(response.data || []);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        handleApiErrorToast(err as AppError, setUser);
      }
    } finally {
      setLoading(false);
    }
  }, [setUser]);

  const markAsRead = async (notificationId: number) => {
    try {
      const response = await apiPost(`notifications/${notificationId}/read`, {
        read: true,
      });

      const updateLocalState = () => {
        setNotifications((prev) =>
          prev.map((notif) =>
            notif.id === notificationId
              ? { ...notif, read: true, read_at: new Date().toISOString() }
              : notif,
          ),
        );
      };

      if (isSuccessResponse(response)) {
        updateLocalState();
      } else if (isPendingResponse(response)) {
        updateLocalState();
        Toast.show({
          type: 'info',
          text1: 'Marqué comme lu',
          text2: 'Sera synchronisé au retour de la connexion',
        });
      }
    } catch (err: unknown) {
      handleApiErrorToast(err as AppError, setUser);
    }
  };

  const getNotificationIcon = (type?: string) => {
    switch (type) {
      case 'global':
        return Globe;
      case 'targeted':
        return Users;
      case 'room_based':
        return Home;
      default:
        return Clock;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  useEffect(() => {
    if (visible) {
      fetchNotifications();
    }
  }, [visible, fetchNotifications]);

  if (error !== '') {
    return (
      <Modal
        transparent={true}
        visible={visible}
        animationType="fade"
        onRequestClose={onClose}
      >
        <StatusBar
          barStyle="light-content"
          translucent={true}
          backgroundColor="rgba(0,0,0,0.3)"
        />
        <BlurView intensity={30} tint="dark" style={styles.overlay}>
          <View style={styles.modalContainer}>
            <View style={styles.header}>
              <View style={styles.headerIcon}>
                <AlertCircle size={24} color={Colors.error} strokeWidth={2} />
              </View>
              <Text style={styles.headerTitle}>Erreur</Text>
            </View>

            <View style={styles.content}>
              <Text style={styles.errorTitle}>Une erreur est survenue</Text>
              <Text style={styles.errorDescription}>{error}</Text>
              <Text style={styles.errorFooter}>
                Si l'erreur persiste, merci de contacter l'équipe technique
              </Text>
            </View>

            <View style={styles.footer}>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <X size={20} color={Colors.white} strokeWidth={2} />
              </TouchableOpacity>
            </View>
          </View>
        </BlurView>
      </Modal>
    );
  }

  if (loading) {
    return (
      <Modal
        transparent={true}
        visible={visible}
        animationType="fade"
        onRequestClose={onClose}
      >
        <StatusBar
          barStyle="light-content"
          translucent={true}
          backgroundColor="rgba(0,0,0,0.3)"
        />
        <BlurView intensity={30} tint="dark" style={styles.overlay}>
          <View style={styles.modalContainer}>
            <View style={styles.header}>
              <View style={styles.headerIcon}>
                <Bell size={24} color={Colors.primary} strokeWidth={2} />
              </View>
              <Text style={styles.headerTitle}>Notifications</Text>
            </View>

            <View style={styles.content}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.loadingText}>
                Chargement des notifications...
              </Text>
            </View>

            <View style={styles.footer}>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <X size={20} color={Colors.white} strokeWidth={2} />
              </TouchableOpacity>
            </View>
          </View>
        </BlurView>
      </Modal>
    );
  }

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <StatusBar
        barStyle="light-content"
        translucent={true}
        backgroundColor="rgba(0,0,0,0.3)"
      />
      <BlurView intensity={30} tint="dark" style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <Bell size={24} color={Colors.primary} strokeWidth={2} />
            </View>
            <Text style={styles.headerTitle}>Notifications</Text>
          </View>

          <View style={styles.content}>
            {notifications.length > 0 ? (
              <FlatList
                data={notifications}
                renderItem={({ item }) => {
                  const IconComponent = getNotificationIcon(item.type);
                  return (
                    <TouchableOpacity
                      style={[
                        styles.notificationItem,
                        !item.read && styles.notificationItemUnread,
                      ]}
                      onPress={() => !item.read && markAsRead(item.id)}
                      activeOpacity={0.8}
                    >
                      <View
                        style={[
                          styles.notificationIcon,
                          !item.read && styles.notificationIconUnread,
                        ]}
                      >
                        <IconComponent
                          size={16}
                          color={Colors.primary}
                          strokeWidth={2}
                        />
                      </View>
                      <View style={styles.notificationContent}>
                        <View style={styles.notificationHeader}>
                          <Text
                            style={[
                              styles.notificationTitle,
                              !item.read && styles.notificationTitleUnread,
                            ]}
                          >
                            {item.title}
                          </Text>
                          {!item.read && (
                            <View style={styles.unreadBadge}>
                              <View style={styles.unreadDot} />
                            </View>
                          )}
                        </View>
                        <Text style={styles.notificationDescription}>
                          {item.description}
                        </Text>
                        <View style={styles.notificationFooter}>
                          <View style={styles.notificationMeta}>
                            <Text style={styles.notificationDate}>
                              {formatDate(item.created_at)}
                            </Text>
                          </View>
                          {item.read && (
                            <View style={styles.readIndicator}>
                              <Check size={12} color={Colors.success} />
                              <Text style={styles.readText}>Lu</Text>
                            </View>
                          )}
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                }}
                keyExtractor={(item) => item.id.toString()}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContainer}
              />
            ) : (
              <View style={styles.emptyState}>
                <View style={styles.emptyIcon}>
                  <Bell size={48} color={Colors.primary} strokeWidth={1.5} />
                </View>
                <Text style={styles.emptyTitle}>Aucune notification</Text>
                <Text style={styles.emptyDescription}>
                  Il n'y a rien ici pour le moment
                </Text>
              </View>
            )}
          </View>

          <View style={styles.footer}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={20} color={Colors.white} strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </View>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  closeButton: {
    alignItems: 'center',
    backgroundColor: Colors.primaryBorder,
    borderRadius: 24,
    elevation: 6,
    height: 48,
    justifyContent: 'center',
    shadowColor: Colors.primaryBorder,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    width: 48,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },

  emptyDescription: {
    ...TextStyles.body,
    color: Colors.muted,
    textAlign: 'center',
  },
  emptyIcon: {
    alignItems: 'center',
    backgroundColor: Colors.lightMuted,
    borderRadius: 40,
    height: 80,
    justifyContent: 'center',
    marginBottom: 20,
    width: 80,
  },
  emptyState: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },

  emptyTitle: {
    ...TextStyles.h4,
    color: Colors.primaryBorder,
    marginBottom: 8,
    textAlign: 'center',
  },

  errorDescription: {
    ...TextStyles.body,
    color: Colors.muted,
    lineHeight: 22,
    marginBottom: 20,
    textAlign: 'center',
  },
  errorFooter: {
    ...TextStyles.small,
    color: Colors.muted,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  errorTitle: {
    ...TextStyles.h3,
    color: Colors.primaryBorder,
    marginBottom: 16,
    textAlign: 'center',
  },

  footer: {
    alignItems: 'center',
    borderTopColor: Colors.lightMuted,
    borderTopWidth: 1,
    paddingVertical: 14,
  },

  header: {
    alignItems: 'center',
    borderBottomColor: Colors.lightMuted,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  headerIcon: {
    alignItems: 'center',
    backgroundColor: Colors.lightMuted,
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    marginRight: 12,
    width: 40,
  },
  headerTitle: {
    ...TextStyles.h2,
    color: Colors.primaryBorder,
  },
  listContainer: {
    paddingBottom: 16,
    paddingTop: 16,
  },
  loadingText: {
    ...TextStyles.body,
    color: Colors.muted,
    marginTop: 16,
    textAlign: 'center',
  },
  modalContainer: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    elevation: 15,
    height: '90%',
    shadowColor: Colors.primaryBorder,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    width: '90%',
  },
  notificationContent: {
    flex: 1,
  },
  notificationDate: {
    ...TextStyles.small,
    color: Colors.muted,
    fontSize: 11,
  },
  notificationDescription: {
    ...TextStyles.body,
    color: Colors.muted,
    fontSize: FontSizes.small,
    lineHeight: 18,
    marginBottom: 8,
  },
  notificationFooter: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  notificationHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  notificationIcon: {
    alignItems: 'center',
    backgroundColor: Colors.lightMuted,
    borderRadius: 16,
    flexShrink: 0,
    height: 32,
    justifyContent: 'center',
    marginRight: 12,
    width: 32,
  },
  notificationIconUnread: {
    backgroundColor: '#E3F2FD',
  },
  notificationItem: {
    backgroundColor: Colors.white,
    borderColor: Colors.lightMuted,
    borderRadius: 16,
    borderWidth: 1,
    elevation: 2,
    flexDirection: 'row',
    marginBottom: 8,
    padding: 16,
    shadowColor: Colors.primaryBorder,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  notificationItemUnread: {
    backgroundColor: '#F8F9FF',
    borderColor: Colors.primary,
    borderWidth: 1.5,
  },
  notificationMeta: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  notificationTitle: {
    ...TextStyles.bodyBold,
    color: Colors.primaryBorder,
    flex: 1,
  },
  notificationTitleUnread: {
    color: Colors.primary,
  },

  overlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    flex: 1,
    justifyContent: 'center',
  },
  readIndicator: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  readText: {
    ...TextStyles.small,
    color: Colors.success,
    fontSize: 11,
    fontWeight: '500',
  },

  unreadBadge: {
    marginLeft: 8,
  },
  unreadDot: {
    backgroundColor: Colors.primary,
    borderRadius: 4,
    height: 8,
    width: 8,
  },
});
