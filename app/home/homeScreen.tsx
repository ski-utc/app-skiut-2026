import { Text, View, ActivityIndicator, Image, Dimensions, StyleSheet } from "react-native";
import { Colors, Fonts, loadFonts } from '@/constants/GraphSettings';
import Header from "../../components/header";
import React, { useState, useEffect } from "react";
import { apiGetPublic } from "../../constants/api/apiCalls";
import { useNavigation } from '@react-navigation/native';

const screenWidth = Dimensions.get("window").width; // Get screen width
console.log("On est dans HomeScreen");

// @ts-ignore
export default function HomeScreen() {
  /* - - - - - - - - - - - - - Variables Globales - - - - - - - - - - - - - */
  const [loading, setLoading] = useState(true);  // Variable globale de chargement et son setter
  const [error, setError] = useState<Error | null>(null);  // Variable globale d'erreur et son setter
  const [arrayDeData, setArrayDeData] = useState<{ message: string } | null>(null);  // Variable globale pour stocker les data d'une requête et son setter
  const navigation = useNavigation();  // Hook de navigation

  /* - - - - - - - - - - - - - Récup les ressources - - - - - - - - - - - - - */
  useEffect(() => {
    const loadAsyncFonts = async () => {  //Fonction asynchrone pour load les polices
      await loadFonts();
    };
    loadAsyncFonts();

    const fetchData = async () => {  //Fonction asynchrone pour récup les données du serveur
      try {
        setLoading(true);  //On met la page en cours de chargement
        const response = await apiGetPublic("getTrucDuServeur");  //On balance la requête GET sans JWT à la route getTrucDuServeur
        setArrayDeData(response);  // On met à jour les données de notre variable globale
      } catch (err) {
        setError(err as Error);  //Si il y a une erreur, on l'affecte à notre variable globale error qui s'affiche à l'écran
      } finally {
        setLoading(false); // On quitte l'état de chargement
      }
    };
    fetchData();  //Appel de la fonction asynchrone
    
    const intervalId = setInterval(() => {
      fetchData().catch((err) => setError(err));  // Toutes les 5 minutes on refait la requête pour rafraîchir
    }, 300000);
    
    return () => clearInterval(intervalId);  // On clear l'intervalle pour pas avoir des big fuites de mémoire
  }, []);

  /* - - - - - - - - - - - - - Page en cas d'erreur - - - - - - - - - - - - - */
  if (error) {
    return (
      <View style={styles.container}>
        <Header />
        <View style={styles.errorContainer}>
          <Text style={styles.title}>Erreur:</Text>
          <Text style={styles.errorMessage}>{error?.message || "Une erreur est survenue"}</Text>
        </View>
        <Image
          source={require("../../assets/images/oursSki.png")}
          style={styles.image}
        />
      </View>
    );
  }

  /* - - - - - - - - - - - - - Page de chargement - - - - - - - - - - - - - */
  if (loading) {
    return (
      <View style={styles.container}>
        <Header />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.black} />
        </View>
      </View>
    );
  }

  /* - - - - - - - - - - - - - Page classique burger - - - - - - - - - - - - - */
  return (
    <View style={styles.container}>
      <Header />
      <View style={styles.contentContainer}>
        <Text style={styles.title}>Bienvenue sur l'appli Ski'UTC</Text>
      </View>
      <Image
          source={require("../../assets/images/oursSki.png")}
          style={styles.image}
      />
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
  },
  errorContainer: {
    width: '100%',
    flex: 1,
    backgroundColor: "#b2cecb", 
    paddingBottom: 16,
  },
  image: {
    width: '100%', 
    height: 390,
    resizeMode: 'cover',
    position: 'absolute', 
    bottom: 0,
  },  
  loadingContainer: {
    width: '100%',
    flex: 1,
    backgroundColor: "#b2cecb",
    justifyContent: "center",
  },
  contentContainer: {
    backgroundColor: "#b2cecb", 
    width: '100%',
    flex: 1,
    paddingBottom: 16,
  },
  title: {
    paddingTop: 40,
    paddingBottom: 15,
    paddingLeft: 21, 
    fontSize: 40,
    textAlign: "left",
    maxWidth: "90%",
    color: Colors.white,
    fontFamily: Fonts.Text.Bold,
  },
  errorMessage: {
    paddingLeft: 21, 
    fontSize: 25,
    textAlign: "left",
    maxWidth: "90%",
    color: Colors.white,
    fontFamily: Fonts.Text.Medium,
  },
});
