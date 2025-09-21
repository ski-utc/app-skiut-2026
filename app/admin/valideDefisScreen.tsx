import React, { useState, useEffect, useCallback } from 'react';
import { Text, View, StyleSheet, ActivityIndicator, Image, TouchableOpacity } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { X, Check } from 'lucide-react-native';
import Header from '../../components/header';
import BoutonRetour from '@/components/divers/boutonRetour';
import { Colors, loadFonts } from '@/constants/GraphSettings';
import BoutonActiver from '@/components/divers/boutonActiver';
import { apiPost, apiGet } from '@/constants/api/apiCalls'; // Import the API calls
import ErrorScreen from '@/components/pages/errorPage';
import { useUser } from '@/contexts/UserContext';
import Toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native';
import ImageViewer from "react-native-image-zoom-viewer";

export default function ValideDefis() {
  const route = useRoute();
  const { id } = route.params; // récupère l'id du challengeProof
  const { setUser } = useUser();
  const navigation = useNavigation();

  const [challengeDetails, setChallengeDetails] = useState(null);
  const [proofImage, setProofImage] = useState("https://www.shutterstock.com/image-vector/wifi-error-line-icon-vector-600nw-2043154736.jpg");
  const [isModalVisible, setIsModalVisible] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch challenge details
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
    } catch (error : any) {
      if (error.message === 'NoRefreshTokenError' || error.JWT_ERROR) {
        setUser(null);
      } else {
        setError(error.message);
      }
    } finally {
      setLoading(false);
    }
  }, [id, setUser]);

  // Handle challenge validation (approve or disapprove)
  const handleValidation = async (isValid, isDelete) => {
    setLoading(true);
    try {
      const response = await apiPost(`updateChallengeStatus/${id}/${isValid}/${isDelete}`);

      // Veut refuser le défi
      if(isValid && isDelete) {
        if(response.success) {
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

      // Veut valider le défis 
      if(isValid && !isDelete) {
        if(response.success) {
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

      // Veut mettre en attente le défis (pour revenir sur sa décision)
      if(!isValid) {
        if(response.success) {
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
    } catch (error : any) {
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
    const loadAsyncFonts = async () => {
      await loadFonts();
    };
    loadAsyncFonts();

    fetchChallengeDetails();
  }, [fetchChallengeDetails]);

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
        <Header refreshFunction={null} disableRefresh={true} />
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

  return (
    <View style={styles.container}>
      <Header refreshFunction={null} disableRefresh={true} />
      <View style={styles.content}>
        <BoutonRetour previousRoute="gestionDefisScreen" title="Gestion défis " />
        <Text style={styles.title}>Détails du défi : {challengeDetails?.id}</Text>
        <View style={styles.textBox}>
          <Text style={styles.text}>Status : {challengeDetails?.valid ? 'Validée' : 'En attente de validation'}</Text>
          <Text style={styles.text}>Date : {challengeDetails?.created_at ? new Date(challengeDetails.created_at).toLocaleString('fr-FR', {
            weekday: 'long', // Jour de la semaine complet
            month: 'long', // Mois complet
            day: 'numeric', // Jour
            hour: '2-digit', // Heure sur 2 chiffres
            minute: '2-digit', // Minute sur 2 chiffres
            second: '2-digit', // Seconde sur 2 chiffres
            hour12: false, // Utiliser l'heure 24h (optionnel)
          }) : 'Date non disponible'}</Text>
          <Text style={styles.text}>Auteur : {challengeDetails?.user?.firstName} {challengeDetails?.user?.lastName || 'Auteur inconnu'}</Text>
          <Text style={styles.text}>Défi : {challengeDetails?.challenge.title || 'Pas de description'}</Text>
        </View>
        <TouchableOpacity onPress={toggleModal}>
          <Image
            source={{ uri: `${proofImage}?timestamp=${new Date().getTime()}` }}
            style={{ width: '90%', aspectRatio: 1, maxHeight: '100%', borderRadius: 25 }}
            resizeMode="contain"
            onError={() => setProofImage("https://www.shutterstock.com/image-vector/wifi-error-line-icon-vector-600nw-2043154736.jpg")}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.buttonContainer}>
        <View style={styles.buttonSpacing}>
          <BoutonActiver
            title="Désactiver le défi"
            IconComponent={X}
            disabled={challengeDetails.valid === 0}
            onPress={() => handleValidation(0, 0)}
          />
        </View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-evenly',
            alignItems: 'center',
            width: '100%'
          }}
        >
          <BoutonActiver
            title="Refuser le défi"
            IconComponent={X}
            disabled={challengeDetails.valid === 1}
            onPress={() => handleValidation(1, 1)}
          />
          <BoutonActiver
            title="Valider le défi"
            IconComponent={Check}
            disabled={challengeDetails.valid === 1}
            onPress={() => handleValidation(1, 0)}
          />
        </View>
      </View>
      <ImageViewer
        imageUrls={[{ url: proofImage }]}
        index={0}
        visible={isModalVisible}
        onRequestClose={toggleModal}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  content: {
    width: '100%',
    flex: 1,
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  title: {
    marginTop: 20,
    fontSize: 16,
    color: Colors.black,
    fontFamily: 'Inter',
    fontWeight: '600',
  },
  textBox: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: Colors.gray,
    borderRadius: 8,
    padding: 10,
    backgroundColor: Colors.white,
    marginBottom: 20,
  },
  text: {
    fontSize: 14,
    color: Colors.black,
    fontFamily: 'Inter',
    fontWeight: '400',
    lineHeight: 20,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 20, // Adjust the distance from the bottom as needed
    width: '100%',
    paddingHorizontal: 20,
  },
  buttonSpacing: {
    marginBottom: 16, // Add spacing between the buttons
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});