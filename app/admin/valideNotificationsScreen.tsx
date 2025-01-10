import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, ActivityIndicator } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { Trash, Check } from 'lucide-react-native'; // Import Check icon
import Header from '../../components/header';
import BoutonRetour from '@/components/divers/boutonRetour';
import { Colors, Fonts, loadFonts } from '@/constants/GraphSettings';
import BoutonActiver from '@/components/divers/boutonActiver';
import { apiPost, apiGet } from '@/constants/api/apiCalls';
import ErrorScreen from '@/components/pages/errorPage';
import { useUser } from '@/contexts/UserContext';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

export default function ValideNotifications() {
  const route = useRoute();
  const navigation = useNavigation();
  
  const { id } = route.params; // Get the notification ID from route params
  const { setUser } = useUser();

  const [notificationDetails, setNotificationDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch notification details
  const fetchNotificationDetails = async () => {
    setLoading(true);
    try {
      const response = await apiGet(`getNotificationDetails/${id}`);
      if (response.success) {
        setNotificationDetails(response.data);
      } else {
        setError('Erreur lors de la récupération des détails de la notification');
      }
    } catch (error) {
      if (error.message === 'NoRefreshTokenError' || error.JWT_ERROR) {
        setUser(null);
      } else {
        setError(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle notification deletion or recovery
  const handleDelete = async (deleteFlag) => {
    setLoading(true);
    try {
      const response = await apiPost(`deleteNotification/${id}/${deleteFlag}`);
      if (response.success) {
        Toast.show({
          type: 'success',
          text1: 'Notification envoyée !',
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
    } catch (error) {
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
  }, []);

  if (error != '') {
    return <ErrorScreen error={error} />;
  }

  if (loading) {
    return (
      <View
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Header />
        <View
          style={{
            width: '100%',
            flex: 1,
            backgroundColor: Colors.white,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <ActivityIndicator size="large" color={Colors.gray} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header />
      <View style={styles.content}>
        <BoutonRetour previousRoute="gestionNotificationsScreen" title={`Gérer notification ${id}`} />
        <Text style={styles.title}>Détail de la notification :</Text>
        <View style={styles.textBox}>
          <Text style={styles.text}>Notification : {notificationDetails?.title || 'Pas de description'}</Text>
          <Text style={styles.text}>
            Date : {notificationDetails?.created_at ? new Date(notificationDetails.created_at).toLocaleString('fr-FR', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: false,
            }) : 'Date non disponible'}
          </Text>
          <Text style={styles.text}>S'applique à : {notificationDetails?.general ? 'Tout le monde' : 'Individuel'}</Text>
        </View>
        <View style={styles.anecdoteBox}>
          <Text style={styles.text}>{notificationDetails?.description}</Text>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <View style={styles.buttonSpacing}>
          <BoutonActiver
            title="Supprimer la notification"
            IconComponent={Trash}
            disabled={notificationDetails?.delete === 1} // Disable if already deleted
            onPress={() => handleDelete(1)} // Delete notification
          />
        </View>
        <BoutonActiver
          title="Récupérer la notification"
          IconComponent={Check}
          disabled={notificationDetails?.delete === 0} // Disable if not deleted
          onPress={() => handleDelete(0)} // Recover notification
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  content: {
    width: '100%',
    flex: 1,
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  title: {
    marginTop: 20,
    fontSize: 16,
    color: Colors.black,
    fontFamily: 'Inter',
    fontWeight: '600',
  },
  textBox: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: Colors.gray,
    borderRadius: 8,
    padding: 10,
    backgroundColor: Colors.white,
    marginBottom: 20,
  },
  anecdoteBox: {
    padding: 14,
    minHeight: 200,
    marginTop: 8,
    marginBottom: 8,
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    gap: 8,
    width: '100%',
  },
  text: {
    fontSize: 14,
    color: Colors.black,
    fontFamily: 'Inter',
    fontWeight: '400',
    lineHeight: 20,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 20,
    width: '100%',
    paddingHorizontal: 20,
  },
  buttonSpacing: {
    marginBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
