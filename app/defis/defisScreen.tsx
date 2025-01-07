import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator } from "react-native";
import Header from "../../components/header";
import { Trophy } from 'lucide-react-native';
import BoutonNavigation from "@/components/divers/boutonNavigation";
import BoutonRetour from "@/components/divers/boutonRetour";
import BoutonDefi from "@/components/defis/boutonDefi";
import { Colors } from "@/constants/GraphSettings";
import { apiGet } from "@/constants/api/apiCalls";
import ErrorScreen from '@/components/pages/errorPage';

// @ts-ignore
export default function Defis() {
  const [challenges, setChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Fetch challenges from the API
  const fetchChallenges = async () => {
    try {
      setLoading(true);
      const response = await apiGet("challenges");
      setChallenges(response.data);
    } catch (err) {
      setError(err.message || "Une erreur est survenue lors de la récupération des défis.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, []);

  if (loading) {
    return (
        <View style={styles.loadingContainer}>
          <Header refreshFunction={undefined} disableRefresh={undefined} />
          <ActivityIndicator size="large" color={Colors.gray} />
        </View>
    );
  }

  if (error !== '') {
    return <ErrorScreen error={error} />;
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
            renderItem={({ item }) => (
                <View>
                  <BoutonDefi
                      nextRoute={"defisInfos"}
                      defi={{
                        id: item.id,
                        title: item.title,
                        details: item.details,
                        points: item.nbPoints,
                        isActive: item.isActive,
                      }}
                      estValide={item.estValide} // Pass estValide dynamically
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