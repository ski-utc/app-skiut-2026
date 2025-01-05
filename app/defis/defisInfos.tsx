import React from 'react';
import { Text, View, TouchableOpacity, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { LandPlot, Check, Trash } from 'lucide-react-native';
import Header from '../../components/header';
import BoutonRetour from '@/components/divers/boutonRetour';
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";
import { apiPost } from "@/constants/api/apiCalls";
import { Colors } from '@/constants/GraphSettings';

export default function DefisInfos() {
  const route = useRoute();
  const { title, estValide, points, isActive } = route.params as {
    title: string;
    estValide: boolean;
    points: number;
    isActive: boolean;
  };

  const handleDelete = () => {
    console.log('Défi supprimé :', title);
    // Ajouter la logique de suppression ici
  };

  const handleSubmit = async () => {
    try {
      // Ouvrir le sélecteur de fichiers
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images, // Limite à des images
        allowsEditing: true,
        quality: 1, // Qualité maximale
      });

      if (!result.canceled) {
        // Convertir l'image en .jpg avec expo-image-manipulator
        const manipResult = await ImageManipulator.manipulateAsync(
            result.assets[0].uri,
            [], // Aucune transformation supplémentaire
            { compress: 1, format: ImageManipulator.SaveFormat.JPEG } // Forcer le format JPEG
        );

        // Préparer les données du fichier
        const file = {
          uri: manipResult.uri,
          type: "image/jpeg", // Type forcé en JPEG
          name: "proof.jpg",
        };

        // Construire le formulaire pour l'upload
        const formData = new FormData();
        formData.append("file", {
          uri: file.uri,
          type: file.type,
          name: file.name,
        });
        formData.append("challenge_id", route.params.id); // Ajouter l'ID du défi

        // Envoyer le fichier via l'API
        const response = await apiPost("proofs", formData, true);

        // Gestion du succès
        Alert.alert("Succès", "Votre défi a été publié !");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Erreur", "Impossible de publier le défi.");
    }
  };

  return (
      <View style={styles.container}>
        <Header refreshFunction={undefined} disableRefresh={undefined} />
        <View style={styles.boutonRetourContainer}>
          <BoutonRetour previousRoute="defisScreen" title={title} />
        </View>
        <View style={styles.content}>
          <Text style={styles.points}>Points : {points}</Text>
          <Text style={styles.status}>
            Statut : {isActive ? 'Actif' : 'Inactif'}
          </Text>
        </View>
        {estValide ? (
            <View style={styles.validContainer}>
              <View style={styles.validTextBox}>
                <Text style={styles.validText}>Défi validé</Text>
                <Check color="white" size={20} />
              </View>
              <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
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
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  boutonRetourContainer: {
    width: '100%',
    paddingHorizontal: 20,
  },
  content: {
    width: '100%',
    flex: 1,
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  points: {
    marginTop: 20,
    fontSize: 24,
    color: Colors.black,
    fontFamily: 'Inter',
    fontWeight: '700',
  },
  status: {
    marginTop: 10,
    fontSize: 20,
    color: Colors.gray,
    fontFamily: 'Inter',
    fontWeight: '600',
  },
  validContainer: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: 20,
  },
  validTextBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'green',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    width: '90%',
    justifyContent: 'center',
  },
  validText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Inter',
    fontWeight: '600',
    marginRight: 10,
  },
  submitButton: {
    width: '90%',
    padding: 10,
    backgroundColor: Colors.orange,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Inter',
    fontWeight: '600',
    marginRight: 10,
  },
  deleteButton: {
    width: '90%',
    padding: 10,
    backgroundColor: 'red',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Inter',
    fontWeight: '600',
    marginRight: 10,
  },
});