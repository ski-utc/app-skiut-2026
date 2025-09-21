import React, { useEffect, useState, useCallback } from 'react';
import { View, Image, Text, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from "expo-image-manipulator";
import { useRoute } from '@react-navigation/native';
import { Colors } from '@/constants/GraphSettings';
import { LandPlot, Trash, Check, Hourglass, X } from 'lucide-react-native';
import Header from '../../components/header';
import { useUser } from '@/contexts/UserContext';
import BoutonRetour from '@/components/divers/boutonRetour';
import { apiPost, apiGet } from '@/constants/api/apiCalls';
import ErrorScreen from '@/components/pages/errorPage';
import Toast from 'react-native-toast-message';

export default function DefisInfos() {
  const route = useRoute();
  const { id, title, points, status } = route.params;

  const [proofImage, setProofImage] = useState('https://pixsector.com/cache/d69e58d4/avbfe351f753bcaa24ae2.png');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { setUser, user } = useUser();

  const [modifiedPicture, setModifiedPicture] = useState(false);
  const [challengeSent, setChallengeSent] = useState(false);
  const [dynamicStatus, setStatus] = useState(status);
  const [imageAspectRatio] = useState(1.0);

  const fetchProof = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiPost('challenges/getProofImage', { defiId:id });
      if (response.success) {
        setProofImage(response.image);
      } else {
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
    }
  }, [id, setUser]);

  useEffect(() => {
    if(status!=='empty') {
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
      const { uri, width } = result.assets[0];
      let compressQuality = 1;
  
      let compressedImage = await ImageManipulator.manipulateAsync(
        uri,
        [
          { resize: { width: width > 1080 ? 1080 : width } },
        ],
        { compress: compressQuality, format: ImageManipulator.SaveFormat.JPEG }
      );
  
      let fileInfo = await fetch(compressedImage.uri).then((res) => res.blob());  
      let maxFileSize = 1024*1024; 
      try {
        const getTailleMax = await apiGet("getMaxFileSize");
        if (getTailleMax.success) {
          maxFileSize = getTailleMax.data;
        }
      } catch (error : any) {
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
          [
            { resize: { width: width > 1080 ? 1080 : width } },
          ],
          { compress: compressQuality, format: ImageManipulator.SaveFormat.JPEG }
        );
  
        fileInfo = await fetch(compressedImage.uri).then((res) => res.blob());
      }
  
      if (fileInfo.size > 1 * 1024 * 1024) {
        Alert.alert('Erreur', 'Image trop lourde même après compression :(');
        return;
      }
      setModifiedPicture(true);
      setProofImage(compressedImage.uri);
    } catch (error : any) {
      setError('Erreur lors de la compression de l\'image :', error);
    }
  };

  const uploadImage = async (uri) => {
    try {
      const fileInfo = await fetch(uri).then((res) => res.blob());
  
      if (fileInfo.size > 1 * 1024 * 1024) {
        Alert.alert('Erreur', 'L\'image dépasse la taille maximale de 1 Mo.');
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
        } catch (error : any) {
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
    } catch (error : any) {
      setError(error.message || "Erreur lors du téléversement de l'image");
    }
  };
  

  const handleSendDefi = async () => {
    setLoading(true);

    try {
      await uploadImage(proofImage);
    } catch (error : any) {
        if (error.message === 'NoRefreshTokenError' || error.JWT_ERROR) {
            setUser(null);
        } else {
            setError(error.message || 'Erreur réseau ou serveur.');
        }
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveDefi = async () => {
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
              await apiPost('challenges/deleteproofImage', { defiId:id });
              if (response.success) {
                setProofImage('https://pixsector.com/cache/d69e58d4/avbfe351f753bcaa24ae2.png');
                setStatus('empty');
                route.params.onUpdate(id, 'empty');
                setChallengeSent(false);
                Toast.show({
                  type: 'success',
                  text1: 'Défi supprimé !',
                  text2: response.message,
                });
              } else {
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
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

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
              <Header />
              <View
                  style={{
                      width: '100%',
                      flex: 1,
                      backgroundColor: Colors.white,
                      justifyContent: 'center',
                      alignItems: 'center',
                  }}
              >
                  <ActivityIndicator size="large" color={Colors.gray} />
              </View>
          </View>
      );
  }

  return(
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <Header refreshFunction={undefined} disableRefresh={undefined} />
      <View style={{ width: '100%', paddingHorizontal: 20 }}>
        <BoutonRetour previousRoute="defisScreen" title={title} />
      </View>
      <View style={{ width: '100%', paddingHorizontal: 20, paddingBottom: 16 }}>
        <Text style={{ marginTop: 20, fontSize: 24, color: 'black', fontWeight: '700' }}>Points : {points}</Text>
      </View>
      <View style={{ width: '100%', height:'60%', marginTop: 10, justifyContent: 'center', alignItems:'center' }}>
      <TouchableOpacity
        onPress={handleImagePick}
        style={{ justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}
        disabled={challengeSent || status !== 'empty'} // Vérifie le statut
      >
        <Image
          source={{ uri: proofImage }}
          style={{ width: '90%', aspectRatio: imageAspectRatio, maxHeight: '100%', borderRadius: 25 }}
          resizeMode="contain"
          onError={() => setProofImage("https://www.shutterstock.com/image-vector/wifi-error-line-icon-vector-600nw-2043154736.jpg")}
        />
      </TouchableOpacity>
      </View>
      <View
        style={{
          position: 'absolute',
          width:'100%',
          bottom:0
        }}
      >
        {dynamicStatus!=='empty' ? (dynamicStatus!=='done' ? (
          <View style={{ width: '100%', alignItems: 'center' }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: 'grey',
                borderRadius: 8,
                padding: 10,
                marginBottom: 16,
                width: '90%',
                justifyContent: 'center',
              }}
            >
              {dynamicStatus!=='pending' ?
              <Text style={{ color: 'white', fontSize: 16, fontWeight: '600', marginRight: 10 }}>
                Défi refusé
              </Text>
              :
              <Text style={{ color: 'white', fontSize: 16, fontWeight: '600', marginRight: 10 }}>
                En attente de validation
              </Text>
              }

              {dynamicStatus!=='pending' ?
              <X color="white" size={20} />
              :
              <Hourglass color="white" size={20} />
              }
            </View>
            <TouchableOpacity
                style={{
                  width: '90%',
                  padding: 10,
                  backgroundColor: 'red',
                  borderRadius: 8,
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
              backgroundColor: 'green',
              borderRadius: 8,
              padding: 10,
              marginBottom: 16,
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
          )) : (
          <View style={{ width: '100%', alignItems: 'center' }}>
            <TouchableOpacity
              style={{
                width: '90%',
                padding: 10,
                backgroundColor: Colors.orange,
                borderRadius: 8,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
                opacity : modifiedPicture ? 1 : 0.4
              }}
              onPress={handleSendDefi}
              disabled={!modifiedPicture}
            >
              <Text style={{ color: 'white', fontSize: 16, fontWeight: '600', marginRight: 10 }}>
                Publier mon défi
              </Text>
              <LandPlot color="white" size={20} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  )
};