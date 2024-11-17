import { Text, View, ScrollView, StyleSheet } from "react-native";
import Header from "../../components/header";
import React from 'react';
import { Colors } from '@/constants/GraphSettings';
import BoutonRetour from '@/components/divers/boutonRetour';
import RectanglePodium from '@/components/classement/rectanglePodium';
import RectangleReste from '@/components/classement/rectangleReste';

const rooms = [
  { num: 1, nb_likes: 34 },
  { num: 2, nb_likes: 64 },
  { num: 3, nb_likes: 81 },
  { num: 4, nb_likes: 30 },
  { num: 5, nb_likes: 39 },
  { num: 6, nb_likes: 123 },
  { num: 7, nb_likes: 27 },
  { num: 8, nb_likes: 48 },
];

const sortedRooms = rooms.sort((a, b) => b.nb_likes - a.nb_likes);
const podiumRooms = sortedRooms.slice(0, 3);
const restRooms = sortedRooms.slice(3);

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
        <RectanglePodium
          key={podiumRooms[1].num}
          height={65}
          num={podiumRooms[1].num}
          nb_likes={podiumRooms[1].nb_likes}
          style={styles.podiumItem}
        />
        <RectanglePodium
          key={podiumRooms[0].num}
          height={100}
          num={podiumRooms[0].num}
          nb_likes={podiumRooms[0].nb_likes}
          style={styles.podiumItem}
        />
        <RectanglePodium
          key={podiumRooms[2].num}
          height={30}
          num={podiumRooms[2].num}
          nb_likes={podiumRooms[2].nb_likes}
          style={styles.podiumItem}
        />
      </View>
      <ScrollView contentContainerStyle={styles.scrollViewContent} style={styles.scrollView}>
        {restRooms.map((room, index) => (
          <RectangleReste
            key={room.num}
            bottom={134 - index * 50}
            number={index + 4}
            num={room.num}
            nb_likes={room.nb_likes}
            style={styles.resteItem}
          />
        ))}
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