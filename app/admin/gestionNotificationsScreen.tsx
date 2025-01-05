import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, Text } from 'react-native';
import BoutonRetour from '@/components/divers/boutonRetour';
import Header from '../../components/header';
import BoutonGestion from '@/components/admins/boutonGestion';
import { apiGet } from '@/constants/api/apiCalls';
import { useNavigation } from '@react-navigation/native';
import ErrorScreen from '@/components/pages/errorPage';

const GestionNotificationsScreen = () => {
  const navigation = useNavigation();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [disableRefresh, setDisableRefresh] = useState(false);

  // Fetch notifications from the API
  const fetchAdminNotifications = async () => {
    setLoading(true);
    setDisableRefresh(true);
    try {
      const response = await apiGet('getAdminNotifications');
      if (response.success) {
        setNotifications(response.data);
        console.log('Notifications:', response.data);
      } else {
        setError('Erreur lors de la récupération des notifications');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setDisableRefresh(false);
    }
  };

  useEffect(() => {
    fetchAdminNotifications();
  }, []);

  if (error !== '') {
    return <ErrorScreen error={error} />;
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="gray" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header refreshFunction={fetchAdminNotifications} disableRefresh={disableRefresh} />
      <View style={styles.headerContainer}>
        <BoutonRetour previousRoute="adminScreen" title="Gestion des notifications" />
      </View>

      <View style={styles.list}>
        <FlatList
          data={notifications}
          renderItem={({ item }) => (
            <BoutonGestion
              title={item.title}
              subtitle={`Date : ${item.created_at} | Statut : ${item.delete === 0 ? 'Active' : 'Supprimée'}`}
              subtitleStyle={item.delete === 0 ? styles.activeSubtitle : styles.deletedSubtitle}
              nextRoute="valideNotificationsScreen"
              id={item.id}
            />
          )}
          keyExtractor={(item) => item.id.toString()}
          ListEmptyComponent={
            <Text style={styles.emptyListText}>Aucune notification disponible</Text>
          }
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: '100%',
    width: '100%',
    flex: 1,
    backgroundColor: 'white',
    paddingBottom: 8,
  },
  headerContainer: {
    width: '100%',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  list: {
    width: '100%',
    marginTop: 20,
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyListText: {
    textAlign: 'center',
    color: 'gray',
    fontSize: 16,
  },
  activeSubtitle: {
    color: 'green',
    backgroundColor: '#DFF0D8', // Light green background for active
    padding: 8,
    borderRadius: 4,
  },
  deletedSubtitle: {
    color: 'red',
    backgroundColor: '#F8D7DA', // Light red background for deleted
    padding: 8,
    borderRadius: 4,
  },
});

export default GestionNotificationsScreen;
