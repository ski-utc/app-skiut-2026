import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import BoutonRetour from '@/components/divers/boutonRetour';
import BoutonAdmin from '@/components/admins/boutonAdmin';
import Header from '../../components/header';


const adminControls = [
  { title: 'Valider les défis', nextRoute: 'GestionDefisScreen' },
  { title: 'Gestion des anecdotes', nextRoute: 'GestionAnecdotesScreen' },
  { title: 'Gestion des notifications', nextRoute: 'GestionNotificationsScreen' },
];

export default function Admin() {
  return (
    <View style={styles.container}>
      <Header />
      <View style={styles.headerContainer}>
        <BoutonRetour previousRoute="ProfilScreen" title="Contrôle Admin" />
      </View>
      
      {/* Using BoutonAdmin for navigation */}
      <FlatList
        data={adminControls}
        keyExtractor={(items, index) => index.toString()}
        renderItem={({ item }) => (
          <View>
            <BoutonAdmin nextRoute={item.nextRoute} title= {item.title} />
          </View>
        )}
        contentContainerStyle={styles.listContentContainer}
        style={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: '100%',
    width: '100%',
    flex: 1,
    backgroundColor: 'white',
    paddingBottom: 8,
  },
  headerContainer: {
    width: '100%',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  list: {
    width: '100%',
    marginTop: 20,
  },
  listContentContainer: {
    paddingHorizontal: 20,
  },
});