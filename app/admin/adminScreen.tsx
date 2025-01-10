import React, { useEffect, useState } from 'react';
import { View, FlatList, ActivityIndicator, Text } from 'react-native';
import { apiGet } from '@/constants/api/apiCalls'; // API pour récupérer les infos utilisateur
import BoutonRetour from '@/components/divers/boutonRetour';
import BoutonAdmin from '@/components/admins/boutonAdmin';
import Header from '../../components/header';
import ErrorScreen from '@/components/pages/errorPage';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '@/contexts/UserContext';
import { Colors, Fonts, loadFonts } from '@/constants/GraphSettings';

const adminControls = [
  { title: 'Gestion des défis', nextRoute: 'gestionDefisScreen' },
  { title: 'Gestion des anecdotes', nextRoute: 'gestionAnecdotesScreen' },
  { title: 'Gestion des notifications', nextRoute: 'gestionNotificationsScreen' },
];

export default function Admin() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const navigation = useNavigation();
  const { setUser } = useUser();

  const fetchAdmin = async () => {
    setLoading(true);

    try {
      const response = await apiGet("admin"); // Récupération des données
      if (!response.success) {
        navigation.goBack();
        return null;
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

    fetchAdmin();
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
