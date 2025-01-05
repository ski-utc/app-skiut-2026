import React from 'react';
import { Text, View, TouchableOpacity, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { LandPlot, Check, Trash } from 'lucide-react-native'; // Added Trash icon
import Header from '../../components/header';
import BoutonRetour from '@/components/divers/boutonRetour';
import { Colors } from '@/constants/GraphSettings';

export default function DefisInfos() {
  const route = useRoute();
  const { transmittedText1, transmittedText2, estValide } = route.params as { transmittedText1: string, transmittedText2: string, estValide: boolean };

  const handleDelete = () => {
    console.log('Défi supprimé :', transmittedText1, transmittedText2);
    // Add delete logic here
  };

  return (
    <View style={styles.container}>
      <Header />
      <View style={styles.content}>
        <BoutonRetour previousRoute="defisScreen" title={transmittedText1} />
        <Text style={styles.title}>Détails du défi :</Text>
        <View style={styles.textBox}>
          <Text style={styles.text}>{transmittedText2}</Text>
        </View>
      </View>
      {estValide ? (
        <>
          <View style={styles.validTextContainer}>
            <Text style={styles.validText}>Défi validé</Text>
            <Check color="white" size={20} />
          </View>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDelete}
          >
            <Text style={styles.deleteButtonText}>Supprimer</Text>
            <Trash color="white" size={20} />
          </TouchableOpacity>
        </>
      ) : (
        <TouchableOpacity
          style={[styles.button, styles.deleteButton]} // Reuse deleteButton positioning
          onPress={() => console.log('Défi soumis :', transmittedText1, transmittedText2, estValide)}
        >
          <Text style={styles.buttonText}>Publier mon défi</Text>
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
    justifyContent: 'center',
    alignItems: 'center',
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
  },
  text: {
    fontSize: 14,
    color: Colors.black,
    fontFamily: 'Inter',
    fontWeight: '400',
    lineHeight: 20,
  },
  validTextContainer: {
    position: 'absolute',
    bottom: 80,
    width: '90%',
    padding: 10,
    backgroundColor: 'green',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  validText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Inter',
    fontWeight: '600',
    marginRight: 10,
  },
  button: {
    width: '90%',
    padding: 10,
    backgroundColor: Colors.orange,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Inter',
    fontWeight: '600',
    marginRight: 10,
  },
  deleteButton: {
    position: 'absolute',
    bottom: 16,
    width: '90%',
    padding: 10,
    backgroundColor: Colors.orange, // Kept same color for "Publier mon défi"
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Inter',
    fontWeight: '600',
    marginRight: 10,
  },
});
