import { useEffect, useState, useCallback } from 'react';
import { View, Image, Text, ActivityIndicator, TouchableOpacity, Alert, Modal, StatusBar, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useVideoPlayer, VideoView } from 'expo-video';
import * as ImageManipulator from "expo-image-manipulator";
import { useRoute, RouteProp } from '@react-navigation/native';
import { LandPlot, Trash, Check, Hourglass, X, Upload, CloudOff, Maximize, Play, Pause, Image as ImageIcon, Video as VideoIcon } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { ImageViewer } from "react-native-image-zoom-viewer";

import { useUser } from '@/contexts/UserContext';
import BoutonRetour from '@/components/divers/boutonRetour';
import { apiPost, apiGet, apiDelete, isSuccessResponse, isPendingResponse, handleApiErrorToast, AppError } from '@/constants/api/apiCalls';
import ErrorScreen from '@/components/pages/errorPage';
import { Colors, TextStyles } from '@/constants/GraphSettings';

import Header from '../../components/header';

type DefisInfosParams = {
  id: number;
  title: string;
  points: number;
  status: string;
};

type DefisInfosRouteProp = RouteProp<{ params: DefisInfosParams }, 'params'>;

type ProofMediaResponse = {
  media: string | null;
  mediaType: 'image' | 'video' | null;
}

type MaxFileSizeResponse = {
  maxImageSize: number;
  maxVideoSize: number;
}

