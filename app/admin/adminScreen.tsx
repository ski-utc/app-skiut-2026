import React, { useEffect, useState } from 'react';
import { View, FlatList, ActivityIndicator, Text } from 'react-native';
import { useUser } from '@/contexts/UserContext'; // Contexte utilisateur, si disponible
import { apiGet } from '@/constants/api/apiCalls'; // API pour récupérer les infos utilisateur
import BoutonRetour from '@/components/divers/boutonRetour';
import BoutonAdmin from '@/components/admins/boutonAdmin';
import Header from '../../components/header';
import { useNavigation } from '@react-navigation/native'; // Pour la navigation
import ErrorScreen from '@/components/pages/errorPage';

const adminControls = [
  { title: 'Gestion des défis', nextRoute: 'gestionDefisScreen' },
  { title: 'Gestion des anecdotes', nextRoute: 'gestionAnecdotesScreen' },
  { title: 'Gestion des notifications', nextRoute: 'gestionNotificationsScreen' },
];

export default function Admin() {
  const { user } = useUser(); // Contexte utilisateur
  const [admin, setAdmin] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const fetchAdmin = async (incrementalLoad = false) => {
    console.log('fetchAdmin');
    if (!incrementalLoad) setLoading(true);

    try {
      const response = await apiGet('admin');
      console.log('response: ', response.success);
      if (response.success) {
        setAdmin(response.data);
      } else {
        setError('Accès interdit, vous n\'êtes pas administrateur');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmin();
  }, []);

  if (error != '') {
    return (
      <ErrorScreen error={error} />
    )
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
            backgroundColor: 'white',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <ActivityIndicator size="large" color="gray" />
        </View>
      </View>
    );
  }

  return (
    <View style={{ height: '100%', width: '100%', flex: 1, backgroundColor: 'white', paddingBottom: 8 }}>
      <Header />
      <View style={{ width: '100%', paddingHorizontal: 20, paddingBottom: 16 }}>
        <BoutonRetour previousRoute="profilNavigator" title="Contrôle Admin" />
      </View>

      {/* Using BoutonAdmin for navigation */}
      <FlatList
        data={adminControls}
        keyExtractor={(items, index) => index.toString()}
        renderItem={({ item }) => (
          <View>
            <BoutonAdmin nextRoute={item.nextRoute} title={item.title} />
          </View>
        )}
        style={{ width: '100%' }}
      />
    </View>
  )
}
