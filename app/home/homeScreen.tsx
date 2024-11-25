import { Text, View, ActivityIndicator, SafeAreaView } from "react-native";
import { Colors, Fonts, loadFonts } from '@/constants/GraphSettings';
import Header from "../../components/header";
import React, { useState, useEffect } from "react";
import { apiGetPublic } from "../../constants/api/apiCalls";
import BoutonNavigation from "@/components/divers/boutonNavigation";
import { useNavigation } from '@react-navigation/native';
import { CheckCircle } from 'lucide-react-native';

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
      <SafeAreaView
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: Colors.white,
        }}
      >
        <View style={{ position: "absolute", top: 0, left: 0, width: "100%" }}>
          <Header />
        </View>
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
          <Text 
            style={{ 
              fontSize: 32,
              textAlign: "center",
              maxWidth: "90%",
              color: Colors.black,
              fontFamily: Fonts.Title.Bold,            
            }}>
              Erreur: 
          </Text>
          <Text 
            style={{ 
              fontSize: 20,
              textAlign: "center",
              maxWidth: "90%",
              color: Colors.black,
              fontFamily: Fonts.Text.Medium,            
            }}>
              {error?.message || "Une erreur est survenue"}
          </Text>
          <BoutonNavigation
          nextRoute={"loginScreen"}
          title={"Login"}
          IconComponent={CheckCircle}
        />
        </View>
      </SafeAreaView>
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
          backgroundColor: Colors.customGray,
        }}
      >
        <View style={{ position: "absolute", top: 0, left: 0, width: "100%" }}>
          <Header />
        </View>
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
          <ActivityIndicator
            size="large"
            color={Colors.white}
          />
          <BoutonNavigation
          nextRoute={"loginScreen"}
          title={"Login"}
          IconComponent={CheckCircle}
        />
        </View>
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
      <View style={{ position: "absolute", top: 0, left: 0, width: "100%" }}>
          <Header />
        </View>
      <View
        style={{
          height: "90%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: Colors.black,
        }}
      >
        <Text>{arrayDeData?.message}</Text>
        <Text>Edit app/home.tsx to edit this screen.</Text>
        <BoutonNavigation
          nextRoute={"loginScreen"}
          title={"Login"}
          IconComponent={CheckCircle}
        />
      </View>
    </View>
  );
}
