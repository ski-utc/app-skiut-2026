import React, { useEffect, useState, useCallback } from 'react';
import { View, Image, Text, ActivityIndicator, TouchableOpacity, Alert, Modal, StatusBar } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Video, ResizeMode } from 'expo-av';
import * as ImageManipulator from "expo-image-manipulator";
import { useRoute } from '@react-navigation/native';
import { Colors, TextStyles } from '@/constants/GraphSettings';
import { LandPlot, Trash, Check, Hourglass, X, Upload, CloudOff, Maximize, Play, Pause, Image as ImageIcon, Video as VideoIcon } from 'lucide-react-native';
import Header from '../../components/header';
import { useUser } from '@/contexts/UserContext';
import BoutonRetour from '@/components/divers/boutonRetour';
import { apiPost, apiGet, apiDelete } from '@/constants/api/apiCalls';
import ErrorScreen from '@/components/pages/errorPage';
import Toast from 'react-native-toast-message';
import ImageViewer from "react-native-image-zoom-viewer";

export default function DefisInfos() {
  const route = useRoute();
  const { id, title, points, status } = route.params;

  const [proofMedia, setProofMedia] = useState(null);
  const [mediaType, setMediaType] = useState('image'); // 'image' ou 'video'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { setUser, user } = useUser();

  const [modifiedMedia, setModifiedMedia] = useState(false);
  const [challengeSent, setChallengeSent] = useState(false);
  const [dynamicStatus, setStatus] = useState(status);
  const [mediaAspectRatio] = useState(1.0);
  const [networkError, setNetworkError] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoRef, setVideoRef] = useState(null);
  const [isFullscreenVideoPlaying, setIsFullscreenVideoPlaying] = useState(false);

  const toggleModal = () => {
    if (!isModalVisible) {
      // Ouvrir le modal: mettre en pause la vidéo en arrière-plan
      setIsPlaying(false);
      setIsFullscreenVideoPlaying(false);
    } else {
      // Fermer le modal: restaurer l'état
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
      const { uri, type: assetType, width, height } = asset;
      const isVideo = assetType?.includes('video') || uri.includes('.mp4') || uri.includes('.mov');

      setMediaType(isVideo ? 'video' : 'image');

      // Récupérer la taille max
      let maxFileSize = 5 * 1024 * 1024; // 5MB par défaut (plus pour les vidéos)
      try {
        const getTailleMax = await apiGet("challenges/max-file-size");
        if (getTailleMax.success) {
          maxFileSize = getTailleMax.data;
        }
      } catch (error: any) {
        if (error.message === 'NoRefreshTokenError' || error.JWT_ERROR) {
          setUser(null);
        } else {
          setError(error.message);
        }
      }

      if (isVideo) {
        // Pour les vidéos, vérifier directement la taille
        const fileInfo = await fetch(uri).then((res) => res.blob());
        if (fileInfo.size > maxFileSize) {
          Alert.alert('Erreur', 'Vidéo trop lourde. Veuillez choisir une vidéo plus courte ou de moindre qualité.');
          setIsCompressing(false);
          return;
        }
        setModifiedMedia(true);
        setProofMedia(uri);
      } else {
        // Pour les images, compression comme avant
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
      setError('Erreur lors du traitement du média:', error);
    } finally {
      setIsCompressing(false);
    }
  };

  const uploadMedia = async (uri) => {
    try {
      setIsUploading(true);
      const fileInfo = await fetch(uri).then((res) => res.blob());

      // Taille max adaptée au type de média
      const maxSize = mediaType === 'video' ? 10 * 1024 * 1024 : 5 * 1024 * 1024; // 10MB vidéo, 5MB image
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
    return (
      <ErrorScreen error={error} />
    );
  }

  if (loading) {
    return (
      <View style={{
        flex: 1,
        backgroundColor: Colors.white,
      }}>
        <Header refreshFunction={undefined} disableRefresh={true} />
        <View style={{
          width: '100%',
          flex: 1,
          backgroundColor: Colors.white,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <ActivityIndicator size="large" color={Colors.primaryBorder} />
          <Text style={[TextStyles.body, { color: Colors.muted, marginTop: 16 }]}>
            Chargement...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.white }}>
      <Header refreshFunction={undefined} disableRefresh={undefined} />
      <View style={{ width: '100%', paddingHorizontal: 20, paddingRight: 30 }}>
        <BoutonRetour previousRoute="defisScreen" title={title} />
      </View>
      <View style={{ width: '100%', paddingHorizontal: 20 }}>
        <Text style={{ ...TextStyles.h2Bold, color: Colors.primaryBorder }}>
          Points : {points}
        </Text>
      </View>

      <View style={{ width: '100%', height: '60%', justifyContent: 'center', alignItems: 'center' }}>
        <TouchableOpacity
          onPress={status === 'empty' ? handleMediaPick : toggleModal}
          style={{ justifyContent: 'center', alignItems: 'center', width: '100%', height: '80%', position: 'relative' }}
          disabled={(challengeSent && status === 'empty') || isCompressing || isUploading}
          activeOpacity={0.8}
        >
          {networkError ? (
            <View style={{
              width: '90%',
              aspectRatio: 1,
              borderWidth: 2,
              borderColor: Colors.primaryBorder,
              borderRadius: 20,
              justifyContent: 'center',
              alignItems: 'center',
              padding: 40,
            }}>
              <CloudOff size={80} color={Colors.muted} />
              <Text style={{
                ...TextStyles.body,
                color: Colors.muted,
                marginTop: 16,
                textAlign: 'center',
                fontWeight: '600',
              }}>
                Problème de connexion
              </Text>
              <Text style={{
                ...TextStyles.small,
                color: Colors.muted,
                marginTop: 8,
                textAlign: 'center',
              }}>
                Impossible de charger l'image
              </Text>
            </View>
          ) : proofMedia ? (
            <View style={{ width: '100%', height: '100%', position: 'relative', justifyContent: 'center', alignItems: 'center', marginTop: 32 }}>
              {mediaType === 'video' ? (
                <View style={{ width: '100%', aspectRatio: mediaAspectRatio, maxHeight: '100%', borderRadius: 25, overflow: 'hidden' }}>
                  <Video
                    ref={setVideoRef}
                    source={{ uri: proofMedia }}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode={ResizeMode.CONTAIN}
                    shouldPlay={isPlaying}
                    isLooping={false}
                    onError={() => setNetworkError(true)}
                  />
                  {!isPlaying && (
                    <TouchableOpacity
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: [{ translateX: -30 }, { translateY: -30 }],
                        width: 60,
                        height: 60,
                        borderRadius: 30,
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                      onPress={() => setIsPlaying(true)}
                    >
                      <Play size={28} color={Colors.white} />
                    </TouchableOpacity>
                  )}
                  {isPlaying && (
                    <TouchableOpacity
                      style={{
                        position: 'absolute',
                        top: 20,
                        right: 20,
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                      onPress={() => setIsPlaying(false)}
                    >
                      <Pause size={20} color={Colors.white} />
                    </TouchableOpacity>
                  )}
                </View>
              ) : (
                <Image
                  source={{ uri: proofMedia }}
                  style={{ width: '100%', aspectRatio: mediaAspectRatio, maxHeight: '100%', borderRadius: 25 }}
                  resizeMode="contain"
                  onError={() => setNetworkError(true)}
                />
              )}

              {/* Indicateur de type de média */}
              <View style={{
                position: 'absolute',
                top: 20,
                left: 20,
                backgroundColor: 'rgba(0,0,0,0.7)',
                paddingVertical: 4,
                paddingHorizontal: 8,
                borderRadius: 6,
                flexDirection: 'row',
                alignItems: 'center',
              }}>
                {mediaType === 'video' ? (
                  <VideoIcon size={14} color={Colors.white} />
                ) : (
                  <ImageIcon size={14} color={Colors.white} />
                )}
                <Text style={{
                  ...TextStyles.small,
                  color: Colors.white,
                  marginLeft: 4,
                  fontWeight: '600',
                }}>
                  {mediaType === 'video' ? 'Vidéo' : 'Image'}
                </Text>
              </View>

              {status !== 'empty' && !isCompressing && !isUploading && (
                <View style={{
                  position: 'absolute',
                  bottom: 20,
                  left: 0,
                  right: 0,
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 8,
                  marginHorizontal: 20,
                }}>
                  <Maximize size={16} color={Colors.white} />
                  <Text style={{
                    ...TextStyles.small,
                    color: Colors.white,
                    textAlign: 'center',
                    fontWeight: '500',
                    marginLeft: 6,
                  }}>Appuyez pour agrandir</Text>
                </View>
              )}
              {(isCompressing || isUploading) && (
                <View style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(0,0,0,0.6)',
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: 25,
                }}>
                  <ActivityIndicator size="large" color={Colors.white} />
                  <Text style={{
                    ...TextStyles.body,
                    color: Colors.white,
                    marginTop: 12,
                    fontWeight: '600',
                  }}>
                    {isCompressing ? 'Traitement...' : 'Upload en cours...'}
                  </Text>
                </View>
              )}
            </View>
          ) : (isCompressing || isUploading) ? (
            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator size="large" color={Colors.primaryBorder} />
              <Text style={{
                ...TextStyles.body,
                color: Colors.muted,
                marginTop: 12,
              }}>
                {isCompressing ? 'Compression...' : 'Upload en cours...'}
              </Text>
            </View>
          ) : (
            <View style={{
              width: '90%',
              aspectRatio: 1,
              borderWidth: 2,
              borderColor: Colors.primaryBorder,
              borderRadius: 20,
              borderStyle: 'dashed',
              justifyContent: 'center',
              alignItems: 'center',
              padding: 40,
            }}>
              <Upload size={80} color={Colors.primary} />
              <Text style={{
                ...TextStyles.h3Bold,
                color: Colors.primaryBorder,
                marginTop: 16,
                textAlign: 'center',
              }}>
                Ajouter un média
              </Text>
              <Text style={{
                ...TextStyles.body,
                color: Colors.muted,
                marginTop: 8,
                textAlign: 'center',
              }}>
                Photo ou vidéo (max 60s)
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={{ position: 'absolute', width: '100%', bottom: 0 }}>
        {dynamicStatus !== 'empty' ? (
          dynamicStatus !== 'done' ? (
            <View style={{ width: '100%', alignItems: 'center' }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: Colors.muted,
                  borderRadius: 8,
                  padding: 10,
                  marginBottom: 8,
                  width: '90%',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ color: 'white', fontSize: 16, fontWeight: '600', marginRight: 10 }}>
                  {dynamicStatus !== 'pending' ? 'Défi refusé' : 'En attente de validation'}
                </Text>
                {dynamicStatus !== 'pending' ? <X color="white" size={20} /> : <Hourglass color="white" size={20} />}
              </View>
              <TouchableOpacity
                style={{
                  width: '90%',
                  backgroundColor: Colors.error,
                  borderRadius: 10,
                  padding: 12,
                  marginBottom: 10,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onPress={handleRemoveDefi}
              >
                <Text style={{ color: 'white', fontSize: 16, fontWeight: '600', marginRight: 10 }}>
                  Supprimer
                </Text>
                <Trash color="white" size={20} />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ width: '100%', alignItems: 'center' }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: Colors.success,
                  borderRadius: 10,
                  padding: 12,
                  marginBottom: 10,
                  width: '90%',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ color: 'white', fontSize: 16, fontWeight: '600', marginRight: 10 }}>
                  Défi validé
                </Text>
                <Check color="white" size={20} />
              </View>
            </View>
          )
        ) : (
          <View style={{ width: '100%', alignItems: 'center' }}>
            <TouchableOpacity
              style={{
                paddingVertical: 16,
                paddingHorizontal: 20,
                backgroundColor: Colors.primary,
                borderRadius: 10,
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'row',
                width: '90%',
                marginBottom: 20,
                gap: 10,
                shadowColor: Colors.primaryBorder,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 3,
                elevation: 3,
                opacity: (modifiedMedia && !isUploading && !isCompressing) ? 1 : 0.4
              }}
              onPress={handleSendDefi}
              disabled={!modifiedMedia || isUploading || isCompressing}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                <Text style={{ ...TextStyles.button, color: Colors.white }}>Publier mon défi</Text>
                <LandPlot color="white" size={20} />
              </View>
            </TouchableOpacity>
          </View>
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
          <View style={{
            flex: 1,
            backgroundColor: Colors.primaryBorder,
            position: 'relative',
          }}>
            <TouchableOpacity
              style={{
                position: 'absolute',
                top: 50,
                right: 20,
                zIndex: 1000,
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: 'rgba(0,0,0,0.6)',
                justifyContent: 'center',
                alignItems: 'center',
              }}
              onPress={toggleModal}
              activeOpacity={0.7}
            >
              <X size={24} color={Colors.white} />
            </TouchableOpacity>

            {mediaType === 'video' ? (
              <View style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <Video
                  source={{ uri: proofMedia }}
                  style={{
                    width: '100%',
                    height: '80%',
                  }}
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
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: [{ translateX: -30 }, { translateY: -10 }],
                      width: 60,
                      height: 60,
                      borderRadius: 30,
                      backgroundColor: 'rgba(0,0,0,0.7)',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
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
