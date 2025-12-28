import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Image,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  StyleSheet,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { Camera, Save, X, UserCircle } from 'lucide-react-native';

import { useUser } from '@/contexts/UserContext';
import BoutonRetour from '@/components/divers/boutonRetour';
import {
  apiPost,
  apiGet,
  apiPut,
  ApiResponse,
  isSuccessResponse,
  isPendingResponse,
  handleApiErrorToast,
  handleApiErrorScreen,
  AppError,
} from '@/constants/api/apiCalls';
import ErrorScreen from '@/components/pages/errorPage';
import { Colors, TextStyles } from '@/constants/GraphSettings';

import Header from '../../components/header';

import { SkinderStackParamList } from './skinderNavigator';

type Profile = {
  id: number | null;
  name: string;
  description: string;
  passions: string[];
  image: string;
};

type MaxFileSizeResponse = {
  maxImageSize: number;
};

export default function SkinderProfil() {
  const [profile, setProfile] = useState<Profile>({
    id: null,
    name: '',
    description: '',
    passions: ['', '', '', '', '', ''],
    image: '',
  });

  const [profileImage, setProfileImage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modifiedPicture, setModifiedPicture] = useState(false);
  const [charLimits, setCharLimits] = useState<number[]>(Array(6).fill(0));
  const [imageError, setImageError] = useState(false);

  const { setUser } = useUser();
  const navigation = useNavigation<NavigationProp<SkinderStackParamList>>();

  const fetchProfil = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await apiGet<Profile>('skinder/my-profile');

      if (isSuccessResponse(response)) {
        const data = response.data;

        let passionsList: string[] = [];
        if (typeof data.passions === 'string') {
          try {
            passionsList = JSON.parse(data.passions);
          } catch {
            passionsList = [];
          }
        } else if (Array.isArray(data.passions)) {
          passionsList = data.passions;
        }

        const paddedPassions = [...Array(6)].map(
          (_, i) => passionsList[i] || '',
        );

        setProfile({
          id: data.id,
          name: data.name,
          description: data.description || '',
          passions: paddedPassions,
          image: data.image,
        });

        if (data.image) {
          setProfileImage(`${data.image}?timestamp=${Date.now()}`);
          setImageError(false);
        } else {
          setProfileImage('');
          setImageError(true);
        }
      }
    } catch (err: unknown) {
      handleApiErrorScreen(err, setUser, setError);
    } finally {
      setLoading(false);
    }
  }, [setUser]);

  useEffect(() => {
    fetchProfil();
  }, [fetchProfil]);

  const handleImagePick = async () => {

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (result.canceled) return;

    const { uri, width } = result.assets[0];
    let compressQuality = 1;
    let currentUri = uri;
    let fileInfo = await fetch(uri).then((res) => res.blob());

    let maxFileSize = 5 * 1024 * 1024; // 5MB default
    try {
      const sizeRes = await apiGet<MaxFileSizeResponse>(
        'challenges/max-file-size',
      );
      if (isSuccessResponse(sizeRes)) {
        maxFileSize = sizeRes.data.maxImageSize || maxFileSize;
      }
    } catch {
      maxFileSize = 5 * 1024 * 1024;
    }

    while (fileInfo.size > maxFileSize && compressQuality > 0.1) {
      compressQuality -= 0.1;
      const manipResult = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: width > 1080 ? 1080 : width } }],
        { compress: compressQuality, format: ImageManipulator.SaveFormat.JPEG },
      );
      currentUri = manipResult.uri;
      fileInfo = await fetch(manipResult.uri).then((res) => res.blob());
    }

    if (fileInfo.size > maxFileSize) {
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: 'Image trop lourde même après compression :(',
      });
      return;
    }

    setModifiedPicture(true);
    setProfileImage(currentUri);
    setImageError(false);
  };

  const uploadImage = async (uri: string) => {
    try {
      const fileInfo = await fetch(uri).then((res) => res.blob());

      let maxFileSize = 5 * 1024 * 1024; // 5MB default
      try {
        const sizeRes = await apiGet<MaxFileSizeResponse>(
          'challenges/max-file-size',
        );
        if (isSuccessResponse(sizeRes)) {
          maxFileSize = sizeRes.data.maxImageSize || maxFileSize;
        }
      } catch {
        maxFileSize = 5 * 1024 * 1024;
      }

      if (fileInfo.size > maxFileSize) {
        return {
          success: false,
          message: `Image trop lourde (>${Math.round(maxFileSize / 1024 / 1024)}Mo)`,
          pending: false,
        };
      }

      const formData = new FormData();

      // @ts-expect-error ts(2769)
      formData.append('media', {
        uri: uri,
        name: `room_${profile.id || 'new'}.jpg`,
        type: 'image/jpeg',
      });

      return await apiPost('skinder/my-profile/image', formData, true);
    } catch (err: unknown) {
      handleApiErrorToast(err as AppError, setUser);
      return {
        success: false,
        message: "Problème lors de l'upload de l'image.",
        pending: false,
      };
    }
  };

  const handleSendData = async () => {
    setLoading(true);

    try {
      const filteredPassions = profile.passions.filter((p) => p.trim() !== '');

      const textResponse = await apiPut('skinder/my-profile', {
        description: profile.description,
        passions: filteredPassions,
      });

      let imageResponse: ApiResponse = {
        success: true,
        pending: false,
        message: '',
        data: [],
      };

      if (modifiedPicture) {
        imageResponse = (await uploadImage(profileImage)) as ApiResponse;
      }

      const isSuccess =
        (isSuccessResponse(textResponse) || isPendingResponse(textResponse)) &&
        (!modifiedPicture ||
          isSuccessResponse(imageResponse as ApiResponse<unknown>) ||
          isPendingResponse(imageResponse as ApiResponse<unknown>));

      const isPending =
        isPendingResponse(textResponse) ||
        (modifiedPicture &&
          isPendingResponse(imageResponse as ApiResponse<unknown>));

      if (isSuccess) {
        Toast.show({
          type: isPending ? 'info' : 'success',
          text1: isPending
            ? 'Modifications enregistrées (Hors ligne)'
            : 'Profil modifié !',
          text2: isPending
            ? 'Synchronisation en attente.'
            : 'Vos changements sont en ligne.',
        });
        navigation.navigate('skinderDiscover');
      } else {
        const msg =
          textResponse.message ||
          imageResponse.message ||
          'Erreur lors de la sauvegarde.';
        Toast.show({ type: 'error', text1: 'Erreur', text2: msg });
      }
    } catch (err: unknown) {
      handleApiErrorToast(err as AppError, setUser);
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return <ErrorScreen error={error} />;
  }

  if (loading && !profile.id) {
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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Header refreshFunction={null} disableRefresh={true} />

      <View style={styles.headerContainer}>
        <BoutonRetour title={'Informations de ma chambre'} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.photoSection}>
          <TouchableOpacity
            onPress={handleImagePick}
            style={styles.photoContainer}
          >
            {!imageError && profileImage ? (
              <Image
                source={{ uri: profileImage }}
                style={styles.profileImage}
                resizeMode="cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <View
                style={[styles.profileImage, styles.profileImagePlaceholder]}
              >
                <UserCircle size={100} color={Colors.muted} />
              </View>
            )}
            <View style={styles.photoOverlay}>
              <Camera size={24} color={Colors.white} />
              <Text style={styles.photoOverlayText}>Modifier</Text>
            </View>
          </TouchableOpacity>
          <Text style={styles.profileName}>{profile.name}</Text>
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
            onChangeText={(text) =>
              text.length <= 100 &&
              setProfile({ ...profile, description: text })
            }
            textAlignVertical="top"
          />
          <Text style={styles.characterCount}>
            {(profile.description || '').length}/100
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vos passions</Text>
          <Text style={styles.sectionSubtitle}>
            Ajoutez jusqu'à 6 passions (16 caractères max chacune)
          </Text>
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
                {passion.length === 16 && (
                  <Text style={styles.passionError}>Max atteint</Text>
                )}
              </View>
            ))}
          </View>
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.cancelButton}
            disabled={loading}
          >
            <X size={20} color={Colors.muted} />
            <Text style={styles.cancelButtonText}>Annuler</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSendData}
            style={styles.saveButton}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={Colors.white} size="small" />
            ) : (
              <>
                <Save size={20} color={Colors.white} />
                <Text style={styles.saveButtonText}>Sauvegarder</Text>
              </>
            )}
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
    fontSize: 10,
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
  profileImagePlaceholder: {
    alignItems: 'center',
    backgroundColor: Colors.lightMuted,
    justifyContent: 'center',
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
    marginBottom: 4,
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
