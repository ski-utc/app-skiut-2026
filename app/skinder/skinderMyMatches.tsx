import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ActivityIndicator, ScrollView } from 'react-native';
import { Colors, Fonts } from '@/constants/GraphSettings';
import Header from '../../components/header';
import { useUser } from '@/contexts/UserContext';
import BoutonRetour from '@/components/divers/boutonRetour';
import { apiGet } from '@/constants/api/apiCalls';
import ErrorScreen from '@/components/pages/errorPage';

export default function SkinderMyMatches() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [matchedRooms, setMatchedRooms] = useState([]);
  const { setUser } = useUser();

  const fetchMatches = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiGet('getMySkinderMatches');
      if (response.success) {
        setMatchedRooms(response.data);
      } else {
        setError(response.message || 'Une erreur est survenue lors de la récupération des matchs.');
      }
    } catch (error : any) {
      if (error.message === 'NoRefreshTokenError' || error.JWT_ERROR) {
        setUser(null);
      } else {
        setError(error.message || 'Erreur réseau.');
      }
    } finally {
      setLoading(false);
    }
  }, [setUser]);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

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
          <ActivityIndicator size="large" color={Colors.gray} />
        </View>
      </View>
    );
  }

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
          backgroundColor: Colors.white,
          flex: 1,
          paddingHorizontal: 20,
          paddingBottom: 16,
        }}
      >
        <BoutonRetour previousRoute={'profilNavigator'} title={'Mes Matches'} />
        {matchedRooms.length === 0 ? (
          <View
            style={{
              width: '100%',
              flex: 1,
              backgroundColor: Colors.white,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                color: Colors.black,
                fontSize: 32,
                fontFamily: Fonts.Inter.Basic,
                fontWeight: '800',
                padding: 10,
                textAlign: 'center',
              }}
            >
              Petit malaise...
            </Text>
            <Text
              style={{
                color: Colors.gray,
                fontSize: 18,
                fontFamily: Fonts.Inter.Basic,
                fontWeight: '600',
                padding: 10,
                textAlign: 'center',
              }}
            >
              Vous n'avez pas encore de matches.
            </Text>
          </View>
        ) : (
          <ScrollView>
            {matchedRooms.map((room, index) => (
              <View
                key={index}
                style={{
                  width: '100%',
                  borderTopWidth: 1,
                  borderTopColor: Colors.gray,
                  padding: 16,
                }}
              >
                <Text
                  style={{
                    color: Colors.black,
                    fontSize: 16,
                    fontFamily: Fonts.Inter.Basic,
                    fontWeight: '600',
                  }}
                >
                  Chambre : {room.roomNumber}
                </Text>
                <Text
                  style={{
                    color: Colors.black,
                    fontSize: 14,
                    fontFamily: Fonts.Inter.Basic,
                    fontWeight: '400',
                    marginTop: 4,
                  }}
                >
                  Resp de Chambre : {room.respRoom || 'Non spécifié'}
                </Text>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  );
}
