import { Text, View, ActivityIndicator } from "react-native";
import { Colors, Fonts, loadFonts } from '@/constants/GraphSettings';
import Header from "../components/Header";
import React, { useState, useEffect } from "react";
import { apiGetPublic } from "../constants/api/apiCalls";

// @ts-ignore
export default function Index() {
  /* - - - - - - - - - - - - - Variables Globales - - - - - - - - - - - - - */
  const [loading, setLoading] = useState(true);  // Variable globale de chargement et son setter
  const [error, setError] = useState(null);  // Variable globale d'erreur et son setter
  const [arrayDeData, setArrayDeData] = useState([]);  // Variable globale pour stocker les data d'une requête et son setter



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
        setLoading(false);  //On quitte l'état de chargement
      } catch (err) {
        setError(err);  //Si il y a une erreur, on l'affecte à notre variable globale error qui s'affiche à l'écran
        setLoading(false); // On quitte l'état de chargement
      }
    };
    fetchData();  //Appel de la fonction asynchrone
  
    const intervalId = setInterval(() => {
      fetchData().catch((err) => setError(err));  // Toutes les 5 minutes on refait la requête pour rafracihir
    }, 300000);
  
    return () => clearInterval(intervalId);  // On clear l'intervalle pour pas avoir des big fuites de mémoire
  }, []);
  


  /* - - - - - - - - - - - - - Page en cas d'erreur - - - - - - - - - - - - - */
  if (error) {
    return (
      <View
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: Colors.darkBlue,
        }}
      >
        <Text 
          style={{ 
            fontSize: 32,
            textAlign: "center",
            maxWidth: "90%",
            color: Colors.white,
            fontFamily: Fonts.Title.Bold,            
          }}>
            Erreur: 
        </Text>
        <Text 
          style={{ 
            fontSize: 20,
            textAlign: "center",
            maxWidth: "90%",
            color: Colors.white,
            fontFamily: Fonts.Text.Medium,            
          }}>
            {error?.message || "Une erreur est survenue"}
        </Text>
      </View>
    );
  }



/* - - - - - - - - - - - - - Page de chargement - - - - - - - - - - - - - */
  if (loading) {
    return (
      <View
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: Colors.darkBlue,
        }}
      >
        <ActivityIndicator
          size="large"
          color={Colors.white}
        />
      </View>
    );
  }



/* - - - - - - - - - - - - - Page classique burger - - - - - - - - - - - - - */
  return (
    <View
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Header text="Home"/>
      <View
        style={{
          height: "90%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: Colors.darkBlue,
        }}
      >
        <Text>{arrayDeData.message}</Text>
        <Text>Edit app/index.tsx to edit this screen.</Text>
      </View>
    </View>
  );
}
