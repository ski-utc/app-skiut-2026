import React from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { Colors, Fonts, loadFonts } from '@/constants/GraphSettings';
import Header from "../../components/header";
import BoutonRetour from '@/components/divers/boutonRetour';
import { Send } from 'lucide-react-native';

// @ts-ignore
export default function AnecdotesForm() {
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
        previousRoute={"anecdotesScreen"}
        title={"Raconte nous ta meilleure anecdotes !"}
      />



      <TouchableOpacity
        style={{
          padding: 10,
          backgroundColor: '#E64034',
          borderRadius: 8,
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'row',
          gap: 10,
        }}
      >
        <Text
          style={{
            color: 'white',
            fontSize: 14,
            fontFamily: Fonts.Inter.Basic,
            fontWeight: '600',
          }}
        >
          Poster mon potin
        </Text>

        <Send
          size={20}
          color={Colors.white}
        />
      </TouchableOpacity>
    </View>
  </View>
  );
};