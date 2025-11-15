import React, { useEffect, useState, useCallback } from 'react';
import { View, Image, Text, ActivityIndicator, TouchableOpacity, Alert, TextInput, KeyboardAvoidingView, ScrollView, Platform, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from "expo-image-manipulator";
import { Colors, TextStyles } from '@/constants/GraphSettings';
import Header from '../../components/header';
import { useUser } from '@/contexts/UserContext';
import { useNavigation } from '@react-navigation/native';
import BoutonRetour from '@/components/divers/boutonRetour';
import { apiPost, apiGet, apiPut } from '@/constants/api/apiCalls';
import ErrorScreen from '@/components/pages/errorPage';
import Toast from 'react-native-toast-message';
import { Camera, Save, X } from 'lucide-react-native';

export default function SkinderProfil() {
  const [profile, setProfile] = useState({
    id: null,
    nom: '',
    description: '',
    passions: ['', '', '', '', '', ''],
  });
  const [profileImage, setProfileImage] = useState('https://i.fbcd.co/products/resized/resized-750-500/563d0201e4359c2e890569e254ea14790eb370b71d08b6de5052511cc0352313.jpg');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [modifiedPicture, setModifiedPicture] = useState(false);
  const [charLimits, setCharLimits] = useState(Array(6).fill(0));

  const { setUser } = useUser();
  const navigation = useNavigation();
  const fetchProfil = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiGet('skinder/my-profile');
      if (response.success) {
        const passions = Array.isArray(response.data.passions)
          ? response.data.passions
          : JSON.parse(response.data.passions || '[]');
        setProfile({
          id: response.data.id,
          nom: response.data.name,
          description: response.data.description || '',
          passions: [...Array(6)].map((_, i) => passions[i] || ''),
        });
        setProfileImage(`${response.data.image}?timestamp=${Date.now()}`);
      } else {
        setError(response.message || "Erreur lors de la récupération du profil.");
      }
    } catch (error: any) {
      if (error.message === 'NoRefreshTokenError' || error.JWT_ERROR) {
        setUser(null);
      } else {
        setError(error.message || "Erreur réseau.");
      }
    } finally {
      setLoading(false);
    }
  }, [setUser]);

  useEffect(() => {
    fetchProfil();
  }, [fetchProfil]);

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
      let maxFileSize = 1024 * 1024;
      try {
        const getTailleMax = await apiGet("challenges/max-file-size");
        if (getTailleMax.success && getTailleMax.data) {
          maxFileSize = getTailleMax.data.maxImageSize || 5 * 1024 * 1024;
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
      setProfileImage(compressedImage.uri);
    } catch {
      setError('Erreur lors de la compression de l\'image.');
    }
  };

  const uploadImage = async (uri: string) => {
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
      } as any);

      const response = await apiPost('skinder/my-profile/image', formData, true);
      return response;
    } catch (error: any) {
      setError(error.message || "Erreur lors du téléversement de l'image");
    }
  };

  const handleSendData = async () => {
    setLoading(true);

    try {
      const filteredPassions = profile.passions.filter(p => p.trim() !== '');
      const response = await apiPut('skinder/my-profile', { 'description': profile.description, 'passions': filteredPassions });
      if (modifiedPicture) {
        const response2 = await uploadImage(profileImage);
        Toast.show({
          type: (response.success && response2.success ? 'success' : (response.pending || response2.pending ? 'info' : 'error')),
          text1: 'Profil modifié !',
          text2: response.message + ' ' + response2.message,
        });
        if ((response.success && response2.success) || (response.pending && response2.pending)) {
          (navigation as any).navigate('skinderDiscover');
        } else {
          setError(response.message || 'Erreur lors de la sauvegarde des données.');
        }
      } else {
        if (response.success) {
          Toast.show({
            type: (response.success ? 'success' : (response.pending ? 'info' : 'error')),
            text1: 'Profil modifié !',
            text2: response.message,
          });
          (navigation as any).navigate('skinderDiscover');
        }
      }
    } catch (error: any) {
      if (error.message === 'NoRefreshTokenError' || error.JWT_ERROR) {
        setUser(null);
      } else {
        setError(error.message || 'Erreur réseau ou serveur.');
      }
    } finally {
      setLoading(false);
    }
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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Header refreshFunction={null} disableRefresh={true} />
      <View style={styles.headerContainer}>
        <BoutonRetour previousRoute={'homeNavigator'} title={'Informations de ma chambre'} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <View style={styles.photoSection}>
          <TouchableOpacity onPress={handleImagePick} style={styles.photoContainer}>
            <Image
              source={{ uri: profileImage }}
              style={styles.profileImage}
              resizeMode="cover"
              onError={() => setProfileImage("https://i.fbcd.co/products/resized/resized-750-500/563d0201e4359c2e890569e254ea14790eb370b71d08b6de5052511cc0352313.jpg")}
            />
            <View style={styles.photoOverlay}>
              <Camera size={24} color={Colors.white} />
              <Text style={styles.photoOverlayText}>Modifier</Text>
            </View>
          </TouchableOpacity>
          <Text style={styles.profileName}>{profile.nom}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>À propos de vous</Text>
          <TextInput
            style={styles.descriptionInput}
            placeholder="Parlez un peu de vous..."
            placeholderTextColor={Colors.muted}
            multiline={true}
            numberOfLines={4}
            value={profile.description}
            onChangeText={(text) => text.length <= 100 ? setProfile({ ...profile, description: text }) : null}
            textAlignVertical="top"
          />
          <Text style={styles.characterCount}>{(profile.description || '').length}/100</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vos passions</Text>
          <Text style={styles.sectionSubtitle}>Ajoutez jusqu'à 6 passions (16 caractères max chacune)</Text>
          <View style={styles.passionsGrid}>
            {profile.passions.map((passion, index) => (
              <View key={index} style={styles.passionInputContainer}>
                <TextInput
                  style={styles.passionInput}
                  placeholder={`Passion ${index + 1}`}
                  placeholderTextColor={Colors.muted}
                  value={passion}
                  onChangeText={(text) => {
                    if (text.length <= 16) {
                      const newPassions = [...profile.passions];
                      newPassions[index] = text;
                      setProfile({ ...profile, passions: newPassions });
                      const newCharLimits = [...charLimits];
                      newCharLimits[index] = text.length;
                      setCharLimits(newCharLimits);
                    }
                  }}
                />
                {16 - charLimits[index] === 0 && (
                  <Text style={styles.passionError}>Trop long</Text>
                )}
              </View>
            ))}
          </View>
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.cancelButton}
          >
            <X size={20} color={Colors.muted} />
            <Text style={styles.cancelButtonText}>Annuler</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleSendData}
            style={styles.saveButton}
            disabled={loading}
          >
            <Save size={20} color={Colors.white} />
            <Text style={styles.saveButtonText}>Sauvegarder</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  headerContainer: {
    width: '100%',
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    ...TextStyles.body,
    color: Colors.muted,
    marginTop: 16,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  photoSection: {
    alignItems: 'center',
    marginVertical: 24,
  },
  photoContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 4,
    borderColor: Colors.primary,
  },
  photoOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primary,
    borderRadius: 20,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  photoOverlayText: {
    ...TextStyles.small,
    color: Colors.white,
    fontWeight: '600',
  },
  profileName: {
    ...TextStyles.h2Bold,
    color: Colors.primaryBorder,
    textAlign: 'center',
  },
  section: {
    marginBottom: 0,
  },
  sectionTitle: {
    ...TextStyles.h3Bold,
    color: Colors.primaryBorder,
    marginBottom: 8,
  },
  sectionSubtitle: {
    ...TextStyles.small,
    color: Colors.muted,
    marginBottom: 16,
  },
  descriptionInput: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    borderRadius: 12,
    padding: 16,
    ...TextStyles.body,
    color: Colors.primaryBorder,
    minHeight: 100,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  characterCount: {
    ...TextStyles.small,
    color: Colors.muted,
    textAlign: 'right',
    marginTop: 8,
  },
  passionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  passionInputContainer: {
    width: '30%',
    minWidth: 100,
  },
  passionInput: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 8,
    padding: 12,
    ...TextStyles.small,
    color: Colors.primaryBorder,
    textAlign: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 1,
  },
  passionError: {
    ...TextStyles.small,
    color: Colors.accent,
    textAlign: 'center',
    marginTop: 4,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.muted,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  cancelButtonText: {
    ...TextStyles.button,
    color: Colors.muted,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonText: {
    ...TextStyles.button,
    color: Colors.white,
    fontWeight: '600',
  },
});