export default function DefisInfos() {
  const route = useRoute<DefisInfosRouteProp>();
  const { id, title, points, status: initialStatus } = route.params;

  const [proofMedia, setProofMedia] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [networkError, setNetworkError] = useState(false);

  const { setUser, user } = useUser();

  const [modifiedMedia, setModifiedMedia] = useState(false);
  const [dynamicStatus, setDynamicStatus] = useState(initialStatus);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreenVideoPlaying, setIsFullscreenVideoPlaying] = useState(false);

  const toggleModal = () => {
    if (!isModalVisible) {
      setIsPlaying(false);
      setIsFullscreenVideoPlaying(false);
    } else {
      setIsFullscreenVideoPlaying(false);
    }
    setIsModalVisible(!isModalVisible);
  };

  const fetchProof = useCallback(async () => {
    setLoading(true);
    setNetworkError(false);
    setError('');

    try {
      const response = await apiGet<ProofMediaResponse>(`challenges/proof-media/${id}`);

      if (isSuccessResponse(response)) {
        setProofMedia(response.data.media);
        setMediaType(response.data.mediaType || 'image');
      }
    } catch (err: unknown) {
      handleApiErrorToast(err as AppError, setUser);
      setNetworkError(true);
    } finally {
      setLoading(false);
    }
  }, [id, setUser]);

  useEffect(() => {
    if (initialStatus !== 'empty' && initialStatus !== 'todo') {
      fetchProof();
    }
  }, [initialStatus, fetchProof]);

  const handleMediaPick = async (type: 'image' | 'video' | 'both' = 'both') => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.status !== 'granted') {
      Toast.show({ type: 'error', text1: 'Permission requise', text2: 'Nous avons besoin de votre permission pour accéder à votre galerie.' });
      return;
    }

    let mediaTypes: ('images' | 'videos')[] = ['images', 'videos'];
    if (type === 'image') mediaTypes = ['images'];
    else if (type === 'video') mediaTypes = ['videos'];

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes,
      quality: 1,
      videoQuality: ImagePicker.UIImagePickerControllerQualityType.Medium,
      videoMaxDuration: 60,
    });

    if (result.canceled) return;

    try {
      setIsCompressing(true);
      const asset = result.assets[0];
      const { uri, width } = asset;

      const isVideo = asset.type === 'video' || uri.endsWith('.mp4') || uri.endsWith('.mov');
      const currentMediaType = isVideo ? 'video' : 'image';
      setMediaType(currentMediaType);

      let maxFileSize = isVideo ? 15 * 1024 * 1024 : 5 * 1024 * 1024;

      try {
        const sizeRes = await apiGet<MaxFileSizeResponse>("challenges/max-file-size");
        if (isSuccessResponse(sizeRes)) {
          maxFileSize = isVideo
            ? (sizeRes.data.maxVideoSize || maxFileSize)
            : (sizeRes.data.maxImageSize || maxFileSize);
        }
      } catch {
        maxFileSize = isVideo ? 15 * 1024 * 1024 : 5 * 1024 * 1024;
      }

      if (isVideo) {
        const fileInfo = await fetch(uri).then(r => r.blob());
        if (fileInfo.size > maxFileSize) {
          Toast.show({ type: 'error', text1: 'Erreur', text2: `Vidéo trop lourde (Max ${Math.round(maxFileSize / 1024 / 1024)} Mo).` });
          return;
        }
        setModifiedMedia(true);
        setProofMedia(uri);
      } else {
        let compressQuality = 1;
        let compressedUri = uri;
        let fileSize = Infinity;

        do {
          const manipResult = await ImageManipulator.manipulateAsync(
            uri,
            [{ resize: { width: width > 1080 ? 1080 : width } }],
            { compress: compressQuality, format: ImageManipulator.SaveFormat.JPEG }
          );

          const fileInfo = await fetch(manipResult.uri).then(r => r.blob());
          fileSize = fileInfo.size;
          compressedUri = manipResult.uri;

          if (fileSize > maxFileSize) {
            compressQuality -= 0.1;
          }
        } while (fileSize > maxFileSize && compressQuality > 0.1);

        if (fileSize > maxFileSize) {
          Toast.show({ type: 'error', text1: 'Erreur', text2: 'Image trop lourde même après compression.' });
          return;
        }

        setModifiedMedia(true);
        setProofMedia(compressedUri);
      }
    } catch (err: unknown) {
      handleApiErrorToast(err as AppError, setUser);
    } finally {
      setIsCompressing(false);
    }
  };

  const uploadMedia = async (uri: string) => {
    if (!uri) return;

    try {
      setIsUploading(true);

      const formData = new FormData();
      const mimeType = mediaType === 'video' ? 'video/mp4' : 'image/jpeg';
      const extension = mediaType === 'video' ? '.mp4' : '.jpg';
      const fileName = `challenge_${id}_user_${user?.id}_${Date.now()}${extension}`;

      formData.append('media', new Blob([uri], { type: mimeType }), fileName); // Todo : verify this semantics
      formData.append('defiId', id.toString());
      formData.append('mediaType', mediaType);

      const response = await apiPost('challenges/proof-media', formData, true);
      const handleSuccessOrPending = (isPending: boolean) => {
        const newStatus = 'pending';
        setDynamicStatus(newStatus);

        Toast.show({
          type: isPending ? 'info' : 'success',
          text1: isPending ? 'Sauvegardé (Hors ligne)' : 'Défi envoyé !',
          text2: response.message,
        });

        setModifiedMedia(false);
      };

      if (isSuccessResponse(response)) {
        handleSuccessOrPending(false);
      } else if (isPendingResponse(response)) {
        handleSuccessOrPending(true);
      }

    } catch (err: unknown) {
      handleApiErrorToast(err as AppError, setUser);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSendDefi = async () => {
    if (proofMedia) {
      await uploadMedia(proofMedia);
    }
  };

  const handleRemoveDefi = async () => {
    Alert.alert(
      'Confirmation',
      'Voulez-vous vraiment supprimer ce défi ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await apiDelete(`challenges/proof-media/${id}`);

              if (isSuccessResponse(response) || isPendingResponse(response)) {
                setProofMedia(null);
                setMediaType('image');
                setDynamicStatus('todo');

                Toast.show({
                  type: 'success',
                  text1: 'Défi supprimé',
                  text2: response.message
                });
              }
            } catch (err: unknown) {
              handleApiErrorToast(err as AppError, setUser);
            }
          },
        },
      ]
    );
  };

  if (error) {
    return <ErrorScreen error={error} />;
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <Header refreshFunction={undefined} disableRefresh={true} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primaryBorder} />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </View>
    );
  }

  const isEmptyStatus = dynamicStatus === 'empty' || dynamicStatus === 'todo';

  return (
    <View style={styles.pageContainer}>
      <Header refreshFunction={null} disableRefresh={undefined} />

      <View style={styles.headerTitleContainer}>
        <BoutonRetour title={title} />
      </View>

      <View style={styles.pointsContainer}>
        <Text style={styles.pointsText}>Points : {points}</Text>
      </View>

      <View style={styles.mediaContainer}>
        <TouchableOpacity
          onPress={isEmptyStatus ? () => handleMediaPick() : toggleModal}
          style={styles.mediaTouchable}
          disabled={(!isEmptyStatus && !proofMedia) || isCompressing || isUploading}
          activeOpacity={0.8}
        >
          {networkError ? (
            <View style={styles.networkErrorContainer}>
              <CloudOff size={80} color={Colors.muted} />
              <Text style={styles.networkErrorTitle}>Problème de connexion</Text>
              <Text style={styles.networkErrorSubtitle}>Impossible de charger l'image</Text>
            </View>
          ) : proofMedia ? (
            <View style={styles.mediaPreviewContainer}>
              {mediaType === 'video' ? (
                <PreviewVideoPlayer
                  uri={proofMedia}
                  isPlaying={isPlaying}
                  onError={() => setNetworkError(true)}
                />
              ) : (
                <Image
                  source={{ uri: proofMedia }}
                  style={styles.mediaPreview}
                  resizeMode="cover"
                  onError={() => setNetworkError(true)}
                />
              )}

              <View style={styles.mediaTypeBadge}>
                {mediaType === 'video' ? <VideoIcon size={14} color={Colors.white} /> : <ImageIcon size={14} color={Colors.white} />}
                <Text style={styles.mediaTypeText}>{mediaType === 'video' ? 'Vidéo' : 'Image'}</Text>
              </View>

              {mediaType === 'video' && !isPlaying && (
                <TouchableOpacity style={styles.playButton} onPress={() => setIsPlaying(true)}>
                  <Play size={28} color={Colors.white} />
                </TouchableOpacity>
              )}
              {mediaType === 'video' && isPlaying && (
                <TouchableOpacity style={styles.pauseButton} onPress={() => setIsPlaying(false)}>
                  <Pause size={20} color={Colors.white} />
                </TouchableOpacity>
              )}

              {!isEmptyStatus && !isCompressing && !isUploading && (
                <View style={styles.fullscreenHintContainer}>
                  <Maximize size={16} color={Colors.white} />
                  <Text style={styles.fullscreenHintText}>Appuyez pour agrandir</Text>
                </View>
              )}

              {(isCompressing || isUploading) && (
                <View style={styles.uploadOverlay}>
                  <ActivityIndicator size="large" color={Colors.white} />
                  <Text style={styles.uploadOverlayText}>
                    {isCompressing ? 'Traitement...' : 'Envoi en cours...'}
                  </Text>
                </View>
              )}
            </View>
          ) : (isCompressing || isUploading) ? (
            <View style={styles.processingContainer}>
              <ActivityIndicator size="large" color={Colors.primaryBorder} />
              <Text style={styles.processingText}>
                {isCompressing ? 'Compression...' : 'Envoi en cours...'}
              </Text>
            </View>
          ) : (
            <View style={styles.emptyMediaContainer}>
              <Upload size={80} color={Colors.primary} />
              <Text style={styles.emptyMediaTitle}>Ajouter une preuve</Text>
              <Text style={styles.emptyMediaSubtitle}>Photo ou vidéo (max 60s)</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.bottomActions}>
        {!isEmptyStatus ? (
          dynamicStatus !== 'done' ? (
            <>
              <View style={styles.statusBadgeRejected}>
                <Text style={styles.statusBadgeText}>
                  {dynamicStatus === 'refused' ? 'Défi refusé' : 'En attente de validation'}
                </Text>
                {dynamicStatus === 'refused' ? <X color="white" size={20} /> : <Hourglass color="white" size={20} />}
              </View>
              <TouchableOpacity style={styles.deleteButton} onPress={handleRemoveDefi}>
                <Text style={styles.deleteButtonText}>Supprimer</Text>
                <Trash color="white" size={20} />
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.statusBadgeValidated}>
              <Text style={styles.statusBadgeText}>Défi validé</Text>
              <Check color="white" size={20} />
            </View>
          )
        ) : (
          <TouchableOpacity
            style={[
              styles.publishButton,
              (!modifiedMedia || isUploading || isCompressing) && styles.publishButtonDisabled
            ]}
            onPress={handleSendDefi}
            disabled={!modifiedMedia || isUploading || isCompressing}
          >
            <Text style={styles.publishButtonText}>Publier mon défi</Text>
            <LandPlot color="white" size={20} />
          </TouchableOpacity>
        )}
      </View>

      {proofMedia && (
        <Modal
          visible={isModalVisible}
          transparent={false}
          animationType="fade"
          onRequestClose={toggleModal}
        >
          <StatusBar hidden />
          <View style={styles.modalContainer}>
            <TouchableOpacity style={styles.modalCloseButton} onPress={toggleModal} activeOpacity={0.7}>
              <X size={24} color={Colors.white} />
            </TouchableOpacity>

            {mediaType === 'video' ? (
              <View style={styles.modalVideoContainer}>
                <ModalVideoPlayer
                  uri={proofMedia}
                  shouldPlay={isFullscreenVideoPlaying}
                  onPlaybackStatusUpdate={(isPlaying) => {
                    if (isPlaying) {
                      setIsFullscreenVideoPlaying(true);
                    }
                  }}
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
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bottomActions: {
    alignItems: 'center',
    backgroundColor: Colors.white,
    bottom: 0,
    paddingBottom: 20,
    position: 'absolute',
    width: '100%',
  },
  container: {
    backgroundColor: Colors.white,
    flex: 1,
  },
  deleteButton: {
    alignItems: 'center',
    backgroundColor: Colors.error,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
    padding: 12,
    width: '90%',
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 10,
  },
  emptyMediaContainer: {
    alignItems: 'center',
    aspectRatio: 1,
    borderColor: Colors.primaryBorder,
    borderRadius: 12,
    borderStyle: 'dashed',
    borderWidth: 2,
    justifyContent: 'center',
    padding: 40,
    width: '100%',
  },
  emptyMediaSubtitle: {
    ...TextStyles.body,
    color: Colors.muted,
    marginTop: 8,
    textAlign: 'center',
  },
  emptyMediaTitle: {
    ...TextStyles.h3Bold,
    color: Colors.primaryBorder,
    marginTop: 16,
    textAlign: 'center',
  },

  fullscreenHintContainer: {
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
  fullscreenHintText: {
    ...TextStyles.small,
    color: Colors.white,
    fontWeight: '500',
    marginLeft: 6,
    textAlign: 'center',
  },
  headerTitleContainer: {
    paddingHorizontal: 20,
    paddingRight: 30,
    width: '100%',
  },
  loadingContainer: {
    alignItems: 'center',
    backgroundColor: Colors.white,
    flex: 1,
    justifyContent: 'center',
    width: '100%',
  },
  loadingText: {
    ...TextStyles.body,
    color: Colors.muted,
    marginTop: 16,
  },
  mediaContainer: {
    paddingHorizontal: 20,
    width: '100%',
  },
  mediaPreview: {
    height: '100%',
    width: '100%',
  },
  mediaPreviewContainer: {
    aspectRatio: 1,
    backgroundColor: '#000000',
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    width: '100%',
  },
  mediaTouchable: {
    backgroundColor: Colors.white,
    borderColor: 'rgba(0,0,0,0.06)',
    borderRadius: 14,
    borderWidth: 1,
    elevation: 3,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    width: '100%',
  },
  mediaTypeBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 6,
    flexDirection: 'row',
    left: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    position: 'absolute',
    top: 12,
    zIndex: 10,
  },
  mediaTypeText: {
    ...TextStyles.small,
    color: Colors.white,
    fontWeight: '600',
    marginLeft: 4,
  },
  modalCloseButton: {
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
  modalContainer: {
    backgroundColor: '#000000',
    flex: 1,
    position: 'relative',
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
    height: '100%',
    width: '100%',
  },
  modalVideoContainer: {
    alignItems: 'center',
    backgroundColor: '#000000',
    flex: 1,
    justifyContent: 'center',
  },
  networkErrorContainer: {
    alignItems: 'center',
    aspectRatio: 1,
    backgroundColor: Colors.white,
    borderColor: Colors.lightMuted,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    padding: 40,
    width: '100%',
  },
  networkErrorSubtitle: {
    ...TextStyles.small,
    color: Colors.muted,
    marginTop: 8,
    textAlign: 'center',
  },
  networkErrorTitle: {
    ...TextStyles.body,
    color: Colors.muted,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  pageContainer: {
    backgroundColor: Colors.white,
    flex: 1,
  },
  pauseButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    position: 'absolute',
    right: 12,
    top: 12,
    width: 40,
    zIndex: 20,
  },

  playButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 30,
    height: 60,
    justifyContent: 'center',
    left: '50%',
    position: 'absolute',
    top: '50%',
    transform: [{ translateX: -30 }, { translateY: -30 }],
    width: 60,
    zIndex: 20,
  },
  pointsContainer: {
    marginBottom: 32,
    paddingHorizontal: 20,
    width: '100%',
  },
  pointsText: {
    ...TextStyles.h2Bold,
    color: Colors.primaryBorder,
  },
  processingContainer: {
    alignItems: 'center',
    aspectRatio: 1,
    justifyContent: 'center',
    width: '100%',
  },
  processingText: {
    ...TextStyles.body,
    color: Colors.muted,
    marginTop: 12,
  },
  publishButton: {
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 10,
    elevation: 3,
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
    paddingVertical: 16,
    shadowColor: Colors.primaryBorder,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    width: '90%',
  },
  publishButtonDisabled: {
    opacity: 0.4,
  },
  publishButtonText: {
    ...TextStyles.button,
    color: Colors.white,
  },

  statusBadgeRejected: {
    alignItems: 'center',
    backgroundColor: Colors.muted,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 8,
    padding: 10,
    width: '90%',
  },
  statusBadgeText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 10,
  },

  statusBadgeValidated: {
    alignItems: 'center',
    backgroundColor: Colors.success,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
    padding: 12,
    width: '90%',
  },
  uploadOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 30,
  },
  uploadOverlayText: {
    ...TextStyles.body,
    color: Colors.white,
    fontWeight: '600',
    marginTop: 12,
  },
});

function PreviewVideoPlayer({ uri, isPlaying, onError: _onError }: { uri: string, isPlaying: boolean, onError: () => void }) {
  const player = useVideoPlayer(uri, player => {
    player.loop = false;
  });

  useEffect(() => {
    if (isPlaying) {
      player.play();
    } else {
      player.pause();
    }
  }, [isPlaying, player]);

  return (
    <VideoView
      player={player}
      style={styles.mediaPreview}
      contentFit="cover"
      allowsFullscreen={false}
      allowsPictureInPicture={false}
      nativeControls={false}
    />
  );
}

function ModalVideoPlayer({ uri, shouldPlay, onPlaybackStatusUpdate }: { uri: string, shouldPlay: boolean, onPlaybackStatusUpdate: (isPlaying: boolean) => void }) {
  const player = useVideoPlayer(uri, player => {
    player.loop = false;
  });

  useEffect(() => {
    if (shouldPlay) {
      player.play();
    } else {
      player.pause();
    }
  }, [shouldPlay, player]);

  useEffect(() => {
    const subscription = player.addListener('playingChange', (isPlaying) => {
      onPlaybackStatusUpdate(isPlaying.isPlaying);
    });
    return () => subscription.remove();
  }, [player, onPlaybackStatusUpdate]);

  return (
    <VideoView
      player={player}
      style={styles.modalVideo}
      contentFit="contain"
      allowsFullscreen
      allowsPictureInPicture
    />
  );
}
