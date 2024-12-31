import { SafeAreaView, View, StyleSheet, Text, FlatList, ActivityIndicator, TouchableOpacity } from "react-native";
import { Colors, Fonts } from '@/constants/GraphSettings';
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import Header from "@/components/header";
import ErrorScreen from "@/components/pages/errorPage";
import BoutonRetour from "@/components/divers/boutonRetour";
import { apiGet } from '@/constants/api/apiCalls';
import { useUser } from '@/contexts/UserContext';

export default function PlanningScreen() {
  const days = ["S 18", "D 19", "L 20", "Ma 21", "M 22", "J 23", "V 24", "S 25"];
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [activitiesMap, setActivitiesMap] = useState<{ [key: string]: Activity[] }>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const { setUser } = useUser();

  const dayMap = useMemo(
    () => ({
      "S": "Samedi",
      "D": "Dimanche",
      "L": "Lundi",
      "Ma": "Mardi",
      "Me": "Mercredi",
      "J": "Jeudi",
      "V": "Vendredi",
    }),
    []
  );

  const fetchPlanning = async () => {
    setLoading(true);
    try {
      const response = await apiGet("getPlanning");
      if (response.success) {
        setActivitiesMap(response.data);
      } else {
        setError("Une erreur est survenue lors de la récupération du planning");
      }
    } catch (error) {
      if (error.name === "JWTError") {
        setUser(null); 
      } else {
        setError(error.message || "Une erreur inattendue est survenue");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlanning();
  }, []);

  const handlePress = useCallback(
    (day: keyof typeof dayMap, number: string) => {
      setSelectedDate(`2025-01-${number}`);
    },
    [dayMap]
  );

  const selectedActivities = activitiesMap[selectedDate] || [];

  const data = [
    { type: "days", days },
    { type: "activities", activities: selectedActivities },
  ];

  const renderItem = ({ item }: { item: any }) => {
    if (item.type === "days") {
      return (
        <View style={{
            flexDirection: "row",
            justifyContent: "space-around",
            width: "95%",
            marginTop: 5,
            height: 60,
            borderRadius: 12,
            borderWidth: 2,
            borderColor: Colors.orange,
            alignSelf: "center",
        }}>
          {item.days.map((day: string, index: number) => {
            const [letter, number] = day.split(" ");
            const isSelected = selectedDate === `2025-01-${number}`;
  
            return (
              <TouchableOpacity
                key={index}
                style={{
                    flex: 1,
                    paddingTop: 8,
                    paddingBottom: 8,
                    borderRadius: 8,
                    flexDirection: "column",
                    justifyContent: "flex-start",
                    alignItems: "center",
                    backgroundColor: isSelected ? Colors.orange : Colors.white
                }}
                onPress={() => handlePress(letter as keyof typeof dayMap, number)}
              >
                <Text style={[styles.dayLetter, { color: isSelected ? Colors.white : Colors.gray }]}>
                  {letter}
                </Text>
                <Text style={[styles.dayNumber, { color: isSelected ? Colors.white : Colors.black }]}>
                  {number}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      );
    } else if (item.type === "activities") {
        const formattedDate0 = selectedDate
        ? new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date(selectedDate))
        : "Sélectionnez une date";
      
      const formattedDate = formattedDate0.charAt(0).toUpperCase() + formattedDate0.slice(1);

      return (
        <>
        <Text style={{
            fontFamily: Fonts.Title.Light,
            fontSize: 16,
            fontWeight: "600",
            color: Colors.black,
            marginTop: 20,
        }}>
            {formattedDate || "Sélectionnez une date"}
          </Text>
          {item.activities.length > 0 ? (
            item.activities.map((activity: Activity, index: number) => {
              return (
                <View 
                    key={index}
                    style={{
                        padding: 12,
                        flexDirection: 'row',
                        justifyContent: 'flex-start',
                        alignItems: 'center',
                        borderBottomColor: Colors.customGray,
                        borderBottomWidth: 1,
                        opacity: (activity.status === "past") ? 0.4 : 1
                    }}
                >
                    <View
                        style={{
                            height: 9,
                            width: 9,
                            marginRight: 10,
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}
                    >
                        <View style={{height: '100%', width: '100%', borderRadius: 61, backgroundColor: (activity.status === "current") ? 'green' : 'white'}}></View>
                    </View>
                    <View
                        style={{
                            justifyContent: 'center',
                            alignItems: 'flex-start',
                            gap: 8,
                            flexDirection: 'column'
                        }}
                    >
                        <Text 
                            style={{
                                fontFamily: Fonts.Text.Bold,
                                fontWeight: '600',
                                fontSize: 16,
                                color: Colors.black
                            }}
                        >
                            {activity.time.start} - {activity.time.end}
                        </Text>
                        <Text 
                            style={{
                                fontFamily: Fonts.Text.Bold,
                                fontWeight: '600',
                                fontSize: 14,
                                color: Colors.gray
                            }}
                        >
                            {activity.activity}
                        </Text>
                    </View>
                </View>
              );
            })
          ) : (
            <Text 
                style={{
                    fontSize: 16,
                    color: Colors.gray,
                    textAlign: "center",
                    marginTop: 10,
                }}>
              Aucune activité disponible pour cette date.
            </Text>
          )}
        </>
      );
    }
    return null;
  };

  if(error!='') {
    return(
      <ErrorScreen error={error}/>
    )
  }

  if (loading) {
    return (
      <View
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Header />
        <View
          style={{
            width: '100%',
            flex: 1,
            backgroundColor: Colors.white,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <ActivityIndicator size="large" color={Colors.gray} />
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <View style={styles.content}>
        <BoutonRetour previousRoute={"homeNavigator"} title={"Planning"} />     
        <View style={{
            height: "100%",
            width: "100%",
            backgroundColor: Colors.white,
          }}>
            <FlatList
              data={data}
              keyExtractor={(item, index) => `${item.type}-${index}`}
              renderItem={renderItem}
            />
        </View>
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
  },
  dayLetter: {
    fontSize: 12,
    fontFamily: "Inter",
    fontWeight: "500",
  },
  dayNumber: {
    fontSize: 16,
    fontFamily: "Inter",
    fontWeight: "600",
  }, 
});