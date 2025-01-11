import { View, StyleSheet, Text, FlatList, ActivityIndicator, TouchableOpacity } from "react-native";
import { Colors, Fonts, loadFonts } from '@/constants/GraphSettings';
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
  const [disableRefresh, setDisableRefresh] = useState(false);
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
    setDisableRefresh(true);
    try {
      const response = await apiGet("getPlanning");
      if (response.success) {
        setActivitiesMap(response.data);
      } else {
        setError("Une erreur est survenue lors de la récupération du planning");
      }
    } catch (error) {
      if (error.message === 'NoRefreshTokenError' || error.JWT_ERROR) {
        setUser(null);
      } else {
        setError(error.message || "Une erreur inattendue est survenue");
      }
    } finally {
      setLoading(false);
      setTimeout(() => {
        setDisableRefresh(false);
      }, 5000);
    }
  };

  const getTodayKey = () => {
    const today = new Date();
    const formatter = new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const [{ value: day }, , { value: month }, , { value: year }] = formatter.formatToParts(today);
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    const loadAsyncFonts = async () => {
      await loadFonts();
    };
    loadAsyncFonts();
    const todayKey = getTodayKey();
    setSelectedDate(todayKey);
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
          <Text style={styles.infoText}>
            Les animations déjà réservées sont indiquées en{" "}
            <Text style={styles.orangeText}>orange</Text>.
            Vas-y seulement si tu as pris ta place !
          </Text>

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
              const titleColor = activity.payant ? Colors.orange : Colors.black; // Définir la couleur en fonction de 'payant'
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
                    <View style={{ height: '100%', width: '100%', borderRadius: 61, backgroundColor: (activity.status === "current") ? 'green' : 'white' }}></View>
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
                        color: titleColor,
                      }}
                    >
                      {activity.activity}
                    </Text>
                    <Text
                      style={{
                        fontFamily: Fonts.Text.Bold,
                        fontWeight: '600',
                        fontSize: 14,
                        color: Colors.gray
                      }}
                    >

                      {activity.time.start} - {activity.time.end}
                    </Text>
                  </View>
                </View>
              );
            })
          ) : (
            <View style={styles.noActivitiesContainer}>
              <Text style={styles.noActivitiesText}>
                Sélectionne une date pour voir les activités prévues.
              </Text>
            </View>
          )}
        </>
      );
    }
    return null;
  };

  if (error) {
    return <ErrorScreen error={error} />;
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
    <View style={styles.container}>
      <Header refreshFunction={fetchPlanning} disableRefresh={disableRefresh} />
      <View style={styles.headerContainer}>
        <BoutonRetour previousRoute="homeScreen" title="Planning" />
      </View>
      <FlatList
        data={data}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  headerContainer: {
    width: '100%',
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  listContainer: {
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayLetter: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: Fonts.Text.Medium,
    paddingBottom: 6,
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: Fonts.Text.Bold,
  },
  noActivitiesContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noActivitiesText: {
    fontFamily: Fonts.Text.Medium,
    fontSize: 18,
    textAlign: 'center',
    color: Colors.gray,
  },
  infoText: {
    fontFamily: Fonts.Text.Light,
    fontSize: 14,
    color: Colors.black, // Default color for the whole text
    marginTop: 16,
    textAlign: 'center',
    zIndex: 1,
  },
  orangeText: {
    fontFamily: Fonts.Text.Light,
    fontSize: 14,
    color: Colors.orange, // Only the word "orange" will be in orange
  },
  subInfoText: {
    fontFamily: Fonts.Text.Light,
    fontSize: 14,
    color: Colors.black,
    textAlign: 'center',
    zIndex: 1,
  },
  
});
