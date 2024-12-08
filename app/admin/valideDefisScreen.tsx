import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { X, Check } from 'lucide-react';
import Header from '../../components/header';
import BoutonRetour from '@/components/divers/boutonRetour';
import { Colors } from '@/constants/GraphSettings'; 
import BoutonActiver from '@/components/divers/boutonActiver';

export default function ValideDefis() {
  const route = useRoute();
  console.log('Route Params:', route.params);
  const { title, subtitle } = route.params as { title: string, subtitle: string };

  return (
    <View style={styles.container}>
      <Header />
      <View style={styles.content}>
        <BoutonRetour previousRoute="GestionDefisScreen" title={"Gérer " + title} />
        <Text style={styles.title}>Détails du défi :</Text>
        <View style={styles.textBox}>
          <Text style={styles.text}>Status : xxxx</Text>
          <Text style={styles.text}>Date : xxxx</Text>
          <Text style={styles.text}>Auteur : {subtitle}</Text>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <View style={styles.buttonSpacing}>
            <BoutonActiver
            title="Désactiver le défi"
            IconComponent={X}
            disabled={true} // Désactive le bouton (dépend du status actuel de la notification)
            />
        </View>
        <BoutonActiver
            title="Valider la défi"
            IconComponent={Check}
        />
        </View>
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
    alignSelf: 'stretch',
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
    alignSelf: 'stretch',
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
    alignSelf: 'stretch',
  },
  buttonSpacing: {
    marginBottom: 16, // Ajout d'un espace entre les boutons
  },
  button: {
    backgroundColor: '#E64034',
    padding: 15,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Inter',
    fontWeight: '600',
    marginRight: 10,
    alignSelf: 'stretch',
  },
});
