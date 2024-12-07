import React from 'react';
import { View, FlatList, Text, StyleSheet } from 'react-native';
import BoutonRetour from '@/components/divers/boutonRetour';
import Header from '../../components/header';

const GestionAnecdotesScreen = () => {
    return (
        <View style={styles.container}>
          <Header />
          <View style={styles.headerContainer}>
            <BoutonRetour previousRoute="AdminScreen" title="Gestion des anecdotes" />
          </View>
          
          
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
export default GestionAnecdotesScreen;
