import React from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, Modal, FlatList, StatusBar, StyleSheet } from "react-native";
import { Colors, TextStyles, FontSizes } from "@/constants/GraphSettings";
import { BlurView } from "expo-blur";
import { X, Bell, Clock, AlertCircle } from "lucide-react-native";
import { useEffect, useState, useCallback } from "react";
import { apiGet } from "@/constants/api/apiCalls";
import { useUser } from "@/contexts/UserContext";

interface NotificationItem {
  id: number;
  title: string;
  description: string;
  delete?: boolean;
}

interface NotificationPopupProps {
  visible: boolean;
  onClose: () => void;
}

// @ts-ignore
export default function NotificationPopup({ visible, onClose }: NotificationPopupProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { setUser } = useUser();

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiGet('getNotifications');
      if (response.success) {
        setNotifications(response.data.filter((item: NotificationItem) => !item.delete));
      } else {
        setError('Une erreur est survenue lors de la récupération des notifications');
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
  }, [setUser]);

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
        <StatusBar barStyle="light-content" translucent={true} backgroundColor="rgba(0,0,0,0.3)" />
        <BlurView
          intensity={30}
          tint="dark"
          style={styles.overlay}
          experimentalBlurMethod={undefined}
        >
          <View style={styles.modalContainer}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerIcon}>
                <AlertCircle size={24} color={Colors.error} strokeWidth={2} />
              </View>
              <Text style={styles.headerTitle}>Erreur</Text>
            </View>

            {/* Content */}
            <View style={styles.content}>
              <Text style={styles.errorTitle}>Une erreur est survenue</Text>
              <Text style={styles.errorDescription}>{error}</Text>
              <Text style={styles.errorFooter}>
                Si l'erreur persiste, merci de contacter l'équipe technique
              </Text>
            </View>

            {/* Footer */}
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
        <StatusBar barStyle="light-content" translucent={true} backgroundColor="rgba(0,0,0,0.3)" />
        <BlurView
          intensity={30}
          tint="dark"
          style={styles.overlay}
          experimentalBlurMethod={undefined}
        >
          <View style={styles.modalContainer}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerIcon}>
                <Bell size={24} color={Colors.primary} strokeWidth={2} />
              </View>
              <Text style={styles.headerTitle}>Notifications</Text>
            </View>

            {/* Content */}
            <View style={styles.content}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.loadingText}>Chargement des notifications...</Text>
            </View>

            {/* Footer */}
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
      <StatusBar barStyle="light-content" translucent={true} backgroundColor="rgba(0,0,0,0.3)" />
      <BlurView
        intensity={30}
        tint="dark"
        style={styles.overlay}
      >
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <Bell size={24} color={Colors.primary} strokeWidth={2} />
            </View>
            <Text style={styles.headerTitle}>Notifications</Text>
          </View>

          {/* Content */}
          <View style={styles.content}>
            {notifications.length > 0 ? (
              <FlatList
                data={notifications}
                renderItem={({ item }) => (
                  <View style={styles.notificationItem}>
                    <View style={styles.notificationIcon}>
                      <Clock size={16} color={Colors.primary} strokeWidth={2} />
                    </View>
                    <View style={styles.notificationContent}>
                      <Text style={styles.notificationTitle}>{item.title}</Text>
                      <Text style={styles.notificationDescription}>{item.description}</Text>
                    </View>
                  </View>
                )}
                keyExtractor={(item) => item.id.toString()}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContainer}
              />
            ) : (
              <View style={styles.emptyState}>
                <View style={styles.emptyIcon}>
                  <Bell size={48} color={Colors.lightMuted} strokeWidth={1.5} />
                </View>
                <Text style={styles.emptyTitle}>Aucune notification</Text>
                <Text style={styles.emptyDescription}>
                  Il n'y a rien ici pour le moment
                </Text>
              </View>
            )}
          </View>

          {/* Footer */}
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
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: Colors.white,
    width: "90%",
    height: "90%",
    borderRadius: 24,
    shadowColor: Colors.primaryBorder,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 15,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightMuted,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.lightMuted,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  headerTitle: {
    ...TextStyles.h2,
    color: Colors.primaryBorder,
  },

  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },

  errorTitle: {
    ...TextStyles.h3,
    color: Colors.primaryBorder,
    textAlign: "center",
    marginBottom: 16,
  },
  errorDescription: {
    ...TextStyles.body,
    color: Colors.muted,
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 22,
  },
  errorFooter: {
    ...TextStyles.small,
    color: Colors.muted,
    textAlign: "center",
    fontStyle: "italic",
  },

  loadingText: {
    ...TextStyles.body,
    color: Colors.muted,
    textAlign: "center",
    marginTop: 16,
  },

  listContainer: {
    paddingBottom: 16,
  },
  notificationItem: {
    flexDirection: "row",
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.lightMuted,
    shadowColor: Colors.primaryBorder,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  notificationIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.lightMuted,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    flexShrink: 0,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    ...TextStyles.bodyBold,
    color: Colors.primaryBorder,
    marginBottom: 4,
  },
  notificationDescription: {
    ...TextStyles.body,
    color: Colors.muted,
    fontSize: FontSizes.small,
    lineHeight: 18,
  },

  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.lightMuted,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    ...TextStyles.h4,
    color: Colors.primaryBorder,
    marginBottom: 8,
    textAlign: "center",
  },
  emptyDescription: {
    ...TextStyles.body,
    color: Colors.muted,
    textAlign: "center",
  },

  footer: {
    alignItems: "center",
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.lightMuted,
  },
  closeButton: {
    width: 48,
    height: 48,
    backgroundColor: Colors.primaryBorder,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.primaryBorder,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
});