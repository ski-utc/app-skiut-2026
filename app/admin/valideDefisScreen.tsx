import { useState, useEffect, useCallback } from 'react';
import { Text, View, StyleSheet, ActivityIndicator, Image, TouchableOpacity, ScrollView, SafeAreaView, Modal, StatusBar } from 'react-native';
import { useRoute, NavigationProp, useNavigation } from '@react-navigation/native';
import { X, Check, Trophy, Calendar, User, Image as ImageIcon, Maximize } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { ImageViewer } from "react-native-image-zoom-viewer";

import BoutonRetour from '@/components/divers/boutonRetour';
import { Colors, TextStyles } from '@/constants/GraphSettings';
import BoutonActiver from '@/components/divers/boutonActiver';
import { ApiError, apiGet, apiPut, handleApiErrorScreen } from '@/constants/api/apiCalls';
import ErrorScreen from '@/components/pages/errorPage';
import { useUser } from '@/contexts/UserContext';

import Header from '../../components/header';

import { AdminStackParamList } from './adminNavigator';

type ChallengeDetails = {
  id: number;
  valid: 0 | 1;
  created_at: string;
  user: {
    firstName: string;
    lastName: string;
  };
  challenge: {
    title: string;
    points: number;
  };
}

type ChallengeDetailsResponse = {
  challenge: ChallengeDetails;
  imagePath: string;
}

type RouteParams = {
  id: number;
}

