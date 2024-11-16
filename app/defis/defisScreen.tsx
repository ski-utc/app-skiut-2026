import { Text, View, ScrollView } from "react-native";
import Header from "../../components/header";
import { ChevronRight, ChevronLeft, Check, Trophy } from 'lucide-react';
import React from 'react';
import BoutonNavigation from "@/components/divers/boutonNavigation";
import BoutonRetour from "@/components/divers/boutonRetour";

const challenges: string[] = [
  "Prendre une photo avec un mono",
  "Faire un bonhomme de neige",
  "Descendre une piste rouge",
  "Faire une bataille de boules de neige",
  "Prendre un cours de ski",
  "Visiter un chalet",
  "Faire du ski de fond",
  "Construire un igloo",
  "Descendre une piste noire",
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
        paddingBottom: 16,
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
          marginTop: 30,
        }}
        contentContainerStyle={{
          paddingLeft: 20,
          paddingRight: 20,
          paddingBottom: 100,
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
              <Check color={defi === "Faire un bonhomme de neige" ? "#05AA1F" : "#8A8A8A"} size={20} />
              <Text
                style={{
                  color: "#1E1E1E",
                  fontSize: 14,
                  fontFamily: "Inter",
                  fontWeight: "500",
                  marginLeft: 10,
                }}
              >
                {defi}
              </Text>
            </View>
            <BoutonNavigation
              nextRoute={"defisInfos"}
              title={""}
              IconComponent={ChevronRight}
            />
          </View>
        ))}
      </ScrollView>
      
      <BoutonNavigation
        nextRoute={"defisClassement"}
        title={"Classement"}
        IconComponent={Trophy}
      />
    </View>
  );
}
