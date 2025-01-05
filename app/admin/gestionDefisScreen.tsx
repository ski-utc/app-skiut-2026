import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, Text } from 'react-native';
import BoutonRetour from '@/components/divers/boutonRetour';
import Header from '../../components/header';
import BoutonMenu from '@/components/admins/boutonMenu';
import BoutonGestion from '@/components/admins/boutonGestion';
import { apiGet } from '@/constants/api/apiCalls';
import { useNavigation } from '@react-navigation/native';
import ErrorScreen from '@/components/pages/errorPage';

const GestionDefisScreen = () => {
  const navigation = useNavigation();

  const [defis, setDefis] = useState([]);
  const [filteredDefis, setFilteredDefis] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchAdminDefis = async () => {
    setLoading(true);
    try {
      const response = await apiGet('getAdminChallenges');
      if (response.success) {
        setDefis(response.data);
        setFilteredDefis(response.data);
        console.log('Défis:', response.data);
      } else {
        setError('Erreur lors de la récupération des défis');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (filter) => {
    switch (filter) {
      case 'pending':
        setFilteredDefis(defis.filter((item) => !item.valid && !item.alert));
        break;
      case 'reported':
        setFilteredDefis(defis.filter((item) => item.alert));
        break;
      default:
        setFilteredDefis(defis);
        break;
    }
  };

  useEffect(() => {
    fetchAdminDefis();
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
      <Header />
      <View style={styles.headerContainer}>
        <BoutonRetour previousRoute="adminScreen" title="Gestion des défis" />
      </View>

      <View>
        <BoutonMenu
          first="Tous les défis"
          second="En attente"
          third="Signalés"
          onFirstClick={() => handleFilter('all')}
          onSecondClick={() => handleFilter('pending')}
          onThirdClick={() => handleFilter('reported')}
        />
      </View>

      <View style={styles.list}>
        <FlatList
          data={filteredDefis}
          renderItem={({ item }) => (
            <BoutonGestion
              title={`Défi: ${item.id}`}
              subtitle={`Auteur: ${item?.user?.firstName} ${item?.user?.lastName || 'Nom inconnu'}`}
              nextRoute="valideDefisScreen"
              defiId={item.id}
            />
          )}
          keyExtractor={(item) => item.id.toString()}
          ListEmptyComponent={
            <Text style={styles.emptyListText}>Aucun défi correspondant</Text>
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
});

export default GestionDefisScreen;
