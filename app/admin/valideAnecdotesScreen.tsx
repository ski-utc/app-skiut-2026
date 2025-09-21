import React, { useState, useEffect, useCallback } from 'react';
import { Text, View, StyleSheet, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { X, Check } from 'lucide-react-native';
import Header from '../../components/header';
import BoutonRetour from '@/components/divers/boutonRetour';
import { Colors, Fonts, loadFonts } from '@/constants/GraphSettings';
import BoutonActiver from '@/components/divers/boutonActiver';
import { apiPost, apiGet } from '@/constants/api/apiCalls'; // Assurez-vous d'importer l'appel API
import ErrorScreen from '@/components/pages/errorPage';
import { useUser } from '@/contexts/UserContext';
import Toast from 'react-native-toast-message';

export default function ValideAnecdotes() {
  const route = useRoute();
  const { id } = route.params; // Récupération de l'ID de l'anecdote
  const { setUser } = useUser();
  const navigation = useNavigation();

  const [anecdoteDetails, setAnecdoteDetails] = useState(null);
  const [nbLikes, setNbLikes] = useState(null);
  const [nbWarns, setNbWarns] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fonction pour récupérer les détails de l'anecdote
  const fetchAnecdoteDetails = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiGet(`getAnecdoteDetails/${id}`);
      if (response.success) {
        setAnecdoteDetails(response.data);
        setNbLikes(response.nbLikes);
        setNbWarns(response.nbWarns);
      } else {
        setError('Erreur lors de la récupération des détails de l\'anecdote');
      }
    } catch (error : any) {
      if (error.message === 'NoRefreshTokenError' || error.JWT_ERROR) {
        setUser(null);
      } else {
        setError(error.message);
      }
    } finally {
      setLoading(false);
    }
  }, [id, setUser]);

  // Fonction pour valider ou invalider l'anecdote
  const handleValidation = async (isValid) => {
    setLoading(true);
    try {
      const response = await apiPost(`updateAnecdoteStatus/${id}/${isValid}`);
      if (response.success) {
        // Update the anecdote status in the state after validation
        setAnecdoteDetails(prevDetails => ({
          ...prevDetails,
          valid: isValid,  // Update valid status directly
        }));

        // Show a success message based on the action
        Toast.show({
          type: 'success',
          text1: isValid === 0  ? 'Anecdote désactivée !' : 'Anecdote validée !',
          text2: response.message,
        });
        navigation.goBack();
      } else {
        // Show error message
        Toast.show({
          type: 'error',
          text1: 'Une erreur est survenue...',
          text2: response.message,
        });
        setError(response.message || 'Une erreur est survenue lors de la validation de l\'anecdote.');
      }
    } catch (error : any) {
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

    fetchAnecdoteDetails();
  }, [fetchAnecdoteDetails]);

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
    <View style={styles.container}>
      <Header refreshFunction={null} disableRefresh={true} />
      <View style={styles.content}>
        <BoutonRetour previousRoute="gestionAnecdotesScreen" title={`Gérer l'anecdote ${id}`} />
        <Text style={styles.title}>Détail de l'anecdote :</Text>
        <View style={styles.textBox}>
          <Text style={styles.text}>Status : {anecdoteDetails?.valid ? 'Validée' : 'En attente de validation'}</Text>
          <Text style={styles.text}>Date : {anecdoteDetails?.created_at ? new Date(anecdoteDetails.created_at).toLocaleString('fr-FR', {
            weekday: 'long', // Jour de la semaine complet
            month: 'long', // Mois complet
            day: 'numeric', // Jour
            hour: '2-digit', // Heure sur 2 chiffres
            minute: '2-digit', // Minute sur 2 chiffres
            second: '2-digit', // Seconde sur 2 chiffres
            hour12: false, // Utiliser l'heure 24h (optionnel)
          }) : 'Date non disponible'}
          </Text>
          <Text style={styles.text}>Auteur : {anecdoteDetails?.user?.firstName} {anecdoteDetails?.user?.lastName || 'Auteur inconnu'}</Text>
          <Text style={styles.text}>Nombre de likes : {nbLikes}</Text>
          <Text style={styles.text}>Nombre de signalements : {nbWarns}</Text>
        </View>
        <View style={styles.anecdoteBox}>
          <Text style={styles.text}>{anecdoteDetails.text}</Text>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <View style={styles.buttonSpacing}>
          <BoutonActiver
            title="Désactiver l'anecdote"
            IconComponent={X}
            disabled={anecdoteDetails.valid === 0}
            onPress={() => handleValidation(0)} // Appeler la fonction pour invalider
          />
        </View>
        <BoutonActiver
          title="Valider l'anecdote"
          IconComponent={Check}
          disabled={anecdoteDetails.valid === 1}
          onPress={() => handleValidation(1)} // Appeler la fonction pour valider
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
  anecdoteBox: {
    padding: 14,
    minHeight: 200,
    marginBottom: 8,
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    gap: 8,
    color: Colors.black,
    fontFamily: Fonts.Inter.Basic,
    fontWeight: 500,
    fontSize: 14
  },
  buttonSpacing: {
    marginBottom: 16, // Ajout d'un espace entre les boutons
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
  button: {
    backgroundColor: '#E64034',
    padding: 15,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Inter',
    fontWeight: '600',
    marginRight: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});