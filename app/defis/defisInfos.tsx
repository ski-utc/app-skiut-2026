import { Text, View } from "react-native";
import Header from "../../components/header";
import React from 'react';
import { Colors } from '@/constants/GraphSettings';
import BoutonRetour from '@/components/divers/boutonRetour';
import { TouchableOpacity } from 'react-native';
import { LandPlot } from 'lucide-react';

export default function DefisInfos() {

    return (
    <View 
    style={{ flex: 1, backgroundColor: 'white' }}>
        <Header/>
        <View style={{
        width: '100%',
        flex: 1,
        backgroundColor: Colors.white,
        paddingHorizontal: 20,
        paddingBottom: 16,
        }}>
        <BoutonRetour
            previousRoute={"defisScreen"}
            title={"Défi"}
        />
        <TouchableOpacity
          style={{
            position: 'absolute',
            bottom: 80,
            backgroundColor: 'white',
            padding: 15,
            borderRadius: 8,
            width: '80%',
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center',
            left: '10%',
            borderWidth: 1,
            borderColor: '#DDDDDD',
          }}
        >
          <Text
            style={{
              color: '#343434',
              fontSize: 14,
              fontFamily: 'Inter',
              fontWeight: '600',
              marginRight: 10,
            }}
          >
            Voir ses défis
          </Text>
          <LandPlot color="#343434" size={20} />
        </TouchableOpacity>
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
          onPress={() => console.log('Button Pressed')}
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