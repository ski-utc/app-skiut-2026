import { Text, View, ScrollView } from "react-native";
import Header from "../../components/header";
import { ChevronRight, LandPlot, Check, Trophy } from 'lucide-react';
import React from 'react';
import BoutonNavigation from "@/components/divers/boutonNavigation";
import BoutonRetour from "@/components/divers/boutonRetour";
import BoutonDefi from "@/components/divers/boutonDefi";

const challenges: { title: string; details: string }[] = [
  {
    title: "Prendre une photo avec un mono",
    details: "Prenez une photo avec un moniteur de ski et partagez-la sur les réseaux sociaux.",
  },
  {
    title: "Faire un bonhomme de neige",
    details: "Construisez un bonhomme de neige et prenez une photo de votre création.",
  },
  {
    title: "Descendre une piste rouge",
    details: "Descendez une piste rouge sans tomber.",
  },
  {
    title: "Faire une bataille de boules de neige",
    details: "Participez à une bataille de boules de neige avec au moins deux autres personnes.",
  },
  {
    title: "Prendre un cours de ski",
    details: "Inscrivez-vous et participez à un cours de ski.",
  },
  {
    title: "Visiter un chalet",
    details: "Visitez un chalet de montagne et prenez une photo.",
  },
  {
    title: "Faire du ski de fond",
    details: "Faites du ski de fond sur une piste balisée.",
  },
  {
    title: "Construire un igloo",
    details: "Construisez un igloo et prenez une photo de votre construction.",
  },
  {
    title: "Descendre une piste noire",
    details: "Descendez une piste noire sans tomber.",
  },
];

export default function Defis() {

  return (
    <View
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "white",
        paddingBottom: 8,
      }}
    >
      <Header/>
      <View
          style={{
          width: '100%',
          flex: 1,
          backgroundColor: 'white',
          paddingHorizontal: 20,
          paddingBottom: 16,
          }}
          >
        <BoutonRetour
          previousRoute={"homeScreen"}
          title={"Défis"}
        />
      </View>

      <ScrollView
        style={{
          width: "100%",
          marginTop: 20,
          marginBottom: 8,
        }}
        contentContainerStyle={{
          paddingLeft: 20,
          paddingRight: 20,
        }}
      >
        {challenges.map((defi, index) => (
          <View
            key={index}
            style={{
              width: "100%",
              paddingLeft: 20,
              paddingRight: 20,
              paddingTop: 14,
              paddingBottom: 14,
              borderBottomWidth: 1,
              borderBottomColor: "#EAEAEA",
              justifyContent: "space-between",
              alignItems: "center",
              display: "flex",
              flexDirection: "row",
              backgroundColor: 'white',
            }}
          >
            <View
              style={{
                justifyContent: "flex-start",
                alignItems: "center",
                display: "flex",
                flexDirection: "row",
                width: '85%',
              }}
            >
              <Check color={defi.title === "Faire un bonhomme de neige" ? "#05AA1F" : "#8A8A8A"} size={20} />
              <Text
                style={{
                  color: "#1E1E1E",
                  fontSize: 14,
                  fontFamily: "Inter",
                  fontWeight: "500",
                  marginLeft: 10,
                }}
              >
                {defi.title}
              </Text>
            </View>
            <BoutonDefi
              nextRoute={"defisInfos"}
              title={""}
              IconComponent={ChevronRight}
              textToTransmit1={defi.title}
              textToTransmit2={defi.details}
            />
          </View>
        ))}
      </ScrollView>
      
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
        }}
      >
        <BoutonNavigation
          nextRoute={"defisClassement"}
          title={"Classement"}
          IconComponent={Trophy}
        />
        <View style={{ width: 20 }} />
        <BoutonNavigation
          nextRoute={"mesDefis"}
          title={"Mes défis"}
          IconComponent={LandPlot}
        />
      </View>
    </View>
  );
}
