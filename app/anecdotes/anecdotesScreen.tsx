import React from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { Colors, Fonts, loadFonts } from '@/constants/GraphSettings';
import Header from "../../components/header";
import Anecdote from '../../components/anecdotes/anecdote';
import BoutonRetour from '@/components/divers/boutonRetour';
import BoutonNavigation from '@/components/divers/boutonNavigation';
import { MessageCirclePlus } from 'lucide-react-native';

// @ts-ignore
export default function AnecdotesScreen() {
  const anecdotes = [
    { id: 1, text: "Je suis tombé dans mon pipi aujourd’hui pendant la pose casse croute", room: "101", like: 0, nbLikes:0, warn: 0 },
    { id: 2, text: "J’ai vu le zob d’un mono de ski", room: "102", like: 1,nbLikes:10, warn: 0 },
    { id: 3, text: "Les gars l’appli elle bug de fou on dirait pas que vous payez 24 balles !", room: "103", like: 0, nbLikes:120, warn: 1 }
  ];

  return (
    <View
    style={{
      height: "100%",
      width: "100%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <Header/>
    <View style={{
      width: '100%',
      flex: 1,
      backgroundColor: Colors.white,
      paddingHorizontal: 20,
      paddingBottom: 16,
    }}>
      <BoutonRetour
        previousRoute={"homeNavigator"}
        title={"Anecdotes"}
      />

      <FlatList 
        data={anecdotes} 
        renderItem={({ item }) => (
          <Anecdote 
            text={item.text} 
            room={item.room} 
            like={item.like} 
            nbLikes={item.nbLikes} 
            warn={item.warn} 
          />
        )}
        keyExtractor={item => item.id.toString()}
        ItemSeparatorComponent={() => <View style={{ height: 36 }} />}
      />

      <BoutonNavigation
        nextRoute={"anecdotesForm"}
        title={"Rédiger un potin"}
        IconComponent={MessageCirclePlus}
      />
    </View>
  </View>
  );
};