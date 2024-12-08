import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { Colors, Fonts, loadFonts } from '@/constants/GraphSettings';
import Header from "../../components/header";
import BoutonRetour from '@/components/divers/boutonRetour';
import { Send } from 'lucide-react-native';

// @ts-ignore
export default function NotificationsForm() {
    const [text, setText] = useState('');
    const [isChecked, setChecked] = useState(false);
  
    // Calculer l'opacité du bouton en fonction de la saisie
    const isButtonDisabled = text.trim().length === 0;
  
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
        <Header />
        <View
          style={{
            width: '100%',
            flex: 1,
            backgroundColor: Colors.white,
            paddingHorizontal: 20,
            paddingBottom: 16,
          }}
        >
          <BoutonRetour
            previousRoute={"GestionNotificationsScreen"}
            title={"Rédige une notification"}
          />
          <TextInput
            style={{
              padding: 14,
              marginBottom: 8,
              backgroundColor: '#F8F8F8',
              borderRadius: 12,
              borderWidth: 1,
              borderColor: '#EAEAEA',
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
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'flex-start',
              gap: 11,
              display: 'flex'
            }}
          >
          </View>
          <View
            style={{
              width: '100%',
              position: 'absolute',
              right: 0,
              bottom: 16,
              paddingHorizontal: 20,
            }}
          >
            <TouchableOpacity
              style={{
                padding: 10,
                backgroundColor: '#E64034',
                borderRadius: 8,
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'row',
                gap: 10,
                opacity: isButtonDisabled ? 0.5 : 1, // Changer l'opacité
              }}
              disabled={isButtonDisabled} // Désactiver l'interaction si aucun texte
            >
              <Text
                style={{
                  color: 'white',
                  fontSize: 14,
                  fontFamily: Fonts.Inter.Basic,
                  fontWeight: '600',
                }}
              >
                Publier la notification
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
  }
  