import { SafeAreaView, View, StyleSheet } from "react-native";
import { Colors } from '@/constants/GraphSettings';
import React from "react";
import PlanningTab from "../../components/planning/planningTab";
import Header from "@/components/header";
import BoutonRetour from "@/components/divers/boutonRetour";

// structure de données avec les activités par jour et les heures
const activitiesMap: { [key: string]: { activity: string, time: string }[] } = {
  "Samedi 18 Janvier": [
    { activity: "Ski", time: "9h - 14h" },
    { activity: "Snowboard", time: "10h - 15h" },
    { activity: "Ice Skating", time: "11h - 13h" }
  ],
  "Dimanche 19 Janvier": [
    { activity: "Ski", time: "9h - 14h" },
    { activity: "Snowboard", time: "10h - 15h" }
  ],
  "Lundi 20 Janvier": [
    { activity: "Ski", time: "9h - 14h" },
    { activity: "Snowboard", time: "10h - 15h" },
    { activity: "Rando!!", time: "12h - 16h" }
  ],
  "Mardi 21 Janvier": [
    { activity: "Ski", time: "9h - 14h" },
    { activity: "Snowboard", time: "10h - 15h" },
    { activity: "Spa", time: "14h - 18h" }
  ],
  "Mercredi 22 Janvier": [
    { activity: "Ski", time: "9h - 14h" },
    { activity: "Snowboard", time: "10h - 15h" },
    { activity: "Spa", time: "14h - 18h" }
  ],
  "Jeudi 23 Janvier": [
    { activity: "Ski", time: "9h - 14h" },
    { activity: "Snowboard", time: "10h - 15h" },
    { activity: "Shopping", time: "13h - 17h" }
  ],
  "Vendredi 24 Janvier": [
    { activity: "Ski", time: "9h - 14h" },
    { activity: "Snowboard", time: "10h - 15h" },
    { activity: "Gros dîner!!", time: "18h - 21h" }
  ],
  "Samedi 25 Janvier": [
    { activity: "Ski", time: "9h - 14h" },
    { activity: "Snowboard", time: "10h - 15h" },
    { activity: "Concert??", time: "20h - 23h" }
  ]
};

const styles = StyleSheet.create({
  container: {
    height: "100%",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.white,
  },
  content: {
    width: '100%',
    flex: 1,
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    paddingBottom: 16,
  }
});

const PlanningScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <View style={styles.content}>
        <BoutonRetour previousRoute={"homeScreen"} title={"Planning"} />
        <PlanningTab activitiesMap={activitiesMap} />  {/* affiche le planning en utilisant les données dans activitiesMap */}
      </View>
    </SafeAreaView>
  );
}

export default PlanningScreen;
