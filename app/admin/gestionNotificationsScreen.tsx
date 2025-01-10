import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import BoutonRetour from '@/components/divers/boutonRetour';
import Header from '../../components/header';
import BoutonGestion from '@/components/admins/boutonGestion';
import { apiGet } from '@/constants/api/apiCalls';
import { useNavigation } from '@react-navigation/native';
import ErrorScreen from '@/components/pages/errorPage';
import { PenLine } from 'lucide-react-native';
import { Colors, Fonts, loadFonts } from '@/constants/GraphSettings';
import { useUser } from '@/contexts/UserContext';

const GestionNotificationsScreen = () => {
  const navigation = useNavigation();
  const { setUser } = useUser();

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
      } else {
        setError('Erreur lors de la récupération des notifications');
      }
    } catch (error) {
      if (error.message === 'NoRefreshTokenError' || error.JWT_ERROR) {
        setUser(null);
      } else {
        setError(error.message);
      }
    } finally {
      setLoading(false);
      setTimeout(() => {
        setDisableRefresh(false);
      }, 5000);
    }
  };

  useEffect(() => {
    const loadAsyncFonts = async () => {
      await loadFonts();
    };
    loadAsyncFonts();
    fetchAdminNotifications();
    const unsubscribe = navigation.addListener('focus', () => {
      fetchAdminNotifications();
    });

    return unsubscribe;
  }, [navigation]);

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
      <Header refreshFunction={fetchAdminNotifications} disableRefresh={disableRefresh} />
      <View style={styles.headerContainer}>
        <BoutonRetour previousRoute="adminScreen" title="Gestion des notifications" />
      </View>

      <TouchableOpacity
        style={[styles.button, styles.deleteButton]} // Reuse deleteButton positioning
        onPress={() => navigation.navigate('notificationsForm')}
      >
        <Text style={styles.buttonText}>Ecrire une nouvelle notification</Text>
        <PenLine color="white" size={20} />
      </TouchableOpacity>
      <View style={styles.list}>
        <FlatList
          data={notifications}
          renderItem={({ item }) => (
            <BoutonGestion
              title={item.title}
              subtitle={`Date : ${item?.created_at ? new Date(item.created_at).toLocaleDateString('fr-FR', {
                weekday: 'long', // Jour de la semaine complet
                month: 'long', // Mois complet
                day: 'numeric', // Jour
              }) + ' ' + new Date(item.created_at).toLocaleTimeString('fr-FR', {
                hour: '2-digit', // Heure sur 2 chiffres
                minute: '2-digit', // Minute sur 2 chiffres
                hour12: false, // Utiliser l'heure 24h
              }) : 'Date non disponible'} | Statut : ${item.delete === 0 ? 'Active' : 'Supprimée'}`}

              subtitleStyle={item.delete === 0 ? styles.activeSubtitle : styles.deletedSubtitle}
              nextRoute="valideNotificationsScreen"
              id={item.id}
              active={item.active}
            />
          )}
          keyExtractor={(item) => item.id.toString()}
          ListEmptyComponent={
            <Text style={styles.emptyListText}>Aucune notification disponible</Text>
          }
          contentContainerStyle={styles.flatListContent}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    width: '100%',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  list: {
    width: '100%',
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
  button: {
    width: '90%',
    padding: 10,
    backgroundColor: Colors.orange,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    zIndex: 1,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Inter',
    fontWeight: '600',
    marginRight: 10,
  },
  deleteButton: {
    position: 'absolute',
    bottom: 16,
    width: '90%',
    padding: 10,
    backgroundColor: Colors.orange,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Inter',
    fontWeight: '600',
    marginRight: 10,
  },
  flatListContent: {
    paddingBottom: 80, // This will add space at the bottom of the list
  },
});

export default GestionNotificationsScreen;
