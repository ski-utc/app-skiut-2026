import React, { useState, useEffect, useCallback } from 'react';
import { Text, View, StyleSheet, ActivityIndicator, ScrollView, SafeAreaView } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { Trash, Check, Bell, Calendar, Users } from 'lucide-react-native';
import Header from '../../components/header';
import BoutonRetour from '@/components/divers/boutonRetour';
import { Colors, TextStyles } from '@/constants/GraphSettings';
import BoutonActiver from '@/components/divers/boutonActiver';
import { apiPost, apiGet, apiPut } from '@/constants/api/apiCalls';
import ErrorScreen from '@/components/pages/errorPage';
import { useUser } from '@/contexts/UserContext';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

interface NotificationDetails {
  id: number;
  title: string;
  description: string;
  created_at: string;
  general: number;
  display: 0 | 1;
}

interface RouteParams {
  id: number;
}

export default function ValideNotifications() {
  const route = useRoute();
  const navigation = useNavigation();

  const { id } = (route.params as RouteParams) || { id: 0 };
  const { setUser } = useUser();

  const [notificationDetails, setNotificationDetails] = useState<NotificationDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchNotificationDetails = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiGet(`admin/notifications/${id}`);
      if (response.success) {
        setNotificationDetails(response.data);
      } else {
        setError('Erreur lors de la récupération des détails de la notification');
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
  }, [id, setUser]);

  const handleDelete = async (displayFlag: number) => {
    setLoading(true);
    try {
      const response = await apiPut(`admin/notifications/${id}/display`, { display_flag: displayFlag });
      if (response.success) {
        if (displayFlag === 1) {
          Toast.show({
            type: 'success',
            text1: 'Notification désactivée !',
            text2: response.message,
          });
          navigation.goBack();
        } else {
          Toast.show({
            type: 'success',
            text1: 'Notification réactivée !',
            text2: response.message,
          });
          navigation.goBack();
        }
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

  useEffect(() => {
    fetchNotificationDetails();
  }, [fetchNotificationDetails]);

  if (error !== '') {
    return <ErrorScreen error={error} />;
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header refreshFunction={null} disableRefresh={true} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Chargement des détails...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header refreshFunction={null} disableRefresh={true} />
      <View style={styles.headerContainer}>
        <BoutonRetour previousRoute="gestionNotificationsScreen" title={`Gérer notification`} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroSection}>
          <View style={styles.heroIcon}>
            <Bell size={24} color={Colors.primary} />
          </View>
          <Text style={styles.heroTitle}>Détail de la notification #{id}</Text>
          <Text style={styles.heroSubtitle}>
            Gérez l'état de cette notification
          </Text>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Bell size={16} color={Colors.primary} />
            <Text style={styles.infoLabel}>Notification :</Text>
            <Text style={styles.infoValue}>{notificationDetails?.title || 'Pas de titre'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Calendar size={16} color={Colors.primary} />
            <Text style={styles.infoLabel}>Date :</Text>
            <Text style={styles.infoValue}>
              {notificationDetails?.created_at ? new Date(notificationDetails.created_at).toLocaleString('fr-FR', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
              }) : 'Date non disponible'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Users size={16} color={Colors.primary} />
            <Text style={styles.infoLabel}>S'applique à :</Text>
            <Text style={styles.infoValue}>{notificationDetails?.general ? 'Tout le monde' : 'Individuel'}</Text>
          </View>
        </View>

        <View style={styles.contentCard}>
          <Text style={styles.contentTitle}>Contenu de la notification</Text>
          <Text style={styles.contentText}>{notificationDetails?.description}</Text>
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        {notificationDetails?.display === 0 ? (
          <BoutonActiver
            title="Désactiver la notification"
            IconComponent={Trash}
            color={Colors.error}
            onPress={() => handleDelete(1)}
          />
        ) : (
          <BoutonActiver
            title="Activer la notification"
            IconComponent={Check}
            color={Colors.success}
            onPress={() => handleDelete(0)}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
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
    paddingBottom: 24,
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
    color: Colors.muted,
    textAlign: 'center',
    lineHeight: 20,
  },
  content: {
    flex: 1,
  },
  infoCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 2, height: 3 },
    shadowRadius: 5,
    elevation: 3,
    padding: 16,
    marginBottom: 16,
    marginHorizontal: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  infoLabel: {
    ...TextStyles.body,
    color: Colors.primaryBorder,
    fontWeight: '600',
    marginLeft: 8,
    marginRight: 8,
    minWidth: 80,
  },
  infoValue: {
    ...TextStyles.body,
    color: Colors.muted,
    flex: 1,
    lineHeight: 20,
  },
  contentCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colors.primary,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 2, height: 3 },
    shadowRadius: 5,
    elevation: 3,
    padding: 16,
    minHeight: 150,
    marginBottom: 88,
    marginHorizontal: 20,
  },
  contentTitle: {
    ...TextStyles.h3Bold,
    color: Colors.primaryBorder,
    marginBottom: 12,
  },
  contentText: {
    ...TextStyles.body,
    color: Colors.primaryBorder,
    lineHeight: 22,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
});
