import { Text, View } from "react-native";
import Header from "../../components/header";
import React from 'react';
import { Colors } from '@/constants/GraphSettings';
import BoutonRetour from '@/components/divers/boutonRetour';

export default function DefisClassement() {
  return (
    <View 
      style={{ flex: 1, backgroundColor: 'white' }}
      >
      <Header />
      <View 
      style={{
        width: '100%',
        flex: 1,
        backgroundColor: Colors.white,
        paddingHorizontal: 20,
        paddingBottom: 16,
      }}>
        <BoutonRetour previousRoute={"defisScreen"} title={"Classement"} />
      </View>
      <View style={{
        position: 'absolute',
        top: 135,
        left: 0,
        right: 0,
        height: 333,
        marginTop: 8,
        backgroundColor: Colors.orange,
      }} />
      <View style={{
        position: 'absolute',
        width: 343,
        top: 153,
        left: '50%',
        transform: [{ translateX: -171.5 }],
        height: 31,
        borderRadius: 12,
        backgroundColor: Colors.lightOrange,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 4,
      }}>
        <View style={{
          flex: 1,
          width: '100%',
          height: '100%',
          backgroundColor: Colors.white,
          borderRadius: 8,
          justifyContent: 'center',
          alignItems: 'center',
          paddingLeft: 10,
          paddingRight: 10,
          paddingTop: 8,
          paddingBottom: 8,
        }}>
          <Text style={{
            color: Colors.orange,
            fontSize: 12,
            fontFamily: 'Inter',
            fontWeight: '400',
            textAlign: 'center',
          }}>Classement général</Text>
        </View>
      </View>
    </View>
  );
}
