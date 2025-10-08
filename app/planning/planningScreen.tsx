import { View, StyleSheet, Text, FlatList, ActivityIndicator, TouchableOpacity } from "react-native";
import { Colors, TextStyles, loadFonts } from '@/constants/GraphSettings';
import React, { useState, useCallback, useEffect } from 'react';
import Header from "@/components/header";
import ErrorScreen from "@/components/pages/errorPage";
import BoutonRetour from "@/components/divers/boutonRetour";
import { apiGet } from '@/constants/api/apiCalls';
import { useUser } from '@/contexts/UserContext';
import { Calendar, Clock, MapPin } from 'lucide-react-native';

interface Activity {
  activity: string;
  time: {
    start: string;
    end: string;
  };
  payant: boolean;
  status: 'past' | 'current' | 'future';
}

export default function PlanningScreen() {
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [activitiesMap, setActivitiesMap] = useState<{ [key: string]: Activity[] }>({});
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [disableRefresh, setDisableRefresh] = useState(false);
  const { setUser } = useUser();


  const sortActivitiesByTime = (activities: Activity[]) => {
    return activities.sort((a, b) => {
      const timeA = a.time.start;
      const timeB = b.time.start;
      return timeA.localeCompare(timeB);
    });
  };

  // Fonction pour déterminer la date par défaut à afficher
  const getDefaultDate = (activitiesMap: { [key: string]: Activity[] }) => {
    const dates = Object.keys(activitiesMap).sort();
    if (dates.length === 0) return null;

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    // S'il y a des activités en cours aujourd'hui
    if (activitiesMap[todayStr]) {
      const todayActivities = activitiesMap[todayStr];
      const currentTime = new Date().toTimeString().split(' ')[0];

      // S'il y a des activités qui ont commencé aujourd'hui et ne sont pas finies
      const hasOngoingActivities = todayActivities.some(activity => {
        const startTime = activity.time.start;
        const endTime = activity.time.end;

        if (startTime > endTime) {
          return currentTime >= startTime || currentTime <= endTime;
        } else {
          return currentTime >= startTime && currentTime <= endTime;
        }
      });

      if (hasOngoingActivities) {
        return todayStr;
      }
    }

    // Sinon s'il y a des activités demain
    if (activitiesMap[tomorrowStr]) {
      return tomorrowStr;
    }

    // Sinon, retourner la première date disponible
    return dates[0];
  };

  const fetchPlanning = useCallback(async () => {
    setLoading(true);
    setDisableRefresh(true);
    try {
      const response = await apiGet("getPlanning");
      if (response.success) {
        const sortedActivitiesMap: { [key: string]: Activity[] } = {};
        Object.keys(response.data).forEach(date => {
          sortedActivitiesMap[date] = sortActivitiesByTime(response.data[date]);
        });

        setActivitiesMap(sortedActivitiesMap);
        const dates = Object.keys(sortedActivitiesMap).sort();
        setAvailableDates(dates);

        if (dates.length > 0 && !selectedDate) {
          const defaultDate = getDefaultDate(sortedActivitiesMap);
          if (defaultDate) {
            setSelectedDate(defaultDate);
          }
        }
      } else {
        setError("Une erreur est survenue lors de la récupération du planning");
      }
    } catch (error: any) {
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
  }, [setUser, selectedDate]);

  useEffect(() => {
    const loadAsyncFonts = async () => {
      await loadFonts();
    };
    loadAsyncFonts();
    fetchPlanning();
  }, [fetchPlanning]);

  const handleDatePress = useCallback(
    (date: string) => {
      setSelectedDate(date);
    },
    []
  );

  const selectedActivities = activitiesMap[selectedDate] || [];

  const formatDateForDisplay = (dateString: string) => {
    const date = new Date(dateString);
    const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    const dayName = dayNames[date.getDay()];
    const dayNumber = date.getDate().toString().padStart(2, '0');
    return `${dayName} ${dayNumber}`;
  };

  const data = [
    { type: "days", dates: availableDates },
    { type: "activities", activities: selectedActivities },
  ];

  const renderItem = ({ item }: { item: any }) => {
    if (item.type === "days") {
      if (item.dates.length === 0) {
        return (
          <View style={styles.noDatesContainer}>
            <Calendar size={48} color={Colors.muted} />
            <Text style={styles.noDatesText}>
              Aucune activité planifiée pour le moment.
            </Text>
          </View>
        );
      }

      return (
        <View style={styles.daysContainer}>
          {item.dates.map((date: string, index: number) => {
            const isSelected = selectedDate === date;
            const displayText = formatDateForDisplay(date);
            const [dayName, dayNumber] = displayText.split(" ");

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dayButton,
                  { backgroundColor: isSelected ? Colors.primary : Colors.white }
                ]}
                onPress={() => handleDatePress(date)}
              >
                <Text style={[
                  styles.dayLetter,
                  { color: isSelected ? Colors.white : Colors.primaryBorder }
                ]}>
                  {dayName}
                </Text>
                <Text style={[
                  styles.dayNumber,
                  { color: isSelected ? Colors.white : Colors.primaryBorder }
                ]}>
                  {dayNumber}
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
        <View style={styles.activitiesContainer}>
          <View style={styles.infoCard}>
            <Calendar size={20} color={Colors.primary} />
            <Text style={styles.infoText}>
              Les animations déjà réservées sont indiquées en{" "}
              <Text style={styles.primaryText}>bleu</Text>.
              Vas-y seulement si tu as pris ta place !
            </Text>
          </View>

          <View style={styles.dateHeader}>
            <Text style={styles.dateTitle}>
              {formattedDate || "Sélectionnez une date"}
            </Text>
          </View>

          {item.activities.length > 0 ? (
            <View style={styles.activitiesList}>
              {item.activities.map((activity: Activity, index: number) => {
                const titleColor = activity.payant ? Colors.primary : Colors.primaryBorder;
                return (
                  <View
                    key={index}
                    style={[
                      styles.activityCard,
                      { opacity: (activity.status === "past") ? 0.4 : 1 }
                    ]}
                  >
                    <View style={styles.activityIndicator}>
                      <View style={[
                        styles.statusDot,
                        { backgroundColor: (activity.status === "current") ? Colors.success : Colors.lightMuted }
                      ]} />
                    </View>
                    <View style={styles.activityContent}>
                      <Text style={[styles.activityTitle, { color: titleColor }]}>
                        {activity.activity}
                      </Text>
                      <View style={styles.activityTime}>
                        <Clock size={14} color={Colors.muted} />
                        <Text style={styles.activityTimeText}>
                          {activity.time.start} - {activity.time.end}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={styles.noActivitiesContainer}>
              <MapPin size={48} color={Colors.muted} />
              <Text style={styles.noActivitiesText}>
                Aucune activité prévue pour cette date.
              </Text>
            </View>
          )}
        </View>
      );
    }
    return null;
  };

  if (error) return <ErrorScreen error={error} />;

  if (loading) {
    return (
      <View style={{
        flex: 1,
        backgroundColor: Colors.white,
      }}>
        <Header refreshFunction={undefined} disableRefresh={true} />
        <View style={{
          width: '100%',
          flex: 1,
          backgroundColor: Colors.white,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <ActivityIndicator size="large" color={Colors.primaryBorder} />
          <Text style={[TextStyles.body, { color: Colors.muted, marginTop: 16 }]}>
            Chargement...
          </Text>
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
  daysContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: 8,
    marginBottom: 24,
    height: 64,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.primary,
    backgroundColor: Colors.white,
    padding: 4,
    shadowColor: Colors.primaryBorder,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  dayButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 12,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 2,
  },
  dayLetter: {
    ...TextStyles.small,
    fontWeight: '600',
    marginBottom: 4,
  },
  dayNumber: {
    ...TextStyles.body,
    fontWeight: '700',
  },
  activitiesContainer: {
    marginTop: 8,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.lightMuted,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    gap: 12,
  },
  infoText: {
    ...TextStyles.body,
    color: Colors.primaryBorder,
    flex: 1,
    lineHeight: 20,
  },
  primaryText: {
    ...TextStyles.body,
    color: Colors.primary,
    fontWeight: '600',
  },
  dateHeader: {
    marginBottom: 16,
  },
  dateTitle: {
    ...TextStyles.h3,
    color: Colors.primaryBorder,
    fontWeight: '600',
  },
  activitiesList: {
    gap: 12,
    marginBottom: 20,
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.lightMuted,
    shadowColor: Colors.primaryBorder,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  activityIndicator: {
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  activityContent: {
    flex: 1,
    gap: 4,
  },
  activityTitle: {
    ...TextStyles.bodyBold,
    fontSize: 16,
    lineHeight: 20,
  },
  activityTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  activityTimeText: {
    ...TextStyles.small,
    color: Colors.muted,
  },
  noActivitiesContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: Colors.lightMuted,
    borderRadius: 16,
    marginTop: 20,
  },
  noActivitiesText: {
    ...TextStyles.body,
    textAlign: 'center',
    color: Colors.muted,
    marginTop: 12,
    lineHeight: 20,
  },
  noDatesContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: Colors.lightMuted,
    borderRadius: 16,
    marginTop: 20,
  },
  noDatesText: {
    ...TextStyles.body,
    textAlign: 'center',
    color: Colors.muted,
    marginTop: 12,
    lineHeight: 20,
  },
});
