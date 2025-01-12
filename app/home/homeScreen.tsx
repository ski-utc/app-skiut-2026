import { Text, View, ActivityIndicator, Image, StyleSheet } from "react-native";
import { Colors, Fonts, loadFonts } from '@/constants/GraphSettings';
import Header from "../../components/header";
import React, { useState, useEffect } from "react";
import { apiPost, apiGet } from '@/constants/api/apiCalls';
import WidgetBanal from "@/components/home/WidgetBanal";
import {useNavigation} from "@react-navigation/native";
import { useUser } from "@/contexts/UserContext";
import { usePushNotifications } from "../../usePushNotifications";

export default function HomeScreen() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState<any>(null); // Stocke les données récupérées

  const navigation = useNavigation();
  const { setUser } = useUser();
  const { expoPushToken } = usePushNotifications();

  const fetchData = async () => {
    setLoading(true);

    try {
      const response = await apiGet("getRandomData"); // Récupération des données
      if (response.success) {
        setData(response.data);
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

  useEffect(() => {
    const registerForPushNotifications = async () => {        
      try {
        const res = await apiPost("save-token", {userToken:expoPushToken});
      } catch (error) {
        if (error.message === 'NoRefreshTokenError' || error.JWT_ERROR) {
          setUser(null);
        } else {
          setError(error.message);
        }
      }
    };    

    registerForPushNotifications();

    const loadAsyncFonts = async () => {
      await loadFonts();
    };
    loadAsyncFonts();

    fetchData();
  }, []);

  if (error!='') {
    return (
        <View style={styles.container}>
          <Header refreshFunction={undefined} disableRefresh={undefined} />
          <View style={styles.errorContainer}>
            <Text style={styles.title}>Bienvenue sur l'application Ski'UTC !</Text>
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
        <Header refreshFunction={undefined} disableRefresh={undefined}/>
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
              title="Il reste des défis que tu n'as pas encore fait !"
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
              onPress={null}
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
    paddingTop: 60,
    paddingBottom: 15,
    paddingLeft: 21,
    lineHeight: 45,
    fontSize: 35,
    textAlign: "left",
    maxWidth: "95%",
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