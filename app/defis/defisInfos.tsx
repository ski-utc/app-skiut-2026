import React, { useState, useEffect } from 'react';
import { Text, View, TouchableOpacity, StyleSheet, ScrollView, Image, Dimensions, Alert } from 'react-native';
import { useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { Video } from "expo-av";
import { LandPlot, Check, Trash } from 'lucide-react-native';
import Header from '../../components/header';
import BoutonRetour from '@/components/divers/boutonRetour';
import { apiGet, apiPost } from "@/constants/api/apiCalls";
import { Colors, Fonts, loadFonts } from '@/constants/GraphSettings';

const DefisInfos = () => {
  // Récupération des paramètres de la route, notamment le titre et l'état du défi
  const route = useRoute();
  const { title, estValide, points, isActive } = route.params;

  // États pour stocker les preuves, les hauteurs dynamiques des médias, et l'état de chargement
  const [proofs, setProofs] = useState([]);
  const [mediaHeights, setMediaHeights] = useState({});
  const [loading, setLoading] = useState(true);

  // Chargement des preuves associées au défi à partir de l'API au chargement du composant
  useEffect(() => {
    const fetchProofs = async () => {
      try {
        const { success, data, message } = await apiGet(`challenges/${route.params.id}/proofs`);
        success
            ? setProofs(data) // Si la requête réussit, stocke les preuves récupérées
            : Alert.alert('Erreur', message || 'Impossible de récupérer les preuves.');
      } catch {
        Alert.alert('Erreur', 'Une erreur est survenue.');
      } finally {
        setLoading(false); // Met fin à l'état de chargement
      }
    };
    fetchProofs();
  }, []);

  // Calcule dynamiquement la hauteur des médias pour maintenir leur proportion
  const calculateMediaHeight = (id, width, height) => {
    const ratio = height / width; // Ratio hauteur/largeur du média
    setMediaHeights((prev) => ({
      ...prev,
      [id]: Dimensions.get('window').width * ratio, // Ajuste la hauteur en fonction de la largeur de l'écran
    }));
  };

  // Soumission d'une nouvelle preuve via l'API
  const handleSubmit = async () => {
    try {
      const { canceled, assets } = await ImagePicker.launchImageLibraryAsync({ mediaTypes: 'All', quality: 0.8 });
      if (canceled) return; // Si l'utilisateur annule, on sort

      const file = assets[0]; // Récupération du fichier sélectionné
      const formData = new FormData();
      formData.append("file", { uri: file.uri, type: file.type, name: file.fileName });
      formData.append("challenge_id", route.params.id); // Ajout de l'ID du défi pour lier la preuve

      await apiPost("proofs", formData, true); // Envoi du fichier à l'API
      Alert.alert("Succès", "Ton défi va être vérifié !");
    } catch {
      Alert.alert("Erreur", "Impossible de publier le défi.");
    }
  };

  // Rend une carte de preuve, incluant un média (image ou vidéo)
  const renderProof = (proof) => {
    const isVideo = proof.file.endsWith('.mp4') || proof.file.endsWith('.mov'); // Détection du type de média
    const MediaComponent = isVideo ? Video : Image; // Sélectionne le composant média approprié
    const mediaProps = isVideo
        ? { useNativeControls: true, resizeMode: 'contain', onLoad: ({ naturalSize }) => calculateMediaHeight(proof.id, naturalSize.width, naturalSize.height) }
        : { resizeMode: 'contain', onLoad: ({ nativeEvent }) => calculateMediaHeight(proof.id, nativeEvent.source.width, nativeEvent.source.height) };

    return (
        <View key={proof.id} style={styles.proofCard}>
          <MediaComponent
              source={{ uri: proof.file_url }}
              style={[styles.proofMedia, { height: mediaHeights[proof.id] || 200 }]} // Utilise la hauteur calculée
              {...mediaProps}
          />
          <Text style={styles.proofInfo}>Posté le : {new Date(proof.created_at).toLocaleDateString()}</Text>
        </View>
    );
  };

  return (
      <View style={styles.container}>
        {/* Entête */}
        <Header refreshFunction={undefined} disableRefresh={undefined} />
        <View style={styles.boutonRetourContainer}>
          <BoutonRetour previousRoute="defisScreen" title={title} />
        </View>
        {/* Informations sur le défi */}
        <View style={styles.content}>
          <Text style={styles.points}>Points : {points}</Text>
          <Text style={styles.status}>Statut : {isActive ? 'Actif' : 'Inactif'}</Text>
        </View>
        {/* Liste des preuves */}
        <ScrollView style={styles.proofsContainer}>
          {loading ? (
              <Text style={styles.loadingText}>Chargement des preuves...</Text>
          ) : (
              proofs.map(renderProof) // Rendu des preuves
          )}
        </ScrollView>
        {/* Boutons pour valider ou soumettre */}
        {estValide ? (
            <View style={styles.validContainer}>
              <View style={styles.validTextBox}>
                <Text style={styles.validText}>Défi validé</Text>
                <Check color="white" size={20} />
              </View>
              <TouchableOpacity style={styles.deleteButton}>
                <Text style={styles.deleteButtonText}>Supprimer</Text>
                <Trash color="white" size={20} />
              </TouchableOpacity>
            </View>
        ) : (
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <Text style={styles.submitButtonText}>Publier mon défi</Text>
              <LandPlot color="white" size={20} />
            </TouchableOpacity>
        )}
      </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white, alignItems: 'center' },
  boutonRetourContainer: { width: '100%', paddingHorizontal: 20 },
  content: { width: '100%', flex: 0, paddingHorizontal: 20, paddingBottom: 16 },
  points: { marginTop: 20, fontSize: 24, color: Colors.black, fontWeight: '700' },
  status: { marginTop: 10, fontSize: 20, color: Colors.gray, fontWeight: '600' },
  proofsContainer: { width: '100%', flexGrow: 1, paddingHorizontal: 20, marginTop: 10 },
  proofCard: { marginBottom: 10, borderRadius: 8, borderWidth: 1, borderColor: Colors.gray, padding: 8, backgroundColor: Colors.white },
  proofInfo: { marginTop: 4, fontSize: 14, color: Colors.black },
  proofMedia: { width: '100%', alignSelf: 'center', borderRadius: 8 },
  validContainer: { width: '100%', alignItems: 'center', paddingBottom: 20 },
  validTextBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'green', borderRadius: 8, padding: 10, marginBottom: 16, width: '90%', justifyContent: 'center' },
  validText: { color: 'white', fontSize: 16, fontWeight: '600', marginRight: 10 },
  submitButton: { width: '90%', padding: 10, backgroundColor: Colors.orange, borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  submitButtonText: { color: 'white', fontSize: 16, fontWeight: '600', marginRight: 10 },
  deleteButton: { width: '90%', padding: 10, backgroundColor: 'red', borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  deleteButtonText: { color: 'white', fontSize: 16, fontWeight: '600', marginRight: 10 },
  loadingText: { fontSize: 16, color: Colors.gray, textAlign: 'center', marginTop: 20 },
});

export default DefisInfos;