import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator } from "react-native";
import Header from "../../components/header";
import { Trophy } from 'lucide-react-native';
import BoutonNavigation from "@/components/divers/boutonNavigation";
import BoutonRetour from "@/components/divers/boutonRetour";
import BoutonDefi from "@/components/defis/boutonDefi";
import { Colors, Fonts, loadFonts } from '@/constants/GraphSettings';
import { apiGet } from "@/constants/api/apiCalls";
import ErrorScreen from '@/components/pages/errorPage';
import { useNavigation } from 'expo-router';
import { useUser } from '@/contexts/UserContext';

// @ts-ignore
export default function Defis() {
  const [challenges, setChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState('');

  const navigation = useNavigation();
  const { setUser } = useUser();

  const fetchChallenges = async () => {
    setLoading(true);
    try {
      const response = await apiGet("challenges");
      if(response.success){
        setChallenges(response.data);
      } else {
        setError(response.message);
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

  const onUpdateDefiStatus = (updatedDefiId, newStatus) => {
    setChallenges((prevChallenges) =>
      prevChallenges.map((challenge) =>
        challenge.id === updatedDefiId
          ? { ...challenge, status: newStatus }
          : challenge
      )
    );
  };

  useEffect(() => {
    const loadAsyncFonts = async () => {
      await loadFonts();
    };
    loadAsyncFonts();
    fetchChallenges();
    const unsubscribe = navigation.addListener('focus', () => {
        fetchChallenges();
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
        <Header refreshFunction={undefined} disableRefresh={undefined} />
        <View style={styles.headerContainer}>
          <BoutonRetour previousRoute={"homeNavigator"} title={"Défis"} />
        </View>
        <FlatList
            data={challenges}
            keyExtractor={(item) => item.id.toString()} // Use unique challenge ID
            extraData={challenges}
            renderItem={({ item }) => (
                <View>
                  <BoutonDefi
                      defi={{
                        id: item.id,
                        title: item.title,
                        points: item.nbPoints,
                        status: item.status
                      }}
                      onUpdate={onUpdateDefiStatus}
                  />
                </View>
            )}
            style={styles.list}
        />
        <View style={styles.navigationContainer}>
          <BoutonNavigation nextRoute={"defisClassement"} title={"Classement"} IconComponent={Trophy} />
        </View>
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: "100%",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.white,
  },
  loadingContainer: {
    height: "100%",
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  headerContainer: {
    width: '100%',
    paddingHorizontal: 20,
  },
  list: {
    width: "100%",
    marginTop: 8,
  },
  navigationContainer: {
    width: '100%',
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
});