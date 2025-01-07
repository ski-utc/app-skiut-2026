import React, { useEffect, useState } from 'react';
import { View, Image, Text, ActivityIndicator, TouchableOpacity, Alert, TextInput, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from "expo-image-manipulator";
import { Colors, Fonts } from '@/constants/GraphSettings';
import Header from '../../components/header';
import { useUser } from '@/contexts/UserContext';
import { useNavigation } from '@react-navigation/native';
import BoutonRetour from '@/components/divers/boutonRetour';
import { apiPost, apiGet } from '@/constants/api/apiCalls';
import ErrorScreen from '@/components/pages/errorPage';
import Banner from '@/components/divers/bannièreReponse';

export default function SkinderProfil() {
  const [profile, setProfile] = useState({
    id: null,
    nom: '',
    description: '',
    passions: ['', '', '', '', '', ''],
  });
  const [profileImage, setProfileImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { setUser } = useUser();
  const navigation = useNavigation();
  const [modifiedPicture, setModifiedPicture] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');
  const [responseSuccess, setResponseSuccess] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  const fetchProfil = async () => {
    setLoading(true);
    try {
      const response = await apiGet('getMyProfilSkinder');
      if (response.success) {
        const passions = Array.isArray(response.data.passions)
          ? response.data.passions
          : JSON.parse(response.data.passions || '[]');
        setProfile({
          id: response.data.id,
          nom: response.data.name,
          description: response.data.description,
          passions: [...Array(6)].map((_, i) => passions[i] || ''),
        });
        setProfileImage(response.data.image || "https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png");
      } else {
        setError(response.message || "Erreur lors de la récupération du profil.");
      }
    } catch (error) {
      if (error.message === 'NoRefreshTokenError' || error.JWT_ERROR) {
        setUser(null);
      } else {
        setError(error.message || "Erreur réseau.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfil();
  }, []);

  const handleImagePick = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.status !== 'granted') {
      Alert.alert('Permission requise', 'Nous avons besoin de votre permission pour accéder à votre galerie.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], 
      quality: 1,
    });

    if (result.canceled) {
      return;
    }

    try {
      const { uri, width, height } = result.assets[0];
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
      setProfileImage(compressedImage.uri);
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
        name: `room_${profile.id}.jpg`,
        type: 'image/jpeg',
      });

      const response = await apiPost('uploadRoomImage', formData, true);
      return response;
    } catch (error) {
      setError(error.message || "Erreur lors du téléversement de l'image");
    }
  };

  const handleSendData = async () => {
    setLoading(true);

    try {
      const filteredPassions = profile.passions.filter(p => p.trim() !== '');
      const response = await apiPost('modifyProfilSkinder', {'description':profile.description, 'passions':filteredPassions});
      if(modifiedPicture){
        const response2 = await uploadImage(profileImage);
        setResponseMessage(response.message +' '+ response2.message);
        setResponseSuccess(response.success && response2.success);
        if (response.success && response2.success) {
          fetchProfil();
        } else {
          setError(response.message || 'Erreur lors de la sauvegarde des données.');
        }
      } else {
        setResponseMessage(response.message);
        setResponseSuccess(response.success);
        if (response.success) {
          fetchProfil();
        } else {
          setError(response.message || 'Erreur lors de la sauvegarde des données.');
        }
      }
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
  <KeyboardAvoidingView
    style={{ flex: 1 }}
    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
  >
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
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
        <Banner message={responseMessage} success={responseSuccess} show={showBanner}/>
        <Header />
        <View
          style={{
            width: '100%',
            backgroundColor: Colors.white,
            flex: 1,
            paddingHorizontal: 20,
            paddingBottom: 16,
          }}
        >
          <BoutonRetour previousRoute={'profilNavigator'} title={'Modifier mon profil'} />
          <View style={{ alignItems: 'center', marginVertical: 5 }}>
            <TouchableOpacity onPress={handleImagePick}>
              <Image
                  source={{ uri: `${profileImage}?timestamp=${new Date().getTime()}` }} 
                  style={{ width: '90%', aspectRatio: '1/1', borderRadius: 25, borderWidth: 1, borderColor: Colors.gray }}
                  resizeMode="cover"
              />
            </TouchableOpacity>
          </View>
          <Text style={{ marginHorizontal: 20, marginBottom: 4, fontSize: 18, fontWeight: '600' }}>{profile.nom}</Text>
          <TextInput
            style={{
              fontSize: 14,
              fontFamily: Fonts.Inter.Basic,
              color: Colors.black,
              borderWidth: 1,
              borderColor: Colors.gray,
              borderRadius: 8,
              padding: 10,
              marginHorizontal: 20,
              marginBottom: 10,
            }}
            placeholder="Ajoutez une description"
            placeholderTextColor="#969696"
            multiline={true}
            numberOfLines={2}
            value={profile.description}
            onChangeText={(text) => setProfile({ ...profile, description: text })}
          />
          <Text style={{ marginHorizontal: 20, fontSize: 18, fontWeight: '600' }}>Passions</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginHorizontal: 20, marginTop: 10 }}>
            {profile.passions.map((passion, index) => (
              <TextInput
                key={index}
                style={{
                  width: '30%',
                  padding: 10,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: Colors.orange,
                  fontFamily: Fonts.Inter.Basic,
                  marginBottom: 10,
                  fontSize: 14,
                }}
                placeholder={`Passion ${index + 1}`}
                placeholderTextColor="#969696"
                value={passion}
                onChangeText={(text) => {
                  if (text.length <= 13) {
                    const newPassions = [...profile.passions];
                    newPassions[index] = text;
                    setProfile({ ...profile, passions: newPassions });
                  }
                }}
              />
            ))}
          </View>
          <View
              style={{
                  flexDirection: 'row',
                  justifyContent: 'space-around',
                  alignItems: 'center',
                  marginVertical: 8
              }}
          >
              <TouchableOpacity
                  onPress={()=>navigation.goBack()}
                  style={{
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      backgroundColor: Colors.customGray,
                      borderColor: Colors.gray,
                      borderWidth: 1,
                      borderRadius: 8,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
              >
                  <Text
                      style={{
                          color: Colors.black,
                          fontSize: 18,
                          fontWeight: '600',
                      }}
                  >
                      Abandonner
                  </Text>
              </TouchableOpacity>
              <TouchableOpacity
                  onPress={handleSendData}
                  style={{
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      backgroundColor: Colors.orange,
                      borderRadius: 8,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
              >
                  <Text
                      style={{
                          color: Colors.white,
                          fontSize: 18,
                          fontWeight: '600',
                      }}
                  >
                      Sauvegarder
                  </Text>
              </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  </KeyboardAvoidingView>
  )
}
