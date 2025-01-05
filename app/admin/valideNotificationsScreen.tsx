import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, ActivityIndicator } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { X, Trash, Check } from 'lucide-react-native'; // Import Check icon
import Header from '../../components/header';
import BoutonRetour from '@/components/divers/boutonRetour';
import { Colors, Fonts } from '@/constants/GraphSettings';
import BoutonActiver from '@/components/divers/boutonActiver';
import { apiPost, apiGet } from '@/constants/api/apiCalls';
import ErrorScreen from '@/components/pages/errorPage';

export default function ValideNotifications() {
  const route = useRoute();
  const { id } = route.params; // Get the notification ID from route params
  console.log('Notification ID:', id);

  const [notificationDetails, setNotificationDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [disableRefresh, setDisableRefresh] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // Fetch notification details
  const fetchNotificationDetails = async (incrementalLoad = false) => {
    if (!incrementalLoad) setLoading(true);
    else setLoadingMore(true);
    setDisableRefresh(true);
    try {
      const response = await apiGet(`getNotificationDetails/${id}`);
      if (response.success) {
        setNotificationDetails(response.data);
      } else {
        setError('Erreur lors de la récupération des détails de la notification');
      }
    } catch (err) {
      setError('Erreur lors de la récupération des détails');
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setTimeout(() => {
        setDisableRefresh(false); 
      }, 5000);
    }
  };

  // Handle notification deletion or recovery
  const handleDelete = async (deleteFlag) => {
    setLoading(true);
    try {
      const response = await apiPost(`deleteNotification/${id}/${deleteFlag}`);
      if (response.success) {
        fetchNotificationDetails(); // Refresh the details after successful operation
      }
    } catch (err) {
      setError('Erreur lors de la mise à jour de la notification');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotificationDetails(); // Load notification details on component mount
  }, [id]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="gray" />
      </View>
    );
  }

  if (error) {
    return <ErrorScreen error={error} />;
  }

  return (
    <View style={styles.container}>
      <Header refreshFunction={fetchNotificationDetails} disableRefresh={disableRefresh} />
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
