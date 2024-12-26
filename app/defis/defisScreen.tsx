import { View, FlatList, StyleSheet } from "react-native";
import Header from "../../components/header";
import { Trophy } from 'lucide-react-native';
import React from 'react';
import BoutonNavigation from "@/components/divers/boutonNavigation";
import BoutonRetour from "@/components/divers/boutonRetour";
import BoutonDefi from "@/components/defis/boutonDefi";
import { Colors } from "@/constants/GraphSettings"

const challenges: { title: string; details: string; estValide: boolean }[] = [
  {
    title: "Prendre une photo avec un mono",
    details: "Prenez une photo avec un moniteur de ski et partagez-la sur les réseaux sociaux.",
    estValide: true,
  },
  {
    title: "Faire un bonhomme de neige",
    details: "Construisez un bonhomme de neige et prenez une photo de votre création.",
    estValide: false,
  },
  {
    title: "Descendre une piste rouge",
    details: "Descendez une piste rouge sans tomber.",
    estValide: false,
  },
  {
    title: "Faire une bataille de boules de neige",
    details: "Participez à une bataille de boules de neige avec au moins deux autres personnes.",
    estValide: true,
  },
  {
    title: "Prendre un cours de ski",
    details: "Inscrivez-vous et participez à un cours de ski.",
    estValide: false,
  },
  {
    title: "Visiter un chalet",
    details: "Visitez un chalet de montagne et prenez une photo.",
    estValide: false,
  },
  {
    title: "Faire du ski de fond",
    details: "Faites du ski de fond sur une piste balisée.",
    estValide: false,
  },
  {
    title: "Construire un igloo",
    details: "Construisez un igloo et prenez une photo de votre construction.",
    estValide: false,
  },
  {
    title: "Descendre une piste noire",
    details: "Descendez une piste noire sans tomber.",
    estValide: false,
  },
];

// @ts-ignore
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
    }}
  >
    <Header/>
    <View style={{
      width: '100%',
      flex: 1,
      backgroundColor: Colors.white,
      paddingBottom: 16,
    }}>
      <View style={{paddingHorizontal: 20}}>
        <BoutonRetour
          previousRoute={"homeNavigator"}
          title={"Défis"}
        />
      </View>
      <FlatList
        data={challenges}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View>
            <BoutonDefi nextRoute={"defisInfos"} defi={item} estValide={item.estValide} />
          </View>
        )}
        style={{}}
      />
      <View
      style={{
        width: '100%',
        backgroundColor: Colors.white,
        paddingHorizontal: 20,
        paddingBottom: 16,
      }}
    >
      <BoutonNavigation nextRoute={"defisClassement"} title={"Classement"} IconComponent={Trophy} />
    </View>

    </View>
  </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: "100%",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.white,
    paddingBottom: 8,
  },
  headerContainer: {
    width: '100%',
    flex: 1,
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  list: {
    width: "100%",
    marginTop: 20,
    marginBottom: 8,
  },
  listContentContainer: {
    paddingLeft: 20,
    paddingRight: 20,
  },
});
