import { View, StyleSheet, Text, FlatList, ActivityIndicator, TouchableOpacity, Modal, ScrollView } from "react-native";
import { Colors, TextStyles } from '@/constants/GraphSettings';
import React, { useState, useCallback, useEffect } from 'react';
import Header from "@/components/header";
import ErrorScreen from "@/components/pages/errorPage";
import BoutonRetour from "@/components/divers/boutonRetour";
import { apiGet } from '@/constants/api/apiCalls';
import { useUser } from '@/contexts/UserContext';
import { Calendar, Clock, MapPin, HousePlus, Info, X, Timer } from 'lucide-react-native';

interface Activity {
  activity: string;
  time: {
    start: string;
    end: string;
  };
  payant: boolean;
  status: 'past' | 'current' | 'future';
  is_permanence: boolean;
  permanence_data?: {
    id: number;
    name: string;
    description?: string;
    location?: string;
    status: string;
  };
}

interface PermanenceDetails {
  id: number;
  name: string;
  start_datetime: string;
  end_datetime: string;
  location: string;
  status: string;
  is_responsible: boolean;
  responsible: {
    id: number;
    name: string;
    email: string;
  };
  duration_minutes: number;
  notes: string;
}

export default function PlanningScreen() {
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [activitiesMap, setActivitiesMap] = useState<{ [key: string]: Activity[] }>({});
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [disableRefresh, setDisableRefresh] = useState(false);
  const { setUser } = useUser();

  const [showPermanenceModal, setShowPermanenceModal] = useState<boolean>(false);
  const [permanenceDetails, setPermanenceDetails] = useState<PermanenceDetails | null>(null);
  const [loadingPermanence, setLoadingPermanence] = useState<boolean>(false);


  const sortActivitiesByTime = (activities: Activity[]) => {
    return activities.sort((a, b) => {
      const timeA = a.time.start;
      const timeB = b.time.start;
      return timeA.localeCompare(timeB);
    });
  };

  const getDefaultDate = (activitiesMap: { [key: string]: Activity[] }) => {
    const dates = Object.keys(activitiesMap).sort();
    if (dates.length === 0) return null;

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    if (dates.includes(todayStr)) {
      return todayStr;
    }

    return dates[0];
  };

  const fetchPlanning = useCallback(async () => {
    setLoading(true);
    setDisableRefresh(true);
    try {
      const response = await apiGet("planning");
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
        setError("Une erreur est survenue lors de la récupération du planning : " + response.message);
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
    fetchPlanning();
  }, [fetchPlanning]);

  const handleDatePress = useCallback(
    (date: string) => {
      setSelectedDate(date);
    },
    []
  );

  const handlePermanencePress = useCallback(async (permanenceId: number) => {
    setLoadingPermanence(true);
    setShowPermanenceModal(true);
    try {
      const response = await apiGet(`permanences/${permanenceId}`);
      if (response.success) {
        setPermanenceDetails(response.data);
      } else {
        setError("Erreur lors de la récupération des détails de la permanence");
        setShowPermanenceModal(false);
      }
    } catch (error: any) {
      if (error.message === 'NoRefreshTokenError' || error.JWT_ERROR) {
        setUser(null);
      } else {
        setError(error.message || "Une erreur inattendue est survenue");
      }
      setShowPermanenceModal(false);
    } finally {
      setLoadingPermanence(false);
    }
  }, [setUser]);

  const closePermanenceModal = useCallback(() => {
    setShowPermanenceModal(false);
    setPermanenceDetails(null);
  }, []);

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
                const isPermanence = activity.is_permanence === true;
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
                    {isPermanence && activity.permanence_data && (
                      <TouchableOpacity
                        style={styles.permanenceButton}
                        onPress={() => handlePermanencePress(activity.permanence_data!.id)}
                      >
                        <HousePlus size={18} color={Colors.primary} />
                        <Text style={[styles.permanenceButtonText, { ...TextStyles.body }]}>Perm</Text>
                        <Info size={16} color={Colors.primary} />
                      </TouchableOpacity>
                    )}
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

      <Modal
        visible={showPermanenceModal}
        animationType="fade"
        transparent={true}
        onRequestClose={closePermanenceModal}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={closePermanenceModal}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
            style={styles.modalContainer}
          >
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderContent}>
                <HousePlus size={28} color={Colors.primary} />
                <Text style={styles.modalTitle}>{permanenceDetails?.name ? permanenceDetails.name : 'Permanence'}</Text>
              </View>
              <TouchableOpacity onPress={closePermanenceModal} style={styles.closeButton}>
                <X size={24} color={Colors.primaryBorder} />
              </TouchableOpacity>
            </View>

            {loadingPermanence ? (
              <View style={styles.modalLoading}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={[TextStyles.body, { color: Colors.muted, marginTop: 16 }]}>
                  Chargement...
                </Text>
              </View>
            ) : permanenceDetails ? (
              <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
                <View style={styles.detailSection}>
                  {/* <View style={[
                    styles.statusBadgeContainer,
                    {
                      backgroundColor: permanenceDetails.status === 'completed' ? Colors.success :
                        permanenceDetails.status === 'in_progress' ? Colors.primary :
                          permanenceDetails.status === 'cancelled' ? Colors.error :
                            Colors.muted
                    }
                  ]}>
                    <Text style={styles.statusBadgeText}>
                      {permanenceDetails.status === 'completed' ? 'Terminée' :
                        permanenceDetails.status === 'in_progress' ? 'En cours' :
                          permanenceDetails.status === 'cancelled' ? 'Annulée' :
                            'Planifiée'}
                    </Text>
                  </View> */}

                  <View style={styles.detailCard}>
                    <View style={styles.detailCardHeader}>
                      <Clock size={20} color={Colors.primary} strokeWidth={2.5} />
                      <Text style={styles.detailCardTitle}>Horaires</Text>
                    </View>
                    <View style={styles.detailCardContent}>
                      <Text style={styles.detailValue}>
                        {new Date(permanenceDetails.start_datetime).toLocaleDateString('fr-FR', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long'
                        }).charAt(0).toUpperCase() + new Date(permanenceDetails.start_datetime).toLocaleDateString('fr-FR', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long'
                        }).slice(1)}
                      </Text>
                      <View style={styles.timeRow}>
                        <Text style={styles.timeValue}>
                          {new Date(permanenceDetails.start_datetime).toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </Text>
                        <Text style={styles.detailSeparator}>→</Text>
                        <Text style={styles.timeValue}>
                          {new Date(permanenceDetails.end_datetime).toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </Text>
                      </View>
                      <View style={styles.durationBadge}>
                        <Timer size={14} color={Colors.primary} strokeWidth={2.5} />
                        <Text style={styles.durationText}>
                          {Math.floor(permanenceDetails.duration_minutes / 60)}h
                          {permanenceDetails.duration_minutes % 60 > 0 && ` ${permanenceDetails.duration_minutes % 60}min`}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {permanenceDetails.location && (
                    <View style={styles.detailCard}>
                      <View style={styles.detailCardHeader}>
                        <MapPin size={20} color={Colors.primary} strokeWidth={2.5} />
                        <Text style={styles.detailCardTitle}>Lieu</Text>
                      </View>
                      <View style={styles.detailCardContent}>
                        <Text style={styles.detailValue}>{permanenceDetails.location}</Text>
                      </View>
                    </View>
                  )}

                  {permanenceDetails.notes && (
                    <View style={styles.notesCard}>
                      <View style={styles.detailCardHeader}>
                        <Info size={20} color={Colors.primary} strokeWidth={2.5} />
                        <Text style={styles.detailCardTitle}>Notes</Text>
                      </View>
                      <Text style={styles.notesText}>{permanenceDetails.notes}</Text>
                    </View>
                  )}
                </View>
              </ScrollView>
            ) : null}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
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
    marginBottom: 12,
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
    marginTop: 0,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.lightMuted,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    gap: 12,
  },
  infoText: {
    ...TextStyles.small,
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
    ...TextStyles.h3Bold,
    color: Colors.primaryBorder,
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
    position: 'relative',
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
  permanenceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.lightMuted,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  permanenceButtonText: {
    color: Colors.primary,
    fontWeight: '600',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightMuted,
  },
  modalHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalTitle: {
    ...TextStyles.h2Bold,
    color: Colors.primaryBorder,
    flex: 1,
    flexWrap: 'wrap',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.lightMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalLoading: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  modalContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  detailSection: {
    gap: 16,
    paddingBottom: 20,
  },
  statusBadgeContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  detailCard: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.lightMuted,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  detailCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  detailCardTitle: {
    ...TextStyles.bodyBold,
    color: Colors.primaryBorder,
    fontSize: 16,
  },
  detailCardContent: {
    gap: 8,
  },
  detailValue: {
    ...TextStyles.body,
    color: Colors.primaryBorder,
    lineHeight: 22,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
  },
  timeValue: {
    ...TextStyles.h3Bold,
    color: Colors.primaryBorder,
    fontSize: 18,
  },
  detailSeparator: {
    ...TextStyles.body,
    color: Colors.primary,
    fontSize: 20,
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.lightMuted,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  durationText: {
    ...TextStyles.small,
    color: Colors.primaryBorder,
    fontWeight: '600',
  },
  notesCard: {
    backgroundColor: Colors.lightMuted,
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  notesText: {
    ...TextStyles.body,
    color: Colors.primaryBorder,
    lineHeight: 22,
  },
  statusBadgeText: {
    ...TextStyles.bodyBold,
    color: Colors.white,
    fontSize: 14,
  },
});
