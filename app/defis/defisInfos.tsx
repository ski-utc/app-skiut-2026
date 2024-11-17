import { Text, View } from "react-native";
import Header from "../../components/header";
import React from 'react';
import { Colors } from '@/constants/GraphSettings';
import BoutonRetour from '@/components/divers/boutonRetour';
import { TouchableOpacity } from 'react-native';
import { LandPlot } from 'lucide-react';
import { useRoute } from '@react-navigation/native';

export default function DefisInfos() {
  const route = useRoute();
  const { transmittedText1, transmittedText2 } = route.params as { transmittedText1: string, transmittedText2: string };

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
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
        {/* Bouton Retour */}
        <BoutonRetour
          previousRoute={"defisScreen"}
          title={transmittedText1}
        />

        {/* Titre des détails du défi */}
        <Text style={{
          marginTop: 20,
          fontSize: 16,
          color: Colors.black,
          fontFamily: 'Inter',
          fontWeight: '600',
        }}>
          Détails du défi :
        </Text>

        {/* Zone de texte pour les détails */}
        <View
          style={{
            marginTop: 8,
            borderWidth: 1,
            borderColor: Colors.gray,
            borderRadius: 8,
            padding: 10,
            backgroundColor: Colors.white,
          }}
        >
          <Text
            style={{
              fontSize: 14,
              color: Colors.black,
              fontFamily: 'Inter',
              fontWeight: '400',
              lineHeight: 20,
            }}
          >
            {transmittedText2}
          </Text>
        </View>

        {/* Bouton en bas */}
        <TouchableOpacity
          style={{
            position: 'absolute',
            bottom: 16,
            backgroundColor: '#E64034',
            padding: 15,
            borderRadius: 8,
            width: '80%',
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center',
            left: '10%',
          }}
          onPress={() => console.log('Défi soumis :', transmittedText1, transmittedText2)}
        >
          <Text
            style={{
              color: 'white',
              fontSize: 16,
              fontFamily: 'Inter',
              fontWeight: '600',
              marginRight: 10,
            }}
          >
            Publier mon défi
          </Text>
          <LandPlot color="white" size={20} />
        </TouchableOpacity>
      </View>
    </View>
  );
}