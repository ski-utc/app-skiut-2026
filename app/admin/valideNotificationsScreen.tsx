import React from 'react';
import { Text, View, TouchableOpacity, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { X, Check } from 'lucide-react-native';
import Header from '../../components/header';
import BoutonRetour from '@/components/divers/boutonRetour';
import { Colors, Fonts } from '@/constants/GraphSettings'; 
import BoutonActiver from '@/components/divers/boutonActiver';

export default function ValideNotifications() {
  const route = useRoute();
  console.log('Route Params:', route.params);
  const { title, subtitle } = route.params as { title: string, subtitle: string }; // title = ID de la notif, subtitle = date

  return (
    <View style={styles.container}>
      <Header />
      <View style={styles.content}>
        <BoutonRetour previousRoute="gestionNotificationsScreen" title={"Gérer " + title} />
        <Text style={styles.title}>Détail de la notification :</Text>
        <View style={styles.textBox}>
          <Text style={styles.text}>Status : xxx</Text>
          <Text style={styles.text}>Date : xxx</Text>
          <Text style={styles.text}>Auteur : xxx</Text>
        </View>
        <View style={styles.anecdoteBox}>
          <Text style={styles.text}>{"---Notification complète---"}</Text>
        </View>
      </View>
     

      <View style={styles.buttonContainer}>
        <View style={styles.buttonSpacing}>
            <BoutonActiver
            title="Désactiver la notification"
            IconComponent={X}
            disabled={true} // Désactive le bouton (dépend du status actuel de la notification)
            />
        </View>
        <BoutonActiver
            title="Valider la notification"
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
  },
  title: {
    marginTop: 20,
    fontSize: 16,
    color: Colors.black,
    fontFamily: 'Inter',
    fontWeight: '600',
    alignSelf: 'stretch',
  },
  textBox: {
    marginTop: 8,
    marginBottom: 16, 
    borderWidth: 1,
    borderColor: Colors.gray,
    borderRadius: 8,
    padding: 10,
    backgroundColor: Colors.white,
    width: '100%',
  },
  anecdoteBox: {
    padding: 14,
    minHeight: 200,
    marginTop: 8,
    marginBottom: 8,
    backgroundColor: '#F8F8F8',
    borderRadius: 12, 
    borderWidth: 1,
    borderColor: '#EAEAEA',
    flexDirection: 'column', 
    justifyContent: 'flex-start', 
    alignItems: 'flex-start', 
    gap: 8, 
    width: '100%',
    color: Colors.black,
    fontFamily: Fonts.Inter.Basic,
    fontWeight: 500,
    fontSize: 14,
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
  },
});
