import { Text, View, ScrollView, StyleSheet } from "react-native";
import Header from "../../components/header";
import React from 'react';
import { Colors } from '@/constants/GraphSettings';
import BoutonRetour from '@/components/divers/boutonRetour';
import RectanglePodium from '@/components/classement/rectanglePodium';
import RectangleReste from '@/components/classement/rectangleReste';

export default function DefisClassement() {
  return (
    <View style={styles.container}>
      <Header />
      <View style={styles.content}>
        <BoutonRetour previousRoute={"defisScreen"} title={"Classement"} />
      </View>
      <View style={styles.orangeBackground} />
      <View style={styles.generalRanking}>
        <View style={styles.generalRankingInner}>
          <Text style={styles.generalRankingText}>Classement général</Text>
        </View>
      </View>
      <View style={styles.podiumContainer}>
        <RectanglePodium height={65} num={1} nb_likes={34} style={styles.podiumItem}/>
        <RectanglePodium height={100} num={2} nb_likes={64} style={styles.podiumItem}/>
        <RectanglePodium height={30} num={3} nb_likes={32} style={styles.podiumItem}/>
      </View>
      <ScrollView contentContainerStyle={styles.scrollViewContent} style={styles.scrollView}>
        <RectangleReste bottom={134} number={4} num={4} nb_likes={30} style={styles.resteItem}/>
        <RectangleReste bottom={84} number={5} num={5} nb_likes={29} style={styles.resteItem}/>
        <RectangleReste bottom={34} number={6} num={6} nb_likes={28} style={styles.resteItem}/>
        <RectangleReste bottom={-16} number={7} num={7} nb_likes={27} style={styles.resteItem}/>
        <RectangleReste bottom={-66} number={8} num={8} nb_likes={26} style={styles.resteItem}/>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  content: {
    width: '100%',
    flex: 1,
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  orangeBackground: {
    position: 'absolute',
    top: 135,
    left: 0,
    right: 0,
    height: 200,
    marginTop: 8,
    backgroundColor: Colors.orange,
  },
  generalRanking: {
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
  },
  generalRankingInner: {
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
  },
  generalRankingText: {
    color: Colors.orange,
    fontSize: 12,
    fontFamily: 'Inter',
    fontWeight: '400',
    textAlign: 'center',
  },
  podiumContainer: {
    position: 'absolute',
    bottom: 233,
    left: '50%',
    transform: [{ translateX: -150 }],
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    width: 300,
  },
  podiumItem: {
    marginHorizontal: 5,
  },
  scrollViewContent: {
    paddingBottom: 230,
    paddingTop: 0,
  },
  scrollView: {
    position: 'absolute',
    top: 350,
    left: 0,
    right: 0,
  },
  resteItem: {
    marginVertical: 10,
  },
});