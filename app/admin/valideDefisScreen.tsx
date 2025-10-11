import React, { useState, useEffect, useCallback } from 'react';
import { Text, View, StyleSheet, ActivityIndicator, Image, TouchableOpacity, ScrollView, SafeAreaView, Modal, StatusBar } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { X, Check, Trophy, Calendar, User, Image as ImageIcon, Maximize } from 'lucide-react-native';
import Header from '../../components/header';
import BoutonRetour from '@/components/divers/boutonRetour';
import { Colors, TextStyles } from '@/constants/GraphSettings';
import BoutonActiver from '@/components/divers/boutonActiver';
import { apiPost, apiGet } from '@/constants/api/apiCalls';
import ErrorScreen from '@/components/pages/errorPage';
import { useUser } from '@/contexts/UserContext';
import Toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native';
import ImageViewer from "react-native-image-zoom-viewer";

interface ChallengeDetails {
  id: number;
  valid: 0 | 1;
  created_at: string;
  user: {
    firstName: string;
    lastName: string;
  };
  challenge: {
    title: string;
    points: number;
  };
}

interface RouteParams {
  id: number;
}

export default function ValideDefis() {
  const route = useRoute();
  const { id } = (route.params as RouteParams) || { id: 0 };
  const { setUser } = useUser();
  const navigation = useNavigation();

  const [challengeDetails, setChallengeDetails] = useState<ChallengeDetails | null>(null);
  const [proofImage, setProofImage] = useState("https://www.shutterstock.com/image-vector/wifi-error-line-icon-vector-600nw-2043154736.jpg");
  const [isModalVisible, setIsModalVisible] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchChallengeDetails = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiGet(`getChallengeDetails/${id}`);
      if (response.success) {
        setChallengeDetails(response.data);
        setProofImage(response.imagePath);
      } else {
        setError('Erreur lors de la récupération des détails du défi');
      }
    } catch (error: any) {
      if (error.message === 'NoRefreshTokenError' || error.JWT_ERROR) {
        setUser(null);
      } else {
        setError(error.message);
      }
    } finally {
      setLoading(false);
    }
  }, [id, setUser]);

  const handleValidation = async (isValid: number, isDelete: number) => {
    setLoading(true);
    try {
      const response = await apiPost(`updateChallengeStatus/${id}/${isValid}/${isDelete}`);

      if (isValid && isDelete) {
        if (response.success) {
          Toast.show({
            type: 'success',
            text1: 'Défi supprimé !',
            text2: response.message,
          });
          navigation.goBack();
        } else {
          Toast.show({
            type: 'error',
            text1: 'Une erreur est survenue...',
            text2: response.message,
          });
          setError(response.message || 'Une erreur est survenue lors de la validation du défi.');
        }
      }

      if (isValid && !isDelete) {
        if (response.success) {
          Toast.show({
            type: 'success',
            text1: 'Défi validé !',
            text2: response.message,
          });
          navigation.goBack();
        } else {
          Toast.show({
            type: 'error',
            text1: 'Une erreur est survenue...',
            text2: response.message,
          });
          setError(response.message || 'Une erreur est survenue lors de la récupération des matchs.');
        }
      }

      if (!isValid) {
        if (response.success) {
          Toast.show({
            type: 'success',
            text1: 'Défis en attente !',
            text2: response.message,
          });
          navigation.goBack();
        } else {
          Toast.show({
            type: 'error',
            text1: 'Une erreur est survenue...',
            text2: response.message,
          });
          setError(response.message || 'Une erreur est survenue lors de la récupération des matchs.');
        }
      }
    } catch (error: any) {
      if (error.message === 'NoRefreshTokenError' || error.JWT_ERROR) {
        setUser(null);
      } else {
        setError(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  /*const handleRemoveDefi = async () => {
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
              const response = await apiPost('challenges/deleteproofImage', { defiId: challengeDetails.challenge_id });
              if (response.success) {
                Toast.show({
                  type: 'success',
                  text1: 'Défi supprimé !',
                  text2: response.message,
                });
                navigation.goBack();
                Toast.show({
                  type: 'error',
                  text1: 'Une erreur est survenue...',
                  text2: response.message,
                });
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
              navigation.goBack();
            }
          },
        },
      ],
      { cancelable: true }
    );
  };*/

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };

  useEffect(() => {
    fetchChallengeDetails();
  }, [fetchChallengeDetails]);

  if (error !== '') {
    return <ErrorScreen error={error} />;
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header refreshFunction={null} disableRefresh={true} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Chargement des détails...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header refreshFunction={null} disableRefresh={true} />
      <View style={styles.headerContainer}>
        <BoutonRetour previousRoute="gestionDefisScreen" title="Gestion défis" />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroSection}>
          <View style={styles.heroIcon}>
            <Trophy size={24} color={Colors.primary} />
          </View>
          <Text style={styles.heroTitle}>Détail du défi #{challengeDetails?.id}</Text>
          <Text style={styles.heroSubtitle}>
            Validez ou refusez ce défi soumis
          </Text>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Trophy size={16} color={Colors.primary} />
            <Text style={styles.infoLabel}>Status :</Text>
            <Text style={[styles.infoValue, challengeDetails?.valid ? styles.validStatus : styles.pendingStatus]}>
              {challengeDetails?.valid ? 'Validé' : 'En attente de validation'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Calendar size={16} color={Colors.primary} />
            <Text style={styles.infoLabel}>Date :</Text>
            <Text style={styles.infoValue}>
              {challengeDetails?.created_at ? new Date(challengeDetails.created_at).toLocaleString('fr-FR', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
              }) : 'Date non disponible'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <User size={16} color={Colors.primary} />
            <Text style={styles.infoLabel}>Auteur :</Text>
            <Text style={styles.infoValue}>{challengeDetails?.user?.firstName} {challengeDetails?.user?.lastName || 'Auteur inconnu'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Trophy size={16} color={Colors.primary} />
            <Text style={styles.infoLabel}>Défi :</Text>
            <Text style={styles.infoValue}>{challengeDetails?.challenge?.title || 'Pas de description'}</Text>
          </View>
        </View>

        <View style={styles.imageCard}>
          <View style={styles.imageHeader}>
            <ImageIcon size={20} color={Colors.primary} />
            <Text style={styles.imageTitle}>Preuve soumise</Text>
          </View>
          <TouchableOpacity onPress={toggleModal} style={styles.imageContainer} activeOpacity={0.8}>
            <Image
              source={{ uri: `${proofImage}?timestamp=${new Date().getTime()}` }}
              style={styles.proofImage}
              resizeMode="cover"
              onError={() => setProofImage("https://www.shutterstock.com/image-vector/wifi-error-line-icon-vector-600nw-2043154736.jpg")}
            />
            <View style={styles.imageOverlay}>
              <Maximize size={16} color={Colors.white} />
              <Text style={styles.imageOverlayText}>Appuyez pour agrandir</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <View style={styles.buttonContainer}>
        <View style={styles.buttonSpacing}>
          <BoutonActiver
            title="Désactiver le défi"
            IconComponent={X}
            disabled={challengeDetails?.valid === 0}
            color={Colors.accent}
            onPress={() => handleValidation(0, 0)}
          />
        </View>
        <View style={styles.buttonRow}>
          <View style={styles.buttonHalf}>
            <BoutonActiver
              title="Refuser"
              IconComponent={X}
              disabled={challengeDetails?.valid === 1}
              color={Colors.error}
              onPress={() => handleValidation(1, 1)}
            />
          </View>
          <View style={styles.buttonHalf}>
            <BoutonActiver
              title="Valider"
              IconComponent={Check}
              disabled={challengeDetails?.valid === 1}
              color={Colors.success}
              onPress={() => handleValidation(1, 0)}
            />
          </View>
        </View>
      </View>

      <Modal
        visible={isModalVisible}
        transparent={false}
        animationType="fade"
        onRequestClose={toggleModal}
      >
        <StatusBar hidden />
        <View style={styles.fullScreenContainer}>
          <TouchableOpacity
            style={styles.closeButton}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  loadingText: {
    ...TextStyles.body,
    color: Colors.muted,
    marginTop: 16,
    textAlign: 'center',
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  heroSection: {
    alignItems: 'center',
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.lightMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    ...TextStyles.h2,
    color: Colors.primaryBorder,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  heroSubtitle: {
    ...TextStyles.body,
    color: Colors.muted,
    textAlign: 'center',
    lineHeight: 20,
  },
  content: {
    flex: 1,
  },
  infoCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 2, height: 3 },
    shadowRadius: 5,
    elevation: 3,
    padding: 16,
    marginBottom: 16,
    marginHorizontal: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  infoLabel: {
    ...TextStyles.body,
    color: Colors.primaryBorder,
    fontWeight: '600',
    marginLeft: 8,
    marginRight: 8,
    minWidth: 80,
  },
  infoValue: {
    ...TextStyles.body,
    color: Colors.muted,
    flex: 1,
    lineHeight: 20,
  },
  validStatus: {
    color: Colors.success,
    fontWeight: '600',
  },
  pendingStatus: {
    color: Colors.primary,
    fontWeight: '600',
  },
  imageCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colors.primary,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 2, height: 3 },
    shadowRadius: 5,
    elevation: 3,
    padding: 16,
    marginBottom: 128,
    marginHorizontal: 20,
  },
  imageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  imageTitle: {
    ...TextStyles.h3Bold,
    color: Colors.primaryBorder,
    marginLeft: 8,
  },
  imageContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
  },
  proofImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageOverlayText: {
    ...TextStyles.small,
    color: Colors.white,
    textAlign: 'center',
    fontWeight: '500',
    marginLeft: 6,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  buttonSpacing: {
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  buttonHalf: {
    flex: 1,
  },
  fullScreenContainer: {
    flex: 1,
    backgroundColor: Colors.primaryBorder,
    position: 'relative',
  },
  closeButton: {
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
  },
});