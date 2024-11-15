import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import Checkbox from 'expo-checkbox';
import { Colors, Fonts, loadFonts } from '@/constants/GraphSettings';
import Header from "../../components/header";
import BoutonRetour from '@/components/divers/boutonRetour';
import { Send } from 'lucide-react-native';

// @ts-ignore
export default function AnecdotesForm() {
  const [text, setText] = useState('');
  const [isChecked, setChecked] = useState(false);
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
      <TextInput
        style={{
          padding: 14,
          marginBottom: 8,
          background: '#F8F8F8',
          borderRadius: 12, 
          border: '1px #EAEAEA solid', 
          flexDirection: 'column', 
          justifyContent: 'flex-start', 
          alignItems: 'flex-start', 
          gap: 8, 
          display: 'inline-flex',
          color: Colors.black,
          fontFamily: Fonts.Inter.Basic,
          fontWeight: 500,
          fontSize: 14
        }}
        placeholder="Aujourd'hui..."
        placeholderTextColor={'#969696'}
        multiline={true}
        numberOfLines={15}
        onChangeText={(value) => setText(value)}
        value={text}
      />
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start', 
        alignItems: 'center', 
        gap: 11, 
        display: 'inline-flex'
      }}>
        <Checkbox
          size={24}
          value={isChecked}
          onValueChange={setChecked}
          color={isChecked ? Colors.orange : undefined}
        />
        <Text style={{
          color: Colors.black,
          fontSize: 12,
          fontFamily: Fonts.Inter.Basic,
          fontWeight: '500',
        }}>
          En postant ce potin, je certifie qu’il respecte les autres participant.e.s du voyage
        </Text>
      </View>
      <View
        style={{
          width:'100%',
          position: 'absolute',
          right: 0,
          bottom: 16,
          paddingHorizontal: 20,
        }}>
        <TouchableOpacity
          style={{
            padding: 10,
            backgroundColor: '#E64034',
            opacity: isChecked && text.trim() !== '' ? 1 : 0.5,
            borderRadius: 8,
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'row',
            gap: 10,
          }}
          disabled={!isChecked || text.trim() === ''}
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
  </View>
  );
};