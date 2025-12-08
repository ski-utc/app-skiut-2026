import { useState, useEffect, useCallback } from 'react';
import {
  Text,
  View,
  StyleSheet,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  ScrollView,
  Modal,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  useRoute,
  NavigationProp,
  useNavigation,
} from '@react-navigation/native';
import {
  X,
  Check,
  Trophy,
  User,
  Image as ImageIcon,
  Maximize,
  Play,
  Pause,
  Video as VideoIcon,
  FileQuestion,
} from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { ImageViewer } from 'react-native-image-zoom-viewer';
import { useVideoPlayer, VideoView } from 'expo-video';

import BoutonRetour from '@/components/divers/boutonRetour';
import { Colors, TextStyles } from '@/constants/GraphSettings';
import BoutonActiver from '@/components/divers/boutonActiver';
import {
  ApiError,
  apiGet,
  apiPut,
  handleApiErrorScreen,
} from '@/constants/api/apiCalls';
import ErrorScreen from '@/components/pages/errorPage';
import { useUser } from '@/contexts/UserContext';

import Header from '../../components/header';

import { AdminStackParamList } from './adminNavigator';

type ChallengeDetails = {
  id: number;
  valid: boolean;
  created_at: string;
  user: {
    firstName: string;
    lastName: string;
  };
  challenge: {
    title: string;
    points: number;
  };
};

type ChallengeDetailsResponse = {
  challenge: ChallengeDetails;
  imagePath: string;
  mediaType: 'image' | 'video' | null;
};

type RouteParams = {
  id: number;
};

export default function ValideDefis() {
  const route = useRoute();
  const { id } = (route.params as RouteParams) || { id: 0 };
  const { setUser } = useUser();
  const navigation = useNavigation<NavigationProp<AdminStackParamList>>();

  const [challengeDetails, setChallengeDetails] =
    useState<ChallengeDetails | null>(null);
  const [proofMedia, setProofMedia] = useState(
    'https://www.shutterstock.com/image-vector/wifi-error-line-icon-vector-600nw-2043154736.jpg',
  );
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreenVideoPlaying, setIsFullscreenVideoPlaying] =
    useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const videoPlayer = useVideoPlayer(
    proofMedia && mediaType === 'video' ? proofMedia : '',
    (player) => {
      player.loop = false;
    },
  );

  useEffect(() => {
    if (mediaType === 'video' && videoPlayer) {
      if (isPlaying || isFullscreenVideoPlaying) {
        videoPlayer.play();
      } else {
        videoPlayer.pause();
      }
    }
  }, [isPlaying, isFullscreenVideoPlaying, mediaType, videoPlayer]);

  const toggleModal = () => {
    if (!isModalVisible) {
      setIsPlaying(false);
      setIsFullscreenVideoPlaying(false);
    } else {
      setIsFullscreenVideoPlaying(false);
    }
    setIsModalVisible(!isModalVisible);
  };

  const fetchChallengeDetails = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiGet<ChallengeDetailsResponse>(
        `admin/challenges/${id}`,
      );
      if (response.success) {
        setChallengeDetails(response.data.challenge);
        setProofMedia(response.data.imagePath);
        setMediaType(response.data.mediaType || 'image');
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
      const response = await apiPut(`admin/challenges/${id}/status`, {
        is_valid: isValid,
        is_delete: isDelete,
      });

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
        setError(
          response.message ||
            'Une erreur est survenue lors de la validation du défi.',
        );
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

  useEffect(() => {
    fetchChallengeDetails();
  }, [fetchChallengeDetails]);

  if (error !== '') {
    return <ErrorScreen error={error} />;
  }

  if (loading) {
    return (
      <SafeAreaView
        style={styles.container}
        edges={['bottom', 'left', 'right']}
      >
        <Header refreshFunction={null} disableRefresh={true} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Chargement des détails...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <Header refreshFunction={null} disableRefresh={true} />
      <View style={styles.headerContainer}>
        <BoutonRetour title="Gestion défis" />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* <View style={styles.heroSection}>
          <View style={styles.heroIcon}>
            <Trophy size={24} color={Colors.primary} />
          </View>
          <Text style={styles.heroTitle}>Détail du défi #{challengeDetails?.id}</Text>
          <Text style={styles.heroSubtitle}>
            Validez ou refusez ce défi soumis
          </Text>
        </View> */}

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Trophy size={16} color={Colors.primary} />
            <Text style={styles.infoLabel}>Défi :</Text>
            <Text style={styles.infoValue}>
              {challengeDetails?.challenge?.title || 'Pas de description'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <FileQuestion size={16} color={Colors.primary} />
            <Text style={styles.infoLabel}>Status :</Text>
            <Text
              style={[
                styles.infoValue,
                challengeDetails?.valid
                  ? styles.validStatus
                  : styles.pendingStatus,
              ]}
            >
              {challengeDetails?.valid ? 'Validé' : 'En attente de validation'}
            </Text>
          </View>
          {/* <View style={styles.infoRow}>
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
          </View> */}
          <View style={styles.infoRow}>
            <User size={16} color={Colors.primary} />
            <Text style={styles.infoLabel}>Auteur.ice :</Text>
            <Text style={styles.infoValue}>
              {challengeDetails?.user?.firstName}{' '}
              {challengeDetails?.user?.lastName || 'Auteur inconnu'}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.imageCard,
            challengeDetails?.valid === false
              ? styles.marginBottomLarge
              : styles.marginBottomSmall,
          ]}
        >
          <View style={styles.imageHeader}>
            {mediaType === 'video' ? (
              <VideoIcon size={20} color={Colors.primary} />
            ) : (
              <ImageIcon size={20} color={Colors.primary} />
            )}
            <Text style={styles.imageTitle}>Preuve soumise</Text>
          </View>
          <TouchableOpacity
            onPress={toggleModal}
            style={styles.imageContainer}
            activeOpacity={0.8}
          >
            {mediaType === 'video' ? (
              <>
                <VideoView
                  player={videoPlayer}
                  style={styles.proofImage}
                  contentFit="cover"
                  allowsPictureInPicture={false}
                  nativeControls={false}
                />
                <View style={styles.mediaTypeBadge}>
                  <VideoIcon size={14} color={Colors.white} />
                  <Text style={styles.mediaTypeText}>Vidéo</Text>
                </View>
                {!isPlaying && (
                  <TouchableOpacity
                    style={styles.playButton}
                    onPress={() => setIsPlaying(true)}
                  >
                    <Play size={28} color={Colors.white} />
                  </TouchableOpacity>
                )}
                {isPlaying && (
                  <TouchableOpacity
                    style={styles.pauseButton}
                    onPress={() => setIsPlaying(false)}
                  >
                    <Pause size={20} color={Colors.white} />
                  </TouchableOpacity>
                )}
              </>
            ) : (
              <>
                <Image
                  source={{
                    uri: `${proofMedia}?timestamp=${new Date().getTime()}`,
                  }}
                  style={styles.proofImage}
                  resizeMode="cover"
                  onError={() =>
                    setProofMedia(
                      'https://www.shutterstock.com/image-vector/wifi-error-line-icon-vector-600nw-2043154736.jpg',
                    )
                  }
                />
                <View style={styles.mediaTypeBadge}>
                  <ImageIcon size={14} color={Colors.white} />
                  <Text style={styles.mediaTypeText}>Image</Text>
                </View>
              </>
            )}
            <View style={styles.imageOverlay}>
              <Maximize size={16} color={Colors.white} />
              <Text style={styles.imageOverlayText}>Appuyez pour agrandir</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <View style={styles.buttonContainer}>
        {/* <View style={styles.buttonSpacing}>
          <BoutonActiver
            title="Désactiver le défi"
            IconComponent={X}
            disabled={challengeDetails?.valid === 0}
            color={Colors.accent}
            onPress={() => handleValidation(0, 0)}
          />
        </View> */}
        {challengeDetails?.valid === false && (
          <View style={styles.buttonRow}>
            <View style={styles.buttonHalf}>
              <BoutonActiver
                title="Refuser"
                IconComponent={X}
                color={Colors.error}
                onPress={() => handleValidation(1, 1)}
              />
            </View>
            <View style={styles.buttonHalf}>
              <BoutonActiver
                title="Valider"
                IconComponent={Check}
                color={Colors.success}
                onPress={() => handleValidation(1, 0)}
              />
            </View>
          </View>
        )}
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

          {mediaType === 'video' ? (
            <View style={styles.modalVideoContainer}>
              <VideoView
                player={videoPlayer}
                style={styles.modalVideo}
                contentFit="contain"
                allowsPictureInPicture
              />
              {!isFullscreenVideoPlaying && (
                <TouchableOpacity
                  style={styles.modalPlayButton}
                  onPress={() => setIsFullscreenVideoPlaying(true)}
                >
                  <Play size={28} color={Colors.white} />
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <ImageViewer
              imageUrls={[{ url: proofMedia }]}
              index={0}
              backgroundColor="transparent"
              enableSwipeDown={true}
              onSwipeDown={toggleModal}
              renderIndicator={() => <View />}
            />
          )}
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

  imageCard: {
    backgroundColor: Colors.white,
    borderColor: Colors.primary,
    borderRadius: 14,
    borderWidth: 2,
    elevation: 3,
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
  marginBottomLarge: {
    marginBottom: 96,
  },
  marginBottomSmall: {
    marginBottom: 16,
  },

  mediaTypeBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 4,
    left: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    position: 'absolute',
    top: 12,
  },

  mediaTypeText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  modalPlayButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 30,
    height: 60,
    justifyContent: 'center',
    left: '50%',
    position: 'absolute',
    top: '50%',
    transform: [{ translateX: -30 }, { translateY: -10 }],
    width: 60,
    zIndex: 20,
  },
  modalVideo: {
    flex: 1,
    height: '100%',
    width: '100%',
  },
  modalVideoContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    width: '100%',
  },
  pauseButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    position: 'absolute',
    right: 12,
    top: 12,
    width: 40,
  },
  pendingStatus: {
    color: Colors.primary,
    fontWeight: '600',
  },
  playButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 40,
    height: 80,
    justifyContent: 'center',
    left: '50%',
    marginLeft: -40,
    marginTop: -40,
    position: 'absolute',
    top: '50%',
    width: 80,
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
