import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { apiGet } from '@/constants/api/apiCalls';
import BoutonRetour from '@/components/divers/boutonRetour';
import Header from '../../components/header';
import ErrorScreen from '@/components/pages/errorPage';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '@/contexts/UserContext';
import { Colors, TextStyles, loadFonts } from '@/constants/GraphSettings';
import { ChevronRight } from 'lucide-react-native';

interface BoutonAdminProps {
  nextRoute: string;
  title: string;
}

const BoutonAdmin: React.FC<BoutonAdminProps> = ({ nextRoute, title }) => {
  const navigation = useNavigation();

  const onPress = () => {
    (navigation as any).navigate(nextRoute);
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        width: "100%",
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.primary,
        justifyContent: "space-between",
        alignItems: "center",
        display: "flex",
        flexDirection: "row",
        backgroundColor: Colors.white,
      }}
    >
      <View
        style={{
          justifyContent: "flex-start",
          alignItems: "center",
          display: "flex",
          flexDirection: "row",
          width: '85%',
        }}
      >
        <Text
          style={{
            ...TextStyles.body,
            color: Colors.primaryBorder,
            fontWeight: "600",
            marginLeft: 10,
          }}
        >
          {title}
        </Text>
      </View>
      <ChevronRight size={20} color={Colors.primaryBorder} />
    </TouchableOpacity>
  );
};

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

  const fetchAdmin = useCallback(async () => {
    setLoading(true);

    try {
      const response = await apiGet("admin");
      if (!response.success) {
        navigation.goBack();
        return null;
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
  }, [navigation, setUser]);

  useEffect(() => {
    const loadAsyncFonts = async () => {
      await loadFonts();
    };
    loadAsyncFonts();

    fetchAdmin();
  }, [fetchAdmin]);

  if (error !== '') {
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
        <Header refreshFunction={null} disableRefresh={true} />
        <View
          style={{
            width: '100%',
            flex: 1,
            backgroundColor: Colors.white,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <ActivityIndicator size="large" color={Colors.muted} />
        </View>
      </View>
    );
  }

  return (
    <View style={{ height: '100%', width: '100%', flex: 1, backgroundColor: 'white', paddingBottom: 8 }}>
      <Header refreshFunction={null} disableRefresh={true} />
      <View style={{ width: '100%', paddingHorizontal: 20, paddingBottom: 16 }}>
        <BoutonRetour previousRoute="homeNavigator" title="Contrôle Admin" />
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
