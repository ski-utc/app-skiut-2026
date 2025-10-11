import React, { useEffect, useState, useCallback } from 'react';
import { View, Image, Text, ActivityIndicator, TouchableOpacity, Alert, Modal, StatusBar } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from "expo-image-manipulator";
import { useRoute } from '@react-navigation/native';
import { Colors, TextStyles } from '@/constants/GraphSettings';
import { LandPlot, Trash, Check, Hourglass, X, Upload, CloudOff, Maximize } from 'lucide-react-native';
import Header from '../../components/header';
import { useUser } from '@/contexts/UserContext';
import BoutonRetour from '@/components/divers/boutonRetour';
import { apiPost, apiGet } from '@/constants/api/apiCalls';
import ErrorScreen from '@/components/pages/errorPage';
import Toast from 'react-native-toast-message';
import ImageViewer from "react-native-image-zoom-viewer";

export default function DefisInfos() {
  const route = useRoute();
  const { id, title, points, status } = route.params;

  const [proofImage, setProofImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { setUser, user } = useUser();

  const [modifiedPicture, setModifiedPicture] = useState(false);
  const [challengeSent, setChallengeSent] = useState(false);
  const [dynamicStatus, setStatus] = useState(status);
  const [imageAspectRatio] = useState(1.0);
  const [networkError, setNetworkError] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };

  const fetchProof = useCallback(async () => {
    setLoading(true);
    setNetworkError(false);
    try {
      const response = await apiPost('challenges/getProofImage', { defiId: id });
      if (response.success) {
        setProofImage(response.image);
      } else {
        setError(response.message || 'Une erreur est survenue lors de la récupération des matchs.');
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

  const handleImagePick = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.status !== 'granted') {
      Alert.alert('Permission requise', 'Nous avons besoin de votre permission pour accéder à votre galerie.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (result.canceled) {
      return;
    }

    try {
      setIsCompressing(true);
      const { uri, width } = result.assets[0];
      let compressQuality = 1;

      let compressedImage = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: width > 1080 ? 1080 : width } }],
        { compress: compressQuality, format: ImageManipulator.SaveFormat.JPEG }
      );

      let fileInfo = await fetch(compressedImage.uri).then((res) => res.blob());
      let maxFileSize = 1024 * 1024;
      try {
        const getTailleMax = await apiGet("getMaxFileSize");
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

      while (fileInfo.size > maxFileSize && compressQuality > 0.1) {
        compressQuality -= 0.1;
        compressedImage = await ImageManipulator.manipulateAsync(
          uri,
          [{ resize: { width: width > 1080 ? 1080 : width } }],
          { compress: compressQuality, format: ImageManipulator.SaveFormat.JPEG }
        );
        fileInfo = await fetch(compressedImage.uri).then((res) => res.blob());
      }

      if (fileInfo.size > 1 * 1024 * 1024) {
        Alert.alert('Erreur', 'Image trop lourde même après compression :(');
        setIsCompressing(false);
        return;
      }
      setModifiedPicture(true);
      setProofImage(compressedImage.uri);
    } catch (error: any) {
      setError('Erreur lors de la compression de l\'image :', error);
    } finally {
      setIsCompressing(false);
    }
  };

  const uploadImage = async (uri) => {
    try {
      setIsUploading(true);
      const fileInfo = await fetch(uri).then((res) => res.blob());
      if (fileInfo.size > 1 * 1024 * 1024) {
        Alert.alert('Erreur', 'L\'image dépasse la taille maximale de 1 Mo.');
        setIsUploading(false);
        return;
      }

      const formData = new FormData();
      formData.append('image', {
        uri,
        name: `challenge_${id}_room_${user?.room}.jpg`,
        type: 'image/jpeg',
      });
      formData.append('defiId', id);

      const response = await apiPost('challenges/uploadProofImage', formData, true);
      if (response.success) {
        setStatus('pending');
        try {
          route.params.onUpdate(id, 'pending');
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
      setError(error.message || "Erreur lors du téléversement de l'image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSendDefi = async () => {
    try {
      await uploadImage(proofImage);
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
              const response = await apiPost('challenges/deleteproofImage', { defiId: id });
              if (response.success) {
                setProofImage(null);
                setStatus('empty');
                route.params.onUpdate(id, 'empty');
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
      <View style={{ width: '100%', paddingHorizontal: 20 }}>
        <BoutonRetour previousRoute="defisScreen" title={title} />
      </View>
      <View style={{ width: '100%', paddingHorizontal: 20 }}>
        <Text style={{ ...TextStyles.h2Bold, color: Colors.primaryBorder }}>
          Points : {points}
        </Text>
      </View>

      <View style={{ width: '100%', height: '60%', justifyContent: 'center', alignItems: 'center' }}>
        <TouchableOpacity
          onPress={status === 'empty' ? handleImagePick : toggleModal}
          style={{ justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%', position: 'relative' }}
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
          ) : proofImage ? (
            <View style={{ width: '90%', height: '100%', position: 'relative', justifyContent: 'center', alignItems: 'center' }}>
              <Image
                source={{ uri: proofImage }}
                style={{ width: '100%', aspectRatio: imageAspectRatio, maxHeight: '100%', borderRadius: 25 }}
                resizeMode="contain"
                onError={() => setNetworkError(true)}
              />
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
                    {isCompressing ? 'Compression...' : 'Upload en cours...'}
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
                Ajouter une photo
              </Text>
              <Text style={{
                ...TextStyles.body,
                color: Colors.muted,
                marginTop: 8,
                textAlign: 'center',
              }}>
                Appuyez pour sélectionner un média
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
                opacity: (modifiedPicture && !isUploading && !isCompressing) ? 1 : 0.4
              }}
              onPress={handleSendDefi}
              disabled={!modifiedPicture || isUploading || isCompressing}
            >
              <Text style={{ ...TextStyles.button, color: Colors.white }}> Publier mon défi </Text> <LandPlot color="white" size={20} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {proofImage && (
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

            <ImageViewer
              imageUrls={[{ url: proofImage }]}
              index={0}
              backgroundColor="transparent"
              enableSwipeDown={true}
              onSwipeDown={toggleModal}
            />
          </View>
        </Modal>
      )}
    </View>
  );
}