import { useState, useEffect, useCallback } from 'react';
import { Text, View, StyleSheet, ActivityIndicator, ScrollView, SafeAreaView } from 'react-native';
import { useRoute, NavigationProp, useNavigation } from '@react-navigation/native';
import { Check, Bell, Calendar, Users, X } from 'lucide-react-native';
import Toast from 'react-native-toast-message';

import BoutonRetour from '@/components/divers/boutonRetour';
import { Colors, TextStyles } from '@/constants/GraphSettings';
import BoutonActiver from '@/components/divers/boutonActiver';
import { ApiError, apiGet, apiPut, handleApiErrorScreen, handleApiErrorToast } from '@/constants/api/apiCalls';
import ErrorScreen from '@/components/pages/errorPage';
import { useUser } from '@/contexts/UserContext';

import Header from '../../components/header';

import { AdminStackParamList } from './adminNavigator';

type NotificationDetails = {
  id: number;
  title: string;
  description: string;
  created_at: string;
  general: number;
  display: boolean;
}

type RouteParams = {
  id: number;
}

export default function ValideNotifications() {
  const route = useRoute();
  const navigation = useNavigation<NavigationProp<AdminStackParamList>>();

  const { id } = (route.params as RouteParams) || { id: 0 };
  const { setUser } = useUser();

  const [notificationDetails, setNotificationDetails] = useState<NotificationDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchNotificationDetails = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiGet<NotificationDetails>(`admin/notifications/${id}`);
      if (response.success) {
        setNotificationDetails(response.data);
      } else {
        handleApiErrorScreen(new ApiError(response.message), setUser, setError);
      }
    } catch (error: unknown) {
      handleApiErrorScreen(error, setUser, setError);
    } finally {
      setLoading(false);
    }
  }, [id, setUser]);

  const handleDelete = async (displayFlag: boolean) => {
    setLoading(true);
    try {
      const response = await apiPut(`admin/notifications/${id}/display`, { display_flag: displayFlag });
      if (response.success) {
        if (displayFlag === true) {
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
      } else if (response.pending) {
        Toast.show({
          type: 'info',
          text1: 'Requête sauvegardée',
          text2: response.message,
        });
        navigation.goBack();
      } else {
        Toast.show({
          type: 'error',
          text1: 'Une erreur est survenue...',
          text2: response.message,
        });
      }
    } catch (error: unknown) {
      handleApiErrorToast(error, setUser);
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
        <BoutonRetour title={`Gérer notification`} />
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
        {notificationDetails?.display === true ? (
          <BoutonActiver
            title="Désactiver la notification"
            IconComponent={X}
            color={Colors.error}
            onPress={() => handleDelete(true)}
          />
        ) : (
          <BoutonActiver
            title="Activer la notification"
            IconComponent={Check}
            color={Colors.success}
            onPress={() => handleDelete(false)}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    bottom: 20,
    left: 20,
    position: 'absolute',
    right: 20,
  },
  container: {
    backgroundColor: Colors.white,
    flex: 1,
  },
  content: {
    flex: 1,
  },
  contentCard: {
    backgroundColor: Colors.white,
    borderColor: Colors.primary,
    borderRadius: 14,
    borderWidth: 2,
    elevation: 3,
    marginBottom: 88,
    marginHorizontal: 20,
    minHeight: 150,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
  },
  contentText: {
    ...TextStyles.body,
    color: Colors.primaryBorder,
    lineHeight: 22,
  },
  contentTitle: {
    ...TextStyles.h3Bold,
    color: Colors.primaryBorder,
    marginBottom: 12,
  },
  headerContainer: {
    paddingBottom: 8,
    paddingHorizontal: 20,
  },
  heroIcon: {
    alignItems: 'center',
    backgroundColor: Colors.lightMuted,
    borderRadius: 32,
    height: 64,
    justifyContent: 'center',
    marginBottom: 16,
    width: 64,
  },
  heroSection: {
    alignItems: 'center',
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  heroSubtitle: {
    ...TextStyles.body,
    color: Colors.muted,
    lineHeight: 20,
    textAlign: 'center',
  },
  heroTitle: {
    ...TextStyles.h2Bold,
    color: Colors.primaryBorder,
    marginBottom: 8,
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: Colors.white,
    borderColor: 'rgba(0,0,0,0.06)',
    borderRadius: 14,
    borderWidth: 1,
    elevation: 3,
    marginBottom: 16,
    marginHorizontal: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
  },
  infoLabel: {
    ...TextStyles.body,
    color: Colors.primaryBorder,
    fontWeight: '600',
    marginLeft: 8,
    marginRight: 8,
    minWidth: 80,
  },
  infoRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  infoValue: {
    ...TextStyles.body,
    color: Colors.muted,
    flex: 1,
    lineHeight: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    backgroundColor: Colors.white,
    flex: 1,
    justifyContent: 'center',
  },
  loadingText: {
    ...TextStyles.body,
    color: Colors.muted,
    marginTop: 16,
    textAlign: 'center',
  },
});
