import { useEffect, useState, useCallback } from 'react';
import { View, Image, Text, ActivityIndicator, TouchableOpacity, Alert, TextInput, KeyboardAvoidingView, ScrollView, Platform, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from "expo-image-manipulator";
import { NavigationProp, useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { Camera, Save, X } from 'lucide-react-native';

import { useUser } from '@/contexts/UserContext';
import BoutonRetour from '@/components/divers/boutonRetour';
import { apiPost, apiGet, apiPut } from '@/constants/api/apiCalls';
import ErrorScreen from '@/components/pages/errorPage';
import { Colors, TextStyles } from '@/constants/GraphSettings';

import Header from '../../components/header';

type SkinderProfilStackParamList = {
  skinderProfil: undefined;
  skinderDiscover: undefined;
}

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
  const navigation = useNavigation<NavigationProp<SkinderProfilStackParamList>>();
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
          navigation.navigate('skinderDiscover');
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
          navigation.navigate('skinderDiscover');
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
      <View style={styles.container}>
        <Header refreshFunction={undefined} disableRefresh={true} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primaryBorder} />
          <Text style={styles.loadingText}>
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
        <BoutonRetour title={'Informations de ma chambre'} />
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
  actionsContainer: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 24,
  },
  cancelButton: {
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderColor: Colors.muted,
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  cancelButtonText: {
    ...TextStyles.button,
    color: Colors.muted,
    fontWeight: '600',
  },
  characterCount: {
    ...TextStyles.small,
    color: Colors.muted,
    marginTop: 8,
    textAlign: 'right',
  },
  container: {
    backgroundColor: Colors.white,
    flex: 1,
  },
  content: {
    flex: 1,
  },
  descriptionInput: {
    backgroundColor: Colors.white,
    borderColor: 'rgba(0,0,0,0.1)',
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    ...TextStyles.body,
    color: Colors.primaryBorder,
    elevation: 2,
    minHeight: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  headerContainer: {
    paddingBottom: 8,
    paddingHorizontal: 20,
    width: '100%',
  },
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    ...TextStyles.body,
    color: Colors.muted,
    marginTop: 16,
    textAlign: 'center',
  },
  passionError: {
    ...TextStyles.small,
    color: Colors.accent,
    marginTop: 4,
    textAlign: 'center',
  },
  passionInput: {
    backgroundColor: Colors.white,
    borderColor: Colors.primary,
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
    ...TextStyles.small,
    color: Colors.primaryBorder,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    textAlign: 'center',
  },
  passionInputContainer: {
    minWidth: 100,
    width: '30%',
  },
  passionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  photoContainer: {
    marginBottom: 16,
    position: 'relative',
  },
  photoOverlay: {
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 20,
    bottom: 0,
    flexDirection: 'row',
    gap: 4,
    padding: 8,
    position: 'absolute',
    right: 0,
  },
  photoOverlayText: {
    ...TextStyles.small,
    color: Colors.white,
    fontWeight: '600',
  },
  photoSection: {
    alignItems: 'center',
    marginVertical: 24,
  },
  profileImage: {
    borderColor: Colors.primary,
    borderRadius: 75,
    borderWidth: 4,
    height: 150,
    width: 150,
  },
  profileName: {
    ...TextStyles.h2Bold,
    color: Colors.primaryBorder,
    textAlign: 'center',
  },
  saveButton: {
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 12,
    elevation: 3,
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  saveButtonText: {
    ...TextStyles.button,
    color: Colors.white,
    fontWeight: '600',
  },
  scrollContent: {
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 0,
  },
  sectionSubtitle: {
    ...TextStyles.small,
    color: Colors.muted,
    marginBottom: 16,
  },
  sectionTitle: {
    ...TextStyles.h3Bold,
    color: Colors.primaryBorder,
    marginBottom: 8,
  },
});
