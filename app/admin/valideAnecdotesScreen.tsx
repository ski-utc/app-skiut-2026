import React, { useState, useEffect, useCallback } from 'react';
import { Text, View, StyleSheet, ActivityIndicator, ScrollView, SafeAreaView } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { X, Check, MessageSquare, Calendar, User, Heart, AlertTriangle } from 'lucide-react-native';
import Header from '../../components/header';
import BoutonRetour from '@/components/divers/boutonRetour';
import { Colors, TextStyles, loadFonts } from '@/constants/GraphSettings';
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
      <SafeAreaView style={styles.container}>
        <Header refreshFunction={null} disableRefresh={true} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Chargement des détails...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header refreshFunction={null} disableRefresh={true} />
      <View style={styles.headerContainer}>
        <BoutonRetour previousRoute="gestionAnecdotesScreen" title={`Gérer l'anecdote ${id}`} />
      </View>

      <View style={styles.heroSection}>
        <View style={styles.heroIcon}>
          <MessageSquare size={24} color={Colors.primary} />
        </View>
        <Text style={styles.heroTitle}>Détail de l'anecdote #{id}</Text>
        <Text style={styles.heroSubtitle}>
          Validez ou modérez cette anecdote
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <MessageSquare size={16} color={Colors.primary} />
            <Text style={styles.infoLabel}>Status :</Text>
            <Text style={[styles.infoValue, anecdoteDetails?.valid ? styles.validStatus : styles.pendingStatus]}>
              {anecdoteDetails?.valid ? 'Validée' : 'En attente de validation'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Calendar size={16} color={Colors.primary} />
            <Text style={styles.infoLabel}>Date :</Text>
            <Text style={styles.infoValue}>
              {anecdoteDetails?.created_at ? new Date(anecdoteDetails.created_at).toLocaleString('fr-FR', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
              }) : 'Date non disponible'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <User size={16} color={Colors.primary} />
            <Text style={styles.infoLabel}>Auteur :</Text>
            <Text style={styles.infoValue}>{anecdoteDetails?.user?.firstName} {anecdoteDetails?.user?.lastName || 'Auteur inconnu'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Heart size={16} color={Colors.primary} />
            <Text style={styles.infoLabel}>Likes :</Text>
            <Text style={styles.infoValue}>{nbLikes}</Text>
          </View>
          <View style={styles.infoRow}>
            <AlertTriangle size={16} color={Colors.error} />
            <Text style={styles.infoLabel}>Signalements :</Text>
            <Text style={[styles.infoValue, nbWarns > 0 && styles.warningText]}>{nbWarns}</Text>
          </View>
        </View>

        <View style={styles.contentCard}>
          <Text style={styles.contentTitle}>Contenu de l'anecdote</Text>
          <Text style={styles.contentText}>{anecdoteDetails?.text}</Text>
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        {anecdoteDetails?.valid === 1 ? (
          <BoutonActiver
            title="Désactiver l'anecdote"
            IconComponent={X}
            disabled={anecdoteDetails?.valid === 0}
            color={Colors.error}
            onPress={() => handleValidation(0)}
          />
        ) : (
          <BoutonActiver
            title="Valider l'anecdote"
            IconComponent={Check}
            disabled={anecdoteDetails?.valid === 1}
            color={Colors.success}
            onPress={() => handleValidation(1)}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  loadingText: {
    ...TextStyles.body,
    color: Colors.muted,
    marginTop: 16,
    textAlign: 'center',
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  heroSection: {
    alignItems: 'center',
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.lightMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    ...TextStyles.h2Bold,
    color: Colors.primaryBorder,
    marginBottom: 8,
    textAlign: 'center',
  },
  heroSubtitle: {
    ...TextStyles.body,
    color: Colors.muted,
    textAlign: 'center',
    lineHeight: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  infoCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 2, height: 3 },
    shadowRadius: 5,
    elevation: 3,
    padding: 16,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  infoLabel: {
    ...TextStyles.body,
    color: Colors.primaryBorder,
    fontWeight: '600',
    marginLeft: 8,
    marginRight: 8,
    minWidth: 80,
  },
  infoValue: {
    ...TextStyles.body,
    color: Colors.muted,
    flex: 1,
    lineHeight: 20,
  },
  validStatus: {
    color: Colors.success,
    fontWeight: '600',
  },
  pendingStatus: {
    color: Colors.primary,
    fontWeight: '600',
  },
  warningText: {
    color: Colors.error,
    fontWeight: '600',
  },
  contentCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colors.primary,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 2, height: 3 },
    shadowRadius: 5,
    elevation: 3,
    padding: 16,
    minHeight: 150,
    marginBottom: 88,
  },
  contentTitle: {
    ...TextStyles.h3Bold,
    color: Colors.primaryBorder,
    marginBottom: 12,
  },
  contentText: {
    ...TextStyles.body,
    color: Colors.primaryBorder,
    lineHeight: 22,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
});