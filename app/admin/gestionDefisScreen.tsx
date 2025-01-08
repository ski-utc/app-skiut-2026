import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, Text } from 'react-native';
import BoutonRetour from '@/components/divers/boutonRetour';
import Header from '../../components/header';
import BoutonMenu from '@/components/admins/boutonMenu';
import BoutonGestion from '@/components/admins/boutonGestion';
import { apiGet } from '@/constants/api/apiCalls';
import ErrorScreen from '@/components/pages/errorPage';
import { Colors, Fonts, loadFonts } from '@/constants/GraphSettings';
import { useUser } from '@/contexts/UserContext';

const GestionDefisScreen = () => {
  const [defis, setDefis] = useState([]);
  const [filteredDefis, setFilteredDefis] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [disableRefresh, setDisableRefresh] = useState(false);

  const { setUser } = useUser();

  const fetchAdminDefis = async () => {
    setLoading(true);
    setDisableRefresh(true);
    try {
      const response = await apiGet('getAdminChallenges');
      if (response.success) {
        setDefis(response.data);
        setFilteredDefis(response.data);
      } else {
        setError('Erreur lors de la récupération des défis');
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
   
  const handleFilter = (filter) => {
    switch (filter) {
      case 'pending':
        setFilteredDefis(defis.filter((item) => !item.valid && !item.delete));
        break;
      case 'deleted':
        setFilteredDefis(defis.filter((item) => item.delete));
        break;
      default:
        setFilteredDefis(defis.filter((item) => !item.delete)); // ne montre pas les supprimés dans "tous les défis"
        break;
    }
  };

  useEffect(() => {
    const loadAsyncFonts = async () => {
      await loadFonts();
    };
    loadAsyncFonts();

    fetchAdminDefis();
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
      <Header refreshFunction={fetchAdminDefis} disableRefresh={disableRefresh}/>
      <View style={styles.headerContainer}>
        <BoutonRetour previousRoute="adminScreen" title="Gestion des défis" />
      </View>

      <View>
        <BoutonMenu
          first="Tous" // non supprimés 
          second="En attente"
          third="Supprimés"
          onFirstClick={() => handleFilter('all')}
          onSecondClick={() => handleFilter('pending')}
          onThirdClick={() => handleFilter('deleted')}
        />
      </View>

      <View style={styles.list}>
        <FlatList
          data={filteredDefis}
          renderItem={({ item }) => (
            <BoutonGestion
              title={`Défi : ${item.challenge.title}`}
              subtitle={`Auteur: ${item?.user?.firstName} ${item?.user?.lastName || 'Nom inconnu'}`}
              subtitleStyle={undefined}
              nextRoute="valideDefisScreen"
              id={item.id}
              valide={item.valid}
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
    marginTop:20
  },
});

export default GestionDefisScreen;
