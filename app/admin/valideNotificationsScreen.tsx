import React, { useState, useEffect, useCallback } from 'react';
import { Text, View, StyleSheet, ActivityIndicator, SafeAreaView } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { Trash, Check, Bell, Calendar, Users } from 'lucide-react-native';
import Header from '../../components/header';
import BoutonRetour from '@/components/divers/boutonRetour';
import { Colors, TextStyles, loadFonts } from '@/constants/GraphSettings';
import BoutonActiver from '@/components/divers/boutonActiver';
import { apiPost, apiGet } from '@/constants/api/apiCalls';
import ErrorScreen from '@/components/pages/errorPage';
import { useUser } from '@/contexts/UserContext';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

export default function ValideNotifications() {
  const route = useRoute();
  const navigation = useNavigation();

  const { id } = route.params;
  const { setUser } = useUser();

  const [notificationDetails, setNotificationDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchNotificationDetails = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiGet(`getNotificationDetails/${id}`);
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

  const handleDelete = async (deleteFlag) => {
    setLoading(true);
    try {
      const response = await apiPost(`deleteNotification/${id}/${deleteFlag}`);
      if (response.success) {
        if (deleteFlag === 1) {
          Toast.show({
            type: 'success',
            text1: 'Notification désactivée !',
            text2: response.message,
          });
          navigation.goBack();
        } else {
          Toast.show({
            type: 'success',
            text1: 'Notification envoyée !',
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
    const loadAsyncFonts = async () => {
      await loadFonts();
    };
    loadAsyncFonts();

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

      {/* Hero Section */}
      <View style={styles.heroSection}>
        <View style={styles.heroIcon}>
          <Bell size={24} color={Colors.primary} />
        </View>
        <Text style={styles.heroTitle}>Détail de la notification #{id}</Text>
        <Text style={styles.heroSubtitle}>
          Gérez l'état de cette notification
        </Text>
      </View>

      <View style={styles.content}>
        {/* Info Card */}
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

        {/* Content Card */}
        <View style={styles.contentCard}>
          <Text style={styles.contentTitle}>Contenu de la notification</Text>
          <Text style={styles.contentText}>{notificationDetails?.description}</Text>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <View style={styles.buttonSpacing}>
          <BoutonActiver
            title="Désactiver la notification"
            IconComponent={Trash}
            disabled={notificationDetails?.delete === 1}
            onPress={() => handleDelete(1)}
          />
        </View>
        <BoutonActiver
          title="Activer la notification"
          IconComponent={Check}
          disabled={notificationDetails?.delete === 0}
          onPress={() => handleDelete(0)}
        />
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
    paddingVertical: 24,
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
    ...TextStyles.h2,
    color: Colors.primaryBorder,
    fontWeight: '700',
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
    paddingHorizontal: 20,
    paddingBottom: 120,
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
  },
  contentTitle: {
    ...TextStyles.h3,
    color: Colors.primaryBorder,
    fontWeight: '600',
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
  buttonSpacing: {
    marginBottom: 16,
  },
});