export default function ValideDefis() {
  const route = useRoute();
  const { id } = (route.params as RouteParams) || { id: 0 };
  const { setUser } = useUser();
  const navigation = useNavigation<NavigationProp<AdminStackParamList>>();

  const [challengeDetails, setChallengeDetails] = useState<ChallengeDetails | null>(null);
  const [proofImage, setProofImage] = useState("https://www.shutterstock.com/image-vector/wifi-error-line-icon-vector-600nw-2043154736.jpg");
  const [isModalVisible, setIsModalVisible] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchChallengeDetails = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiGet<ChallengeDetailsResponse>(`admin/challenges/${id}`);
      if (response.success) {
        setChallengeDetails(response.data.challenge);
        setProofImage(response.data.imagePath);
      } else {
        handleApiErrorScreen(new ApiError(response.message), setUser, setError);
      }
    } catch (err: unknown) {
      handleApiErrorScreen(err, setUser, setError);
    } finally {
      setLoading(false);
    }
  }, [id, setUser]);

  const handleValidation = async (isValid: number, isDelete: number) => {
    setLoading(true);
    try {
      const response = await apiPut(`admin/challenges/${id}/status`, { is_valid: isValid, is_delete: isDelete });

      if (response.success) {
        Toast.show({
          type: 'success',
          text1: 'Défi mis à jour !',
          text2: response.message,
        });
        navigation.goBack();
      } else if (response.pending) {
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
        setError(response.message || 'Une erreur est survenue lors de la validation du défi.');
      }
    } catch (error: unknown) {
      handleApiErrorScreen(error, setUser, setError);
    } finally {
      setLoading(false);
    }
  };

  /*const handleRemoveDefi = async () => {
    Alert.alert(
      'Confirmation',
      'Êtes-vous sûr de vouloir supprimer ce défi ?',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await apiPost('challenges/deleteproofImage', { defiId: challengeDetails.challenge_id });
              if (response.success) {
                Toast.show({
                  type: 'success',
                  text1: 'Défi supprimé !',
                  text2: response.message,
                });
                navigation.goBack();
                Toast.show({
                  type: 'error',
                  text1: 'Une erreur est survenue...',
                  text2: response.message,
                });
                setError(response.message || 'Une erreur est survenue lors de la récupération des matchs.');
              }
            } catch (error : any) {
              if (error.message === 'NoRefreshTokenError' || error.JWT_ERROR) {
                setUser(null);
              } else {
                setError(error.message || 'Erreur réseau.');
              }
            } finally {
              setLoading(false);
              navigation.goBack();
            }
          },
        },
      ],
      { cancelable: true }
    );
  };*/

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };

  useEffect(() => {
    fetchChallengeDetails();
  }, [fetchChallengeDetails]);

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
        <BoutonRetour title="Gestion défis" />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroSection}>
          <View style={styles.heroIcon}>
            <Trophy size={24} color={Colors.primary} />
          </View>
          <Text style={styles.heroTitle}>Détail du défi #{challengeDetails?.id}</Text>
          <Text style={styles.heroSubtitle}>
            Validez ou refusez ce défi soumis
          </Text>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Trophy size={16} color={Colors.primary} />
            <Text style={styles.infoLabel}>Status :</Text>
            <Text style={[styles.infoValue, challengeDetails?.valid ? styles.validStatus : styles.pendingStatus]}>
              {challengeDetails?.valid ? 'Validé' : 'En attente de validation'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Calendar size={16} color={Colors.primary} />
            <Text style={styles.infoLabel}>Date :</Text>
            <Text style={styles.infoValue}>
              {challengeDetails?.created_at ? new Date(challengeDetails.created_at).toLocaleString('fr-FR', {
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
            <Text style={styles.infoValue}>{challengeDetails?.user?.firstName} {challengeDetails?.user?.lastName || 'Auteur inconnu'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Trophy size={16} color={Colors.primary} />
            <Text style={styles.infoLabel}>Défi :</Text>
            <Text style={styles.infoValue}>{challengeDetails?.challenge?.title || 'Pas de description'}</Text>
          </View>
        </View>

        <View style={styles.imageCard}>
          <View style={styles.imageHeader}>
            <ImageIcon size={20} color={Colors.primary} />
            <Text style={styles.imageTitle}>Preuve soumise</Text>
          </View>
          <TouchableOpacity onPress={toggleModal} style={styles.imageContainer} activeOpacity={0.8}>
            <Image
              source={{ uri: `${proofImage}?timestamp=${new Date().getTime()}` }}
              style={styles.proofImage}
              resizeMode="cover"
              onError={() => setProofImage("https://www.shutterstock.com/image-vector/wifi-error-line-icon-vector-600nw-2043154736.jpg")}
            />
            <View style={styles.imageOverlay}>
              <Maximize size={16} color={Colors.white} />
              <Text style={styles.imageOverlayText}>Appuyez pour agrandir</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <View style={styles.buttonContainer}>
        <View style={styles.buttonSpacing}>
          <BoutonActiver
            title="Désactiver le défi"
            IconComponent={X}
            disabled={challengeDetails?.valid === 0}
            color={Colors.accent}
            onPress={() => handleValidation(0, 0)}
          />
        </View>
        <View style={styles.buttonRow}>
          <View style={styles.buttonHalf}>
            <BoutonActiver
              title="Refuser"
              IconComponent={X}
              disabled={challengeDetails?.valid === 1}
              color={Colors.error}
              onPress={() => handleValidation(1, 1)}
            />
          </View>
          <View style={styles.buttonHalf}>
            <BoutonActiver
              title="Valider"
              IconComponent={Check}
              disabled={challengeDetails?.valid === 1}
              color={Colors.success}
              onPress={() => handleValidation(1, 0)}
            />
          </View>
        </View>
      </View>

      <Modal
        visible={isModalVisible}
        transparent={false}
        animationType="fade"
        onRequestClose={toggleModal}
      >
        <StatusBar hidden />
        <View style={styles.fullScreenContainer}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={toggleModal}
            activeOpacity={0.7}
          >
            <X size={24} color={Colors.white} />
          </TouchableOpacity>

          <ImageViewer
            imageUrls={[{ url: proofImage }]}
            index={0}
            backgroundColor="transparent"
            enableSwipeDown={true}
            onSwipeDown={toggleModal}
          />
        </View>
      </Modal>
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
  buttonSpacing: {
    marginBottom: 16,
  },
  closeButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 22,
    height: 44,
    justifyContent: 'center',
    position: 'absolute',
    right: 20,
    top: 50,
    width: 44,
    zIndex: 1000,
  },
  container: {
    backgroundColor: Colors.white,
    flex: 1,
  },
  content: {
    flex: 1,
  },
  fullScreenContainer: {
    backgroundColor: Colors.primaryBorder,
    flex: 1,
    position: 'relative',
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
    ...TextStyles.h2,
    color: Colors.primaryBorder,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  imageCard: {
    backgroundColor: Colors.white,
    borderColor: Colors.primary,
    borderRadius: 14,
    borderWidth: 2,
    elevation: 3,
    marginBottom: 128,
    marginHorizontal: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
  },
  imageContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  imageHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 12,
  },
  imageOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    left: 0,
    paddingHorizontal: 12,
    paddingVertical: 8,
    position: 'absolute',
    right: 0,
  },
  imageOverlayText: {
    ...TextStyles.small,
    color: Colors.white,
    fontWeight: '500',
    marginLeft: 6,
    textAlign: 'center',
  },
  imageTitle: {
    ...TextStyles.h3Bold,
    color: Colors.primaryBorder,
    marginLeft: 8,
  },
  infoCard: {
    backgroundColor: Colors.white,
    borderColor: 'rgba(0,0,0,0.06)',
    borderRadius: 14,
    borderWidth: 1,
    elevation: 3,
    marginBottom: 16,
    marginHorizontal: 20,
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
  proofImage: {
    aspectRatio: 1,
    borderRadius: 12,
    width: '100%',
  },
  validStatus: {
    color: Colors.success,
    fontWeight: '600',
  },
});
