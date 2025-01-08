import React from "react";
import { View, Text, TouchableOpacity } from "react-native"; 
import { Colors, Fonts } from "@/constants/GraphSettings";
import { useNavigation } from "@react-navigation/native";
import Header from "../header";

//@ts-ignore
export default function ErrorScreen({ error }) {
  const navigation = useNavigation();
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
          width: "100%",
          flex: 1,
          backgroundColor: Colors.white,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            color: Colors.black,
            fontSize: 32,
            fontFamily: Fonts.Inter.Basic,
            fontWeight: "800",
            padding: 10,
            textAlign: "center",
          }}
        >
          Une erreur est survenue...
        </Text>
        <Text
          style={{
            color: Colors.black,
            fontSize: 20,
            fontFamily: Fonts.Inter.Basic,
            fontWeight: "400",
            padding: 10,
            paddingBottom: 32,
            textAlign: "center",
          }}
        >
          {error}
        </Text>
        <Text
          style={{
            color: Colors.black,
            fontSize: 16,
            fontFamily: Fonts.Inter.Italic,
            fontWeight: "400",
            padding: 16,
            textAlign: "center",
          }}
        >
          Si l'erreur persiste, merci de contacter Louise Caignaert ou Mathis Delmaere
        </Text>
        <TouchableOpacity
            onPress={()=>navigation.goBack()}
            style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                backgroundColor: Colors.orange,
                borderRadius: 8,
                justifyContent: 'center',
                alignItems: 'center',
              }}
        >
            <Text
                style={{
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: '600',
                }}
            >
                Retour
            </Text>
          </TouchableOpacity>
      </View>
    </View>
  );
}
