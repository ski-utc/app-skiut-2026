import React, { useState, useEffect } from 'react';
import { Text, View, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { X, Check } from 'lucide-react-native';
import Header from '../../components/header';
import BoutonRetour from '@/components/divers/boutonRetour';
import { Colors, Fonts } from '@/constants/GraphSettings';
import BoutonActiver from '@/components/divers/boutonActiver';
import { apiPost, apiGet } from '@/constants/api/apiCalls'; // Assurez-vous d'importer l'appel API
import ErrorScreen from '@/components/pages/errorPage';

export default function ValideAnecdotes() {
  const route = useRoute();
  const { anecdoteId } = route.params; // Récupération de l'ID de l'anecdote
  console.log('Anecdote ID:', anecdoteId);

  const [anecdoteDetails, setAnecdoteDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [anecdoteStatus, setAnecdoteStatus] = useState(null); // État pour le statut de validation

  // Fonction pour récupérer les détails de l'anecdote
  const fetchAnecdoteDetails = async () => {
    setLoading(true);
    try {
      const response = await apiGet(`getAnecdoteDetails/${anecdoteId}`);
      if (response.success) {
        setAnecdoteDetails(response.data);
        setAnecdoteStatus(response.data.valid); // Assurez-vous de récupérer et stocker le statut
      } else {
        setError('Erreur lors de la récupération des détails de l\'anecdote');
      }
    } catch (err) {
      setError('Erreur lors de la récupération des détails');
    } finally {
      setLoading(false);
    }
  };




  // Fonction pour valider ou invalider l'anecdote
  const handleValidation = async (isValid) => {
    setLoading(true);
    try {
      const response = await apiPost(`getAnecdoteDetails/${anecdoteId}/${isValid}`);
      if (response.success) {
        setAnecdoteStatus(isValid); // Mettre à jour le statut localement
      }
    } catch (err) {
      setError('Erreur lors de la mise à jour du statut');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnecdoteDetails(); // Charger les détails de l'anecdote au chargement
  }, [anecdoteId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="gray" />
      </View>
    );
  }

  if (error) {
    return <ErrorScreen error={error} />;
  }

  return (
    <View style={styles.container}>
      <Header />
      <View style={styles.content}>
        <BoutonRetour previousRoute="gestionAnecdotesScreen" title={`Gérer l'anecdote ${anecdoteId}`} />
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
            disabled={anecdoteDetails.valid == 0} // Désactiver le bouton si l'anecdote est déjà invalidée
            onPress={() => handleValidation(false)} // Appeler la fonction pour invalider
          />
        </View>
        <BoutonActiver
          title="Valider l'anecdote"
          IconComponent={Check}
          disabled={anecdoteStatus == 1} // Désactiver le bouton si l'anecdote est déjà validée
          onPress={() => handleValidation(true)} // Appeler la fonction pour valider
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
});
