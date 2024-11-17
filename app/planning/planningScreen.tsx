import { Text, View, SafeAreaView, FlatList } from "react-native";
import { TouchableOpacity } from "react-native";
import { Colors, Fonts } from '@/constants/GraphSettings';
import React, { useState } from "react";
import BoutonRetour from '@/components/divers/boutonRetour';
import Header from "../../components/header";

// @ts-ignore
export default function PlanningScreen() {
  const days = ["S 18", "D 19", "L 20", "Ma 21", "M 22", "J 23", "V 24", "S 25"];
  const [selectedDate, setSelectedDate] = useState("");

  const dayMap: { [key: string]: string } = {
    "S": "Samedi",
    "D": "Dimanche",
    "L": "Lundi",
    "Ma": "Mardi",
    "M": "Mercredi",
    "J": "Jeudi",
    "V": "Vendredi"
  };

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

  return (
    <SafeAreaView
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "white",
      }}
    >
      <Header/>
      <View style={{
        width: '100%',
        flex: 1,
        backgroundColor: Colors.white,
        paddingHorizontal: 20,
        paddingBottom: 16,
        }}>
      <BoutonRetour
        previousRoute={"homeScreen"}
        title={"Planning"}
      />

      <View style={{ 
        flexDirection: "row", 
        justifyContent: "space-around", 
        width: "90%", 
        marginTop: 5, 
        height: 60, 
        borderRadius: 12, 
        borderWidth: 2, 
        borderColor: "#E64034",
        alignSelf: "center"
      }}>
        {days.map((day, index) => {
          const [letter, number] = day.split(" ");
          const isSelected = selectedDate === `${dayMap[letter]} ${number} Janvier`;
          return (
            <TouchableOpacity
              key={index}
              style={{
                flex: 1,
                paddingTop: 8,
                paddingBottom: 8,
                backgroundColor: isSelected ? "#E64034" : "white",
                borderRadius: 8,
                flexDirection: "column",
                justifyContent: "flex-start",
                alignItems: "center",
                gap: 10,
              }}
              onPress={() => setSelectedDate(`${dayMap[letter]} ${number} Janvier`)}
            >
              <Text style={{ 
                color: isSelected ? "#DEDEDE" : "#ACACAC", 
                fontSize: 12, 
                fontFamily: "Inter", 
                fontWeight: "500", 
              }}>
                {letter}
              </Text>
              <Text style={{ 
                color: isSelected ? "white" : "black", 
                fontSize: 16, 
                fontFamily: "Inter", 
                fontWeight: "600", 
              }}>
                {number}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={{ fontFamily: Fonts.Title.Light, fontSize: 16, fontWeight: "600", color: "#171717", marginTop: 20 }}>
        {selectedDate}
      </Text>

      {selectedDate && (
        <FlatList
          data={activitiesMap[selectedDate] || []}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={{ 
              width: '100%', 
              paddingLeft: 10, 
              paddingRight: 10, 
              paddingTop: 12, 
              paddingBottom: 12, 
              borderBottomWidth: 1, 
              borderBottomColor: '#EAEAEA', 
              justifyContent: 'center', 
              alignItems: 'flex-start', 
              gap: 10, 
              flexDirection: 'row' 
            }}>
                <View style={{ 
                justifyContent: 'center', 
                alignItems: 'center', 
                flexDirection: 'row', 
                marginRight: 10,
                }}>
                <View style={{ 
                  width: 5, 
                  height: 50,
                  backgroundColor: '#E64034', 
                  borderRadius: 3
                }} />
                </View>
              <View style={{ 
                flex: 1, 
                flexDirection: 'column', 
                justifyContent: 'flex-start', 
                alignItems: 'flex-start', 
                gap: 8 
              }}>
                <Text style={{ 
                  color: '#171717', 
                  fontSize: 14, 
                  fontFamily: 'Inter', 
                  fontWeight: '600' 
                }}>
                  {item.time}
                </Text>
                <Text style={{ 
                  color: '#737373', 
                  fontSize: 12, 
                  fontFamily: 'Inter', 
                  fontWeight: '400' 
                }}>
                  {item.activity}
                </Text>
              </View>
            </View>
          )}
          style={{ width: "90%", marginTop: 10 }}
        />
      )}

      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        </View>
      </View>
    </SafeAreaView>
  );
}
