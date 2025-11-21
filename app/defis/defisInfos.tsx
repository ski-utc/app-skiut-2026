import { useEffect, useState, useCallback } from 'react';
import { View, Image, Text, ActivityIndicator, TouchableOpacity, Alert, Modal, StatusBar, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Video, ResizeMode } from 'expo-av';
import * as ImageManipulator from "expo-image-manipulator";
import { useRoute } from '@react-navigation/native';
import { LandPlot, Trash, Check, Hourglass, X, Upload, CloudOff, Maximize, Play, Pause, Image as ImageIcon, Video as VideoIcon } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { ImageViewer } from "react-native-image-zoom-viewer";

import { useUser } from '@/contexts/UserContext';
import BoutonRetour from '@/components/divers/boutonRetour';
import { apiPost, apiGet, apiDelete } from '@/constants/api/apiCalls';
import ErrorScreen from '@/components/pages/errorPage';
import { Colors, TextStyles } from '@/constants/GraphSettings';

import Header from '../../components/header';

export default function DefisInfos() {
  const route = useRoute();
  const { id, title, points, status } = route.params as { id: number, title: string, points: number, status: string };

  const [proofMedia, setProofMedia] = useState(null);
  const [mediaType, setMediaType] = useState('image'); // 'image' ou 'video'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { setUser, user } = useUser();

  const [modifiedMedia, setModifiedMedia] = useState(false);
  const [challengeSent, setChallengeSent] = useState(false);
  const [dynamicStatus, setStatus] = useState(status);
  const [networkError, setNetworkError] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  // const [videoRef, setVideoRef] = useState(null);
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
    try {
      const response = await apiGet(`challenges/proof-media/${id}`);
      if (response.success) {
        setProofMedia(response.media);
        setMediaType(response.mediaType || 'image');
      } else {
        setError(response.message || 'Une erreur est survenue lors de la récupération du média.');
      }
    } catch (error: any) {
      if (error.message === 'NoRefreshTokenError' || error.JWT_ERROR) {
        setUser(null);
      } else {
        setNetworkError(true);
        setError(error.message || 'Erreur réseau.');
      }
    } finally {
      setLoading(false);
    }
  }, [id, setUser]);

  useEffect(() => {
    if (status !== 'empty') {
      fetchProof();
    }
  }, [status, fetchProof]);

  const handleMediaPick = async (type: 'image' | 'video' | 'both' = 'both') => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.status !== 'granted') {
      Alert.alert('Permission requise', 'Nous avons besoin de votre permission pour accéder à votre galerie.');
      return;
    }

    let mediaTypes = ImagePicker.MediaTypeOptions.All;
    if (type === 'image') mediaTypes = ImagePicker.MediaTypeOptions.Images;
    else if (type === 'video') mediaTypes = ImagePicker.MediaTypeOptions.Videos;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes,
      quality: 1,
      videoQuality: ImagePicker.UIImagePickerControllerQualityType.Medium,
      videoMaxDuration: 60, // 60 secondes max
    });

    if (result.canceled) {
      return;
    }

    try {
      setIsCompressing(true);
      const asset = result.assets[0];
      const { uri, type: assetType, width } = asset;
      const isVideo = assetType?.includes('video') || uri.includes('.mp4') || uri.includes('.mov');

      setMediaType(isVideo ? 'video' : 'image');

      let maxFileSize = isVideo ? 15 * 1024 * 1024 : 5 * 1024 * 1024;
      try {
        const getTailleMax = await apiGet("challenges/max-file-size");
        if (getTailleMax.success && getTailleMax.data) {
          maxFileSize = isVideo
            ? (getTailleMax.data.maxVideoSize || 15 * 1024 * 1024)
            : (getTailleMax.data.maxImageSize || 5 * 1024 * 1024);
        }
      } catch (error: any) {
        if (error.message === 'NoRefreshTokenError' || error.JWT_ERROR) {
          setUser(null);
        } else {
          setError(error.message);
        }
      }

      if (isVideo) { // Can't implem video compression because it requires huge amount of resources from client side
        const fileInfo = await fetch(uri).then((res) => res.blob());
        if (fileInfo.size > maxFileSize) {
          Alert.alert('Erreur', 'Vidéo trop lourde. Veuillez choisir une vidéo plus courte ou de moindre qualité. La taille maximale est de ' + (maxFileSize / 1024 / 1024) + ' Mo.');
          setIsCompressing(false);
          return;
        }
        setModifiedMedia(true);
        setProofMedia(uri);
      } else {
        let compressQuality = 1;
        let compressedImage = await ImageManipulator.manipulateAsync(
          uri,
          [{ resize: { width: width > 1080 ? 1080 : width } }],
          { compress: compressQuality, format: ImageManipulator.SaveFormat.JPEG }
        );

        let fileInfo = await fetch(compressedImage.uri).then((res) => res.blob());

        while (fileInfo.size > maxFileSize && compressQuality > 0.1) {
          compressQuality -= 0.1;
          compressedImage = await ImageManipulator.manipulateAsync(
            uri,
            [{ resize: { width: width > 1080 ? 1080 : width } }],
            { compress: compressQuality, format: ImageManipulator.SaveFormat.JPEG }
          );
          fileInfo = await fetch(compressedImage.uri).then((res) => res.blob());
        }

        if (fileInfo.size > maxFileSize) {
          Alert.alert('Erreur', 'Image trop lourde même après compression');
          setIsCompressing(false);
          return;
        }
        setModifiedMedia(true);
        setProofMedia(compressedImage.uri);
      }
    } catch (error: any) {
      setError(`Erreur lors du traitement du média: ${error.message}`);
    } finally {
      setIsCompressing(false);
    }
  };

  const uploadMedia = async (uri: string) => {
    try {
      setIsUploading(true);
      const fileInfo = await fetch(uri).then((res) => res.blob());

      let maxSize = mediaType === 'video' ? 15 * 1024 * 1024 : 5 * 1024 * 1024;
      try {
        const getTailleMax = await apiGet("challenges/max-file-size");
        if (getTailleMax.success && getTailleMax.data) {
          maxSize = mediaType === 'video'
            ? (getTailleMax.data.maxVideoSize || 15 * 1024 * 1024)
            : (getTailleMax.data.maxImageSize || 5 * 1024 * 1024);
        }
      } catch {
        // Keep default values
      }

      if (fileInfo.size > maxSize) {
        Alert.alert('Erreur', `Le ${mediaType === 'video' ? 'vidéo' : 'image'} dépasse la taille maximale.`);
        setIsUploading(false);
        return;
      }

      const formData = new FormData();
      const extension = mediaType === 'video' ? '.mp4' : '.jpg';
      const mimeType = mediaType === 'video' ? 'video/mp4' : 'image/jpeg';

      formData.append('media', {
        uri,
        name: `challenge_${id}_room_${user?.room}_${Date.now()}${extension}`,
        type: mimeType,
      });
      formData.append('defiId', id);
      formData.append('mediaType', mediaType);

      const response = await apiPost('challenges/proof-media', formData, true);
      if (response.success) {
        setStatus('pending');
        try {
          if (route.params?.onUpdate) {
            route.params.onUpdate(id, 'pending');
          }
        } catch (error: any) {
          setError(error.message || 'Erreur lors de la mise à jour du défi');
        }
        Toast.show({
          type: 'success',
          text1: 'Défi posté !',
          text2: response.message,
        });
        setChallengeSent(true);
      } else if (response.pending) {
        setStatus('pending');
        try {
          if (route.params?.onUpdate) {
            route.params.onUpdate(id, 'pending');
          }
        } catch (error: any) {
          setError(error.message || 'Erreur lors de la mise à jour du défi');
        }
        Toast.show({
          type: 'success',
          text1: 'Requête sauvegardée',
          text2: response.message,
        });
        setChallengeSent(true);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Une erreur est survenue...',
          text2: response.message,
        });
      }
    } catch (error: any) {
      setError(error.message || "Erreur lors du téléversement du média");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSendDefi = async () => {
    try {
      await uploadMedia(proofMedia);
    } catch (error: any) {
      if (error.message === 'NoRefreshTokenError' || error.JWT_ERROR) {
        setUser(null);
      } else {
        setError(error.message || 'Erreur réseau ou serveur.');
      }
    }
  };

  const handleRemoveDefi = async () => {
    Alert.alert(
      'Confirmation',
      'Êtes-vous sûr de vouloir supprimer ce défi ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await apiDelete(`challenges/proof-media/${id}`);
              if (response.success) {
                setProofMedia(null);
                setMediaType('image');
                setStatus('empty');
                if (route.params?.onUpdate) {
                  route.params.onUpdate(id, 'empty');
                }
                setChallengeSent(false);
                Toast.show({
                  type: 'success',
                  text1: 'Défi supprimé !',
                  text2: response.message,
                });
              } else if (response.pending) {
                setProofMedia(null);
                setMediaType('image');
                setStatus('empty');
                if (route.params?.onUpdate) {
                  route.params.onUpdate(id, 'empty');
                }
                setChallengeSent(false);
                Toast.show({
                  type: 'info',
                  text1: 'Requête sauvegardée',
                  text2: response.message,
                });
              } else {
                setError(response.message || 'Une erreur est survenue.');
              }
            } catch (error: any) {
              if (error.message === 'NoRefreshTokenError' || error.JWT_ERROR) {
                setUser(null);
              } else {
                setError(error.message || 'Erreur réseau.');
              }
            } finally {
              setLoading(false);
            }
          },
        },
      ],
      { cancelable: true }
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
          onPress={status === 'empty' ? handleMediaPick : toggleModal}
          style={styles.mediaTouchable}
          disabled={(challengeSent && status === 'empty') || isCompressing || isUploading}
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
                <Video
                  source={{ uri: proofMedia }}
                  style={styles.mediaPreview}
                  resizeMode={ResizeMode.COVER}
                  shouldPlay={isPlaying}
                  isLooping={false}
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
                {mediaType === 'video' ? (
                  <VideoIcon size={14} color={Colors.white} />
                ) : (
                  <ImageIcon size={14} color={Colors.white} />
                )}
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
              {status !== 'empty' && !isCompressing && !isUploading && (
                <View style={styles.fullscreenHintContainer}>
                  <Maximize size={16} color={Colors.white} />
                  <Text style={styles.fullscreenHintText}>Appuyez pour agrandir</Text>
                </View>
              )}
              {(isCompressing || isUploading) && (
                <View style={styles.uploadOverlay}>
                  <ActivityIndicator size="large" color={Colors.white} />
                  <Text style={styles.uploadOverlayText}>
                    {isCompressing ? 'Traitement...' : 'Upload en cours...'}
                  </Text>
                </View>
              )}
            </View>
          ) : (isCompressing || isUploading) ? (
            <View style={styles.processingContainer}>
              <ActivityIndicator size="large" color={Colors.primaryBorder} />
              <Text style={styles.processingText}>
                {isCompressing ? 'Compression...' : 'Upload en cours...'}
              </Text>
            </View>
          ) : (
            <View style={styles.emptyMediaContainer}>
              <Upload size={80} color={Colors.primary} />
              <Text style={styles.emptyMediaTitle}>Ajouter un média</Text>
              <Text style={styles.emptyMediaSubtitle}>Photo ou vidéo (max 60s)</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
      <View style={styles.bottomActions}>
        {dynamicStatus !== 'empty' ? (
          dynamicStatus !== 'done' ? (
            <>
              <View style={styles.statusBadgeRejected}>
                <Text style={styles.statusBadgeText}>
                  {dynamicStatus !== 'pending' ? 'Défi refusé' : 'En attente de validation'}
                </Text>
                {dynamicStatus !== 'pending' ? <X color="white" size={20} /> : <Hourglass color="white" size={20} />}
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
                <Video
                  source={{ uri: proofMedia }}
                  style={styles.modalVideo}
                  resizeMode={ResizeMode.CONTAIN}
                  shouldPlay={isFullscreenVideoPlaying}
                  isLooping={false}
                  useNativeControls={true}
                  onPlaybackStatusUpdate={(status) => {
                    if (status.isPlaying) {
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
    bottom: 0,
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
    backgroundColor: Colors.primaryBorder,
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
  },
  modalVideo: {
    height: '80%',
    width: '100%',
  },
  modalVideoContainer: {
    alignItems: 'center',
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
  },
  uploadOverlayText: {
    ...TextStyles.body,
    color: Colors.white,
    fontWeight: '600',
    marginTop: 12,
  },
});
