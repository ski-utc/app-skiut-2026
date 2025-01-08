import { Text, View, ActivityIndicator, Image, StyleSheet } from "react-native";
import { Colors, Fonts, loadFonts } from '@/constants/GraphSettings';
import Header from "../../components/header";
import React, { useState, useEffect } from "react";
import { apiGet } from "@/constants/api/apiCalls";
import WidgetBanal from "@/components/home/WidgetBanal";
import {useNavigation} from "@react-navigation/native";

export default function HomeScreen() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<any>(null); // Stocke les données récupérées

  const navigation = useNavigation();

  useEffect(() => {
    const loadAsyncFonts = async () => {
      await loadFonts();
    };
    loadAsyncFonts();

    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await apiGet("random-data"); // Récupération des données
        setData(response.data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const intervalId = setInterval(() => {
      fetchData().catch((err) => setError(err));
    }, 300000);

    return () => clearInterval(intervalId);
  }, []);

  if (error) {
    return (
        <View style={styles.container}>
          <Header refreshFunction={undefined} disableRefresh={undefined} />
          <View style={styles.errorContainer}>
            <Text style={styles.title}>Erreur:</Text>
            <Text style={styles.errorMessage}>{error.message || "Une erreur est survenue"}</Text>
          </View>
          <Image
              source={require("../../assets/images/oursSki.png")}
              style={styles.image}
          />
        </View>
    );
  }

  if (loading) {
    return (
        <View style={styles.container}>
          <Header refreshFunction={undefined} disableRefresh={undefined} />
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.black} />
          </View>
        </View>
    );
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
      <View style={styles.container}>
        <Header refreshFunction={undefined} disableRefresh={undefined} />
        <View style={styles.contentContainer}>
          { data.closestActivity ? 
          <WidgetBanal
              title={`Prochaine activité : ${data.closestActivity.text}`}
              subtitles={[
                { text: `Jour : ${formatDate(data.closestActivity.date)}` },
                { text: `Début : ${data.closestActivity.startTime}` },
                { text: `Fin : ${data.closestActivity.endTime}` },
              ]}
              backgroundColor="#80AEAC"
              textColor={Colors.white}
              onPress={() => {navigation.navigate('planningNavigator')}}
          />
          : null }

          { data.randomChallenge ? 
          <WidgetBanal
              title="Valide ce défi si ce n'est pas déjà fait!"
              subtitles={[{ text: data.randomChallenge }]}
              backgroundColor={Colors.orange}
              textColor={Colors.white}
              onPress={() => {navigation.navigate('defisNavigator')}}
          />
          : null }

          { data.bestAnecdote ? 
          <WidgetBanal
              title="L'anecdote la plus likée :"
              subtitles={[{ text: data.bestAnecdote }]}
              backgroundColor={'#80AEAC'}
              textColor={Colors.white}
              onPress={() => {navigation.navigate('anecdotesNavigator')}}
          />
          : null }

          <WidgetBanal
              title="Un bug sur l'app ? Contacte la team info !"
              subtitles={[
                { text: `On est pas méchants et on a encore beaucoup à apprendre...` },
                {
                  text: 'Formulaire de retour : ',
                  link: 'https://forms.gle/E8hhG7pDRqyfR8CS6',
                },
              ]}
              backgroundColor={Colors.orange}
              textColor={Colors.white}
          />

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
  errorContainer: {
    width: "100%",
    flex: 1,
    backgroundColor: "#b2cecb",
    paddingBottom: 16,
  },
  image: {
    width: "100%",
    height: 390,
    resizeMode: "cover",
    position: "absolute",
    bottom: 0,
  },
  loadingContainer: {
    width: "100%",
    flex: 1,
    backgroundColor: "#b2cecb",
    justifyContent: "center",
  },
  contentContainer: {
    backgroundColor: Colors.white,
    width: "100%",
    flex: 1,
    paddingBottom: 16,
    paddingHorizontal: 14,
  },
  title: {
    paddingTop: 40,
    paddingBottom: 15,
    paddingLeft: 21,
    fontSize: 25,
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