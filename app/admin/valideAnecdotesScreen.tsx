import { useState, useEffect, useCallback } from 'react';
import { Text, View, StyleSheet, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, NavigationProp, useNavigation, RouteProp } from '@react-navigation/native';
import { X, Check, FileQuestion, User, Heart, AlertTriangle, Trash2 } from 'lucide-react-native';
import Toast from 'react-native-toast-message';

import BoutonRetour from '@/components/divers/boutonRetour';
import { Colors, TextStyles } from '@/constants/GraphSettings';
import BoutonActiver from '@/components/divers/boutonActiver';
import { apiGet, apiPut, apiDelete, isSuccessResponse, isPendingResponse, handleApiErrorToast, handleApiErrorScreen, AppError, ApiError } from '@/constants/api/apiCalls';
import ErrorScreen from '@/components/pages/errorPage';
import { useUser } from '@/contexts/UserContext';

import Header from '../../components/header';

import { AdminStackParamList } from './adminNavigator';

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
  nbLikes: number;
  nbWarns: number;
}

type RouteParams = RouteProp<AdminStackParamList, 'valideAnecdotesScreen'>;

export default function ValideAnecdotes() {
  const route = useRoute<RouteParams>();
  const { id } = route.params || { id: 0 };

  const { setUser } = useUser();
  const navigation = useNavigation<NavigationProp<AdminStackParamList>>();

  const [anecdoteDetails, setAnecdoteDetails] = useState<AnecdoteDetails | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAnecdoteDetails = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    setError('');

    try {
      const response = await apiGet<AnecdoteDetails>(`admin/anecdotes/${id}`, false);

      if (isSuccessResponse(response)) {
        setAnecdoteDetails(response.data);
      } else {
        handleApiErrorScreen(new ApiError(response.message), setUser, setError);
      }
    } catch (err: unknown) {
      handleApiErrorScreen(err, setUser, setError);
    } finally {
      setLoading(false);
    }
  }, [id, setUser]);

  const handleValidation = async (isValid: number) => {
    setLoading(true);
    try {
      const response = await apiPut(`admin/anecdotes/${id}/status`, { is_valid: isValid });

      const handleSuccess = (isPending: boolean) => {
        setAnecdoteDetails(prev => prev ? ({ ...prev, valid: isValid }) : null);

        Toast.show({
          type: isPending ? 'info' : 'success',
          text1: isPending ? 'Action sauvegardée' : (isValid === 0 ? 'Désactivée' : 'Validée'),
          text2: isPending ? 'Sera synchronisé plus tard' : response.message,
        });

        navigation.goBack();
      };

      if (isSuccessResponse(response)) {
        handleSuccess(false);
      } else if (isPendingResponse(response)) {
        handleSuccess(true);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Erreur',
          text2: response.message
        });
      }
    } catch (err: unknown) {
      handleApiErrorToast(err as AppError, setUser);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      'Confirmation',
      'Êtes-vous sûr de vouloir supprimer cette anecdote ?',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              const response = await apiDelete(`admin/anecdotes/${id}`);

              if (isSuccessResponse(response)) {
                Toast.show({
                  type: 'success',
                  text1: 'Anecdote supprimée !',
                  text2: response.message,
                });
                navigation.goBack();
              } else if (isPendingResponse(response)) {
                Toast.show({
                  type: 'info',
                  text1: 'Action sauvegardée',
                  text2: 'Sera synchronisé plus tard',
                });
                navigation.goBack();
              } else {
                Toast.show({
                  type: 'error',
                  text1: 'Erreur',
                  text2: response.message
                });
              }
            } catch (err: unknown) {
              handleApiErrorToast(err as AppError, setUser);
            } finally {
              setLoading(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  useEffect(() => {
    fetchAnecdoteDetails();
  }, [fetchAnecdoteDetails]);

  if (!id) {
    return <ErrorScreen error="ID de l'anecdote manquant" />;
  }

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

      {/* <View style={styles.heroSection}>
        <View style={styles.heroIcon}>
          <MessageSquare size={24} color={Colors.primary} />
        </View>
        <Text style={styles.heroTitle}>Détail de l'anecdote #{id}</Text>
        <Text style={styles.heroSubtitle}>
          Validez ou modérez cette anecdote
        </Text>
      </View> */}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <FileQuestion size={16} color={Colors.primary} />
            <Text style={styles.infoLabel}>Status :</Text>
            <Text style={[styles.infoValue, anecdoteDetails?.valid ? styles.validStatus : styles.pendingStatus]}>
              {anecdoteDetails?.valid ? 'Validée' : 'En attente de validation'}
            </Text>
          </View>

          {/* <View style={styles.infoRow}>
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
              }) : 'N/A'}
            </Text>
          </View> */}

          <View style={styles.infoRow}>
            <User size={16} color={Colors.primary} />
            <Text style={styles.infoLabel}>Auteur.ice :</Text>
            <Text style={styles.infoValue}>
              {anecdoteDetails?.user?.firstName} {anecdoteDetails?.user?.lastName || 'Anonyme'}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Heart size={16} color={Colors.primary} />
            <Text style={styles.infoLabel}>Likes :</Text>
            <Text style={styles.infoValue}>{anecdoteDetails?.nbLikes}</Text>
          </View>

          <View style={styles.infoRow}>
            <AlertTriangle size={16} color={Colors.error} />
            <Text style={styles.infoLabel}>Signalements :</Text>
            <Text style={[styles.infoValue, anecdoteDetails?.nbWarns ? styles.warningText : null]}>{anecdoteDetails?.nbWarns}</Text>
          </View>
        </View>

        <View style={styles.contentCard}>
          <Text style={styles.contentTitle}>Contenu de l'anecdote</Text>
          <Text style={styles.contentText}>{anecdoteDetails?.text}</Text>
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        {anecdoteDetails?.valid === 1 ? (
          <View style={styles.buttonRow}>
            <View style={styles.buttonHalf}>
              <BoutonActiver
                title="Désactiver"
                IconComponent={X}
                color={Colors.primary}
                onPress={() => handleValidation(0)}
              />
            </View>
            <View style={styles.buttonHalf}>
              <BoutonActiver
                title="Supprimer"
                IconComponent={Trash2}
                color={Colors.error}
                onPress={handleDelete}
              />
            </View>
          </View>
        ) : (
          <View style={styles.buttonRow}>
            <View style={styles.buttonHalf}>
              <BoutonActiver
                title="Supprimer"
                IconComponent={Trash2}
                color={Colors.error}
                onPress={handleDelete}
              />
            </View>
            <View style={styles.buttonHalf}>
              <BoutonActiver
                title="Valider"
                IconComponent={Check}
                color={Colors.success}
                onPress={() => handleValidation(1)}
              />
            </View>
          </View>
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
  buttonHalf: {
    flex: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
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
