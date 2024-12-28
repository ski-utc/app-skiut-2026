import { Text, View, ScrollView } from "react-native";
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
    <View
      style={{
        flex: 1,
        backgroundColor: Colors.white,
      }}
    >
      <Header />
      <View
        style={{
          width: '100%',
          backgroundColor: Colors.white,
          paddingHorizontal: 20,
          paddingBottom: 16,
          marginBottom: 12,
        }}
      >
        <BoutonRetour previousRoute={"defisScreen"} title={"Classement"} />
      </View>
      <View
        style={{
          backgroundColor: Colors.orange,
          padding: 16,
          alignItems: 'center',
          position: 'relative',
          height: 200,
        }}
      >
        <Text
          style={{
            color: Colors.white,
            fontSize: 16,
            fontFamily: 'Inter',
            fontWeight: '600',
            textAlign: 'center',
            marginBottom: 16,
          }}
        >
          Classement général
        </Text>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'flex-end',
            width: '100%',
            position: 'absolute',
            bottom: 0,
          }}
        >
          <RectanglePodium
            height={65}
            num={podiumRooms[1].num}
            nb_likes={podiumRooms[1].nb_likes}
            style={{ marginHorizontal: 5 }}
          />
          <RectanglePodium
            height={100}
            num={podiumRooms[0].num}
            nb_likes={podiumRooms[0].nb_likes}
            style={{ marginHorizontal: 5 }}
          />
          <RectanglePodium
            height={30}
            num={podiumRooms[2].num}
            nb_likes={podiumRooms[2].nb_likes}
            style={{ marginHorizontal: 5 }}
          />
        </View>
      </View>
      <ScrollView
        contentContainerStyle={{
          paddingBottom: 230,
        }}
        style={{
          flex: 1,
          width: '100%',
        }}
      >
        {restRooms.map((room, index) => (
          <RectangleReste
            key={room.num}
            bottom={134 - index * 50}
            number={index + 4}
            num={room.num}
            nb_likes={room.nb_likes}
            style={{ marginVertical: 10 }}
          />
        ))}
      </ScrollView>
    </View>
  );
}
