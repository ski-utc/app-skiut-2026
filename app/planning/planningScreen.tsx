import { SafeAreaView, View, StyleSheet, Text } from "react-native";
import { Colors } from '@/constants/GraphSettings';
import React from "react";
import PlanningTab from "../../components/planning/planningTab";
import Header from "@/components/header";
import BoutonRetour from "@/components/divers/boutonRetour";

export default function PlanningScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <View style={styles.content}>
        <BoutonRetour previousRoute={"homeNavigator"} title={"Planning"} />     
        <PlanningTab/>
      </View>
    </SafeAreaView>
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
  },
  content: {
    width: '100%',
    flex: 1,
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    paddingBottom: 16,
  }
});