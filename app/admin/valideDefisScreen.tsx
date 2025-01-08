import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, ActivityIndicator } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { X, Check } from 'lucide-react-native';
import Header from '../../components/header';
import BoutonRetour from '@/components/divers/boutonRetour';
import { Colors, Fonts, loadFonts } from '@/constants/GraphSettings';
import BoutonActiver from '@/components/divers/boutonActiver';
import { apiPost, apiGet } from '@/constants/api/apiCalls'; // Import the API calls
import ErrorScreen from '@/components/pages/errorPage';
import { useUser } from '@/contexts/UserContext';

export default function ValideDefis() {
  const route = useRoute();
  const { id } = route.params; // Récupération de l'ID de l'anecdote
  const {setUser} = useUser();
  
  const [challengeDetails, setChallengeDetails] = useState(null);
  const [challengeStatus, setChallengeStatus] = useState(null); // État pour le statut de validation
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [disableRefresh, setDisableRefresh] = useState(false);

  // Fetch challenge details
  const fetchChallengeDetails = async () => {
    setLoading(true);
    setDisableRefresh(true);
    try {
      const response = await apiGet(`getChallengeDetails/${id}`);
      if (response.success) {
        setChallengeDetails(response.data);
      } else {
        setError('Erreur lors de la récupération des détails du défi');
      }
    } catch (error) {
      if (error.message === 'NoRefreshTokenError' || error.JWT_ERROR) {
        setUser(null);
      } else {
        setError(error.message);
      }
    } finally {
      setLoading(false);
      setTimeout(() => {
        setDisableRefresh(false); 
      }, 5000);
    }
  };

  // Handle challenge validation (approve or disapprove)
  const handleValidation = async (isValid) => {
    setLoading(true);
    try {
      const response = await apiPost(`updateChallengeStatus/${id}/${isValid}`);
      if (response.success) {
        setChallengeStatus(isValid);
        setChallengeDetails((prevDetails) => ({
          ...prevDetails,
          valid: isValid,
        }));
        await fetchChallengeDetails(); // Reload challenge details after update
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
    const loadAsyncFonts = async () => {
      await loadFonts();
    };
    loadAsyncFonts();

    fetchChallengeDetails();
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
    <View style={styles.container}>
      <Header refreshFunction={fetchChallengeDetails} disableRefresh={disableRefresh}/>
      <View style={styles.content}>
        <BoutonRetour previousRoute="gestionDefisScreen" title={"Gérer défis " + id} />
        <Text style={styles.title}>Détails du défi :</Text>
        <View style={styles.textBox}>
          <Text style={styles.text}>Status : {challengeDetails?.valid ? 'Validée' : 'En attente de validation'}</Text>
          <Text style={styles.text}>Date : {challengeDetails?.created_at ? new Date(challengeDetails.created_at).toLocaleString('fr-FR', {
            weekday: 'long', // Jour de la semaine complet
            month: 'long', // Mois complet
            day: 'numeric', // Jour
            hour: '2-digit', // Heure sur 2 chiffres
            minute: '2-digit', // Minute sur 2 chiffres
            second: '2-digit', // Seconde sur 2 chiffres
            hour12: false, // Utiliser l'heure 24h (optionnel)
          }) : 'Date non disponible'}</Text>
          <Text style={styles.text}>Auteur : {challengeDetails?.user?.firstName} {challengeDetails?.user?.lastName || 'Auteur inconnu'}</Text>
          <Text style={styles.text}>Défi : {challengeDetails?.challenge.title || 'Pas de description'}</Text>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <View style={styles.buttonSpacing}>
          <BoutonActiver
            title="Désactiver le défi"
            IconComponent={X}
            disabled={challengeDetails.valid == 0}
            onPress={() => handleValidation(0)} // Invalidate the challenge
          />
        </View>
        <BoutonActiver
          title="Valider le défi"
          IconComponent={Check}
          disabled={challengeDetails.valid == 1}
          onPress={() => handleValidation(1)} // Validate the challenge
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  content: {
    width: '100%',
    flex: 1,
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  title: {
    marginTop: 20,
    fontSize: 16,
    color: Colors.black,
    fontFamily: 'Inter',
    fontWeight: '600',
  },
  textBox: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: Colors.gray,
    borderRadius: 8,
    padding: 10,
    backgroundColor: Colors.white,
    marginBottom: 20,
  },
  text: {
    fontSize: 14,
    color: Colors.black,
    fontFamily: 'Inter',
    fontWeight: '400',
    lineHeight: 20,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 20, // Adjust the distance from the bottom as needed
    width: '100%',
    paddingHorizontal: 20,
  },
  buttonSpacing: {
    marginBottom: 16, // Add spacing between the buttons
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

