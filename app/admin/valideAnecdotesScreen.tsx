import { useState, useEffect, useCallback } from 'react';
import { Text, View, StyleSheet, ActivityIndicator, ScrollView, SafeAreaView } from 'react-native';
import { useRoute, NavigationProp, useNavigation } from '@react-navigation/native';
import { X, Check, MessageSquare, Calendar, User, Heart, AlertTriangle } from 'lucide-react-native';
import Toast from 'react-native-toast-message';

import BoutonRetour from '@/components/divers/boutonRetour';
import { Colors, TextStyles } from '@/constants/GraphSettings';
import BoutonActiver from '@/components/divers/boutonActiver';
import { apiGet, apiPut } from '@/constants/api/apiCalls';
import ErrorScreen from '@/components/pages/errorPage';
import { useUser } from '@/contexts/UserContext';

import Header from '../../components/header';

type ValideAnecdotesStackParamList = {
  valideAnecdotesScreen: undefined;
}

type AnecdoteDetails = {
  id: number;
  text: string;
  valid: number;
  created_at: string;
  user: {
    firstName: string;
    lastName: string;
    room: string;
  };
}

type RouteParams = {
  id: number;
}

export default function ValideAnecdotes() {
  const route = useRoute();
  const { id } = (route.params as RouteParams) || { id: 0 };
  const { setUser } = useUser();
  const navigation = useNavigation<NavigationProp<ValideAnecdotesStackParamList>>();

  const [anecdoteDetails, setAnecdoteDetails] = useState<AnecdoteDetails | null>(null);
  const [nbLikes, setNbLikes] = useState<number | null>(null);
  const [nbWarns, setNbWarns] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAnecdoteDetails = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiGet(`admin/anecdotes/${id}`);
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

  const handleValidation = async (isValid: number) => {
    setLoading(true);
    try {
      const response = await apiPut(`admin/anecdotes/${id}/status`, { is_valid: isValid });
      if (response.success) {
        setAnecdoteDetails(prevDetails => prevDetails ? ({
          ...prevDetails,
          valid: isValid,
        }) : null);

        Toast.show({
          type: 'success',
          text1: isValid === 0 ? 'Anecdote désactivée !' : 'Anecdote validée !',
          text2: response.message,
        });
        navigation.goBack();
      } else if (response.pending) {
        setAnecdoteDetails(prevDetails => prevDetails ? ({
          ...prevDetails,
          valid: isValid,
        }) : null);

        Toast.show({
          type: 'info',
          text1: 'Requête sauvegardée',
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
        <BoutonRetour title={`Gérer l'anecdote ${id}`} />
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
            <Text style={[styles.infoValue, (nbWarns ?? 0) > 0 && styles.warningText]}>{nbWarns}</Text>
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
  buttonContainer: {
    bottom: 20,
    left: 20,
    position: 'absolute',
    right: 20,
  },
  container: {
    backgroundColor: Colors.white,
    flex: 1,
  },
  content: {
    flex: 1,
    paddingBottom: 120,
    paddingHorizontal: 20,
  },
  contentCard: {
    backgroundColor: Colors.white,
    borderColor: Colors.primary,
    borderRadius: 14,
    borderWidth: 2,
    elevation: 3,
    marginBottom: 88,
    minHeight: 150,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
  },
  contentText: {
    ...TextStyles.body,
    color: Colors.primaryBorder,
    lineHeight: 22,
  },
  contentTitle: {
    ...TextStyles.h3Bold,
    color: Colors.primaryBorder,
    marginBottom: 12,
  },
  headerContainer: {
    paddingBottom: 8,
    paddingHorizontal: 20,
  },
  heroIcon: {
    alignItems: 'center',
    backgroundColor: Colors.lightMuted,
    borderRadius: 32,
    height: 64,
    justifyContent: 'center',
    marginBottom: 16,
    width: 64,
  },
  heroSection: {
    alignItems: 'center',
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  heroSubtitle: {
    ...TextStyles.body,
    color: Colors.muted,
    lineHeight: 20,
    textAlign: 'center',
  },
  heroTitle: {
    ...TextStyles.h2Bold,
    color: Colors.primaryBorder,
    marginBottom: 8,
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: Colors.white,
    borderColor: 'rgba(0,0,0,0.06)',
    borderRadius: 14,
    borderWidth: 1,
    elevation: 3,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
  },
  infoLabel: {
    ...TextStyles.body,
    color: Colors.primaryBorder,
    fontWeight: '600',
    marginLeft: 8,
    marginRight: 8,
    minWidth: 80,
  },
  infoRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  infoValue: {
    ...TextStyles.body,
    color: Colors.muted,
    flex: 1,
    lineHeight: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    backgroundColor: Colors.white,
    flex: 1,
    justifyContent: 'center',
  },
  loadingText: {
    ...TextStyles.body,
    color: Colors.muted,
    marginTop: 16,
    textAlign: 'center',
  },
  pendingStatus: {
    color: Colors.primary,
    fontWeight: '600',
  },
  validStatus: {
    color: Colors.success,
    fontWeight: '600',
  },
  warningText: {
    color: Colors.error,
    fontWeight: '600',
  },
});
