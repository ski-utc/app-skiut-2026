import React, { useEffect, useState } from 'react';
import { View, Image, Text, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from "expo-image-manipulator";
import { useRoute } from '@react-navigation/native';
import { Colors, Fonts } from '@/constants/GraphSettings';
import { LandPlot, Trash, Check, Hourglass } from 'lucide-react-native';
import Header from '../../components/header';
import { useUser } from '@/contexts/UserContext';
import { useNavigation } from '@react-navigation/native';
import BoutonRetour from '@/components/divers/boutonRetour';
import { apiPost } from '@/constants/api/apiCalls';
import ErrorScreen from '@/components/pages/errorPage';
import Banner from '@/components/divers/bannièreReponse';

export default function DefisInfos() {
  const route = useRoute();
  const { id, title, points, status } = route.params;

  const [proofImage, setProofImage] = useState('https://cdn.icon-icons.com/icons2/3812/PNG/512/upload_file_icon_233420.png');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { setUser, user } = useUser();
  const navigation = useNavigation();

  const [modifiedPicture, setModifiedPicture] = useState(false);
  const [dynamicStatus, setStatus] = useState(status);
  const [imageAspectRatio, setImageAspectRatio] = useState(1.0);
  const [responseMessage, setResponseMessage] = useState('');
  const [responseSuccess, setResponseSuccess] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  const fetchProof = async () => {
    setLoading(true);
    try {
      const response = await apiPost('challenges/getProofImage', { defiId:id });
      if (response.success) {
        setProofImage(response.image);
      } else {
        setError(response.message || 'Une erreur est survenue lors de la récupération des matchs.');
      }
    } catch (error) {
      if (error.message === 'NoRefreshTokenError' || error.JWT_ERROR) {
        setUser(null);
      } else {
        setError(error.message || 'Erreur réseau.');
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if(status!='empty') {
      fetchProof();
    }
  }, [status]);

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
      const { uri, width, height } = result.assets[0];
      setImageAspectRatio(width / height);
      let compressQuality = 1;

      let compressedImage = await ImageManipulator.manipulateAsync(
        uri,
        [
          { resize: { width: width > 1080 ? 1080 : width } },
        ],
        { compress: compressQuality, format: ImageManipulator.SaveFormat.JPEG },
      );

      const fileInfo = await fetch(compressedImage.uri).then((res) => res.blob());
      while (fileInfo.size > 1 * 1024 * 1024 && compressQuality > 0.1) {
        compressQuality -= 0.1;
        compressedImage = await ImageManipulator.manipulateAsync(
          uri,
          [
            { resize: { width: width > 1080 ? 1080 : width } },
          ],
          { compress: compressQuality, format: ImageManipulator.SaveFormat.JPEG },
        );
      }

      if (fileInfo.size > 1 * 1024 * 1024) {
        Alert.alert('Erreur', 'Image trop lourde :(');
        return;
      }
      setModifiedPicture(true);
      setProofImage(compressedImage.uri);
    } catch (error) {
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
      formData.append('defiId',id)

      const response = await apiPost('challenges/uploadProofImage', formData, true);
      if(response.success){
        setStatus('waiting');
        route.params.onUpdate(id, 'waiting');
      }
      setResponseMessage(response.message);
      setResponseSuccess(response.success);
      return response
    } catch (error) {
      setError(error.message || "Erreur lors du téléversement de l'image");
    }
  };

  const handleSendDefi = async () => {
    setLoading(true);

    try {
      const response = await uploadImage(proofImage);
    } catch (error) {
        if (error.message === 'NoRefreshTokenError' || error.JWT_ERROR) {
            setUser(null);
        } else {
            setError(error.message || 'Erreur réseau ou serveur.');
        }
    } finally {
      setShowBanner(true);
      setLoading(false);
      setTimeout(() => setShowBanner(false), 5000);
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
              const response = await apiPost('challenges/deleteproofImage', { defiId:id });
              setResponseMessage(response.message);
              setResponseSuccess(response.success);
              if (response.success) {
                setProofImage('https://cdn.icon-icons.com/icons2/3812/PNG/512/upload_file_icon_233420.png');
                setStatus('empty');
              } else {
                setError(response.message || 'Une erreur est survenue lors de la récupération des matchs.');
              }
            } catch (error) {
              if (error.message === 'NoRefreshTokenError' || error.JWT_ERROR) {
                setUser(null);
              } else {
                setError(error.message || 'Erreur réseau.');
              }
            } finally {
              setShowBanner(true);
              setLoading(false);
              setTimeout(() => setShowBanner(false), 5000);
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
      <Banner message={responseMessage} success={responseSuccess} show={showBanner}/>
      <Header refreshFunction={undefined} disableRefresh={undefined} />
      <View style={{ width: '100%', paddingHorizontal: 20 }}>
        <BoutonRetour previousRoute="defisScreen" title={title} />
      </View>
      <View style={{ width: '100%', paddingHorizontal: 20, paddingBottom: 16 }}>
        <Text style={{ marginTop: 20, fontSize: 24, color: 'black', fontWeight: '700' }}>Points : {points}</Text>
      </View>
      <View style={{ width: '100%', height:'60%', marginTop: 10, justifyContent: 'center', alignItems:'center' }}>
          {
            status == 'empty' ?
            <TouchableOpacity onPress={handleImagePick} style={{ justifyContent: 'center', alignItems:'center', width:'100%', height:'100%'}} disabled={responseMessage!=''}>
              <Image
                  source={{ uri: proofImage }} 
                  style={{ width: '90%', aspectRatio:imageAspectRatio, maxHeight:'100%', borderRadius: 25 }}
                  resizeMode="contain"
                  onError={() => setProofImage("https://www.shutterstock.com/image-vector/wifi-error-line-icon-vector-600nw-2043154736.jpg")}
              />
            </TouchableOpacity>
            :
            <Image
                source={{ uri: `${proofImage}?timestamp=${new Date().getTime()}` }} 
                style={{ width: '90%', aspectRatio:imageAspectRatio, maxHeight:'100%', borderRadius: 25 }}
                resizeMode="contain"
                onError={() => setProofImage("https://www.shutterstock.com/image-vector/wifi-error-line-icon-vector-600nw-2043154736.jpg")}
            />
          }
      </View>
      <View
        style={{
          position: 'absolute',
          width:'100%',
          bottom:0
        }}
      >
        {dynamicStatus!='empty' ? (dynamicStatus!='done' ? (
          <View style={{ width: '100%', alignItems: 'center' }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: 'blue',
                borderRadius: 8,
                padding: 10,
                marginBottom: 16,
                width: '90%',
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: 'white', fontSize: 16, fontWeight: '600', marginRight: 10 }}>
                Défi en attente
              </Text>
              <Hourglass color="white" size={20} />
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