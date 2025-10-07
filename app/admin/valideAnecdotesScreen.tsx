import React, { useState, useEffect, useCallback } from 'react';
import { Text, View, StyleSheet, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { X, Check } from 'lucide-react-native';
import Header from '../../components/header';
import BoutonRetour from '@/components/divers/boutonRetour';
import { Colors, Fonts, TextStyles, loadFonts } from '@/constants/GraphSettings';
import BoutonActiver from '@/components/divers/boutonActiver';
import { apiPost, apiGet } from '@/constants/api/apiCalls';
import ErrorScreen from '@/components/pages/errorPage';
import { useUser } from '@/contexts/UserContext';
import Toast from 'react-native-toast-message';

export default function ValideAnecdotes() {
  const route = useRoute();
  const { id } = route.params;
  const { setUser } = useUser();
  const navigation = useNavigation();

  const [anecdoteDetails, setAnecdoteDetails] = useState(null);
  const [nbLikes, setNbLikes] = useState(null);
  const [nbWarns, setNbWarns] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
    } catch (error: any) {
      if (error.message === 'NoRefreshTokenError' || error.JWT_ERROR) {
        setUser(null);
      } else {
        setError(error.message);
      }
    } finally {
      setLoading(false);
    }
  }, [id, setUser]);

  const handleValidation = async (isValid) => {
    setLoading(true);
    try {
      const response = await apiPost(`updateAnecdoteStatus/${id}/${isValid}`);
      if (response.success) {
        setAnecdoteDetails(prevDetails => ({
          ...prevDetails,
          valid: isValid,
        }));

        Toast.show({
          type: 'success',
          text1: isValid === 0 ? 'Anecdote désactivée !' : 'Anecdote validée !',
          text2: response.message,
        });
        navigation.goBack();
      } else {
        Toast.show({
          type: 'error',
          text1: 'Une erreur est survenue...',
          text2: response.message,
        });
        setError(response.message || 'Une erreur est survenue lors de la validation de l\'anecdote.');
      }
    } catch (error: any) {
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
          <ActivityIndicator size="large" color={Colors.muted} />
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
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
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
            onPress={() => handleValidation(0)}
          />
        </View>
        <BoutonActiver
          title="Valider l'anecdote"
          IconComponent={Check}
          disabled={anecdoteDetails.valid === 1}
          onPress={() => handleValidation(1)}
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
    ...TextStyles.body,
    marginTop: 20,
    color: Colors.primaryBorder,
    fontWeight: '600',
  },
  textBox: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 10,
    padding: 12,
    backgroundColor: Colors.white,
    marginBottom: 20,
    shadowColor: Colors.primaryBorder,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  anecdoteBox: {
    padding: 16,
    minHeight: 200,
    marginBottom: 8,
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.primary,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    gap: 8,
    shadowColor: Colors.primaryBorder,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  buttonSpacing: {
    marginBottom: 16,
  },
  text: {
    ...TextStyles.body,
    color: Colors.primaryBorder,
    lineHeight: 20,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 20,
    width: '100%',
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: Colors.accent,
    padding: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: Colors.primaryBorder,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  buttonText: {
    ...TextStyles.buttonLarge,
    color: Colors.white,
    marginRight: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});