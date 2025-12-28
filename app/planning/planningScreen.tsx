import {
  View,
  StyleSheet,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  ScrollView,
  Animated,
} from 'react-native';
import { useState, useCallback, useEffect, useRef } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  HousePlus,
  Info,
  X,
  Timer,
} from 'lucide-react-native';

import { Colors, TextStyles } from '@/constants/GraphSettings';
import Header from '@/components/header';
import ErrorScreen from '@/components/pages/errorPage';
import BoutonRetour from '@/components/divers/boutonRetour';
import {
  apiGet,
  isSuccessResponse,
  handleApiErrorScreen,
} from '@/constants/api/apiCalls';
import { useUser } from '@/contexts/UserContext';

type PermanencePreview = {
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
};

type Activity = {
  activity: string;
  time: {
    start: string;
    end: string;
  };
  originalTime?: {
    start: string;
    end: string;
  };
  payant: boolean;
  status: 'past' | 'current' | 'future';
  is_permanence: boolean;
  permanence_data?: PermanencePreview;
};

type DaysItem = {
  type: 'days';
  dates: string[];
};

type ActivitiesItem = {
  type: 'activities';
  activities: Activity[];
};

type PlanningListItem = DaysItem | ActivitiesItem;

type PlanningResponse = {
  [date: string]: Activity[];
};

type PermanenceDetails = {
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
};

export default function PlanningScreen() {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [activitiesMap, setActivitiesMap] = useState<PlanningResponse>({});
  const [availableDates, setAvailableDates] = useState<string[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const [showPermanenceModal, setShowPermanenceModal] =
    useState<boolean>(false);
  const [permanenceDetails, setPermanenceDetails] =
    useState<PermanenceDetails | null>(null);
  const [loadingPermanence, setLoadingPermanence] = useState<boolean>(false);

  const { setUser } = useUser();

  const slideAnim = useRef(new Animated.Value(1000)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const activeOpacity = 1;
  const inactiveOpacity = 0.4;

  const sortActivitiesByTime = (activities: Activity[]) => {
    return activities.sort((a, b) => a.time.start.localeCompare(b.time.start));
  };

  const addDays = (dateString: string, days: number): string => {
    const date = new Date(dateString);
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
  };

  const getActivityStatus = (
    dateStr: string,
    startTime: string,
    endTime: string,
  ): 'past' | 'current' | 'future' => {
    const now = new Date();
    const start = new Date(`${dateStr}T${startTime}:00`);
    const end = new Date(`${dateStr}T${endTime}:00`);

    if (now > end) return 'past';
    if (now >= start && now <= end) return 'current';
    return 'future';
  };

  const processActivitiesSpanningMidnight = useCallback(
    (data: PlanningResponse): PlanningResponse => {
      const processed: PlanningResponse = {};

      Object.keys(data).forEach((date) => {
        if (!processed[date]) {
          processed[date] = [];
        }

        data[date].forEach((activity) => {
          if (activity.time.start > activity.time.end) {
            const originalTime = {
              start: activity.time.start,
              end: activity.time.end,
            };

            const end1 = '23:59';
            processed[date].push({
              ...activity,
              time: {
                start: activity.time.start,
                end: end1,
              },
              originalTime,
              status: getActivityStatus(date, activity.time.start, end1),
            });

            const nextDay = addDays(date, 1);
            if (!processed[nextDay]) {
              processed[nextDay] = [];
            }
            const start2 = '00:00';
            processed[nextDay].push({
              ...activity,
              time: {
                start: start2,
                end: activity.time.end,
              },
              originalTime,
              status: getActivityStatus(nextDay, start2, activity.time.end),
            });
          } else {
            processed[date].push({
              ...activity,
              status: getActivityStatus(
                date,
                activity.time.start,
                activity.time.end,
              ),
            });
          }
        });
      });

      return processed;
    },
    [],
  );

  const getDefaultDate = (map: PlanningResponse) => {
    const dates = Object.keys(map).sort();
    if (dates.length === 0) return null;

    const today = new Date().toISOString().split('T')[0];
    return dates.includes(today) ? today : dates[0];
  };

  const fetchPlanning = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await apiGet<PlanningResponse>('planning');

      if (isSuccessResponse(response) && response.data) {
        const processedData = processActivitiesSpanningMidnight(response.data);
        const sortedMap: PlanningResponse = {};

        Object.keys(processedData).forEach((date) => {
          sortedMap[date] = sortActivitiesByTime(processedData[date]);
        });

        setActivitiesMap(sortedMap);
        const dates = Object.keys(sortedMap).sort();
        setAvailableDates(dates);

        setSelectedDate((currentDate) => {
          if (dates.length === 0) return currentDate;
          if (currentDate && dates.includes(currentDate)) return currentDate;
          const defaultDate = getDefaultDate(sortedMap);
          return defaultDate || currentDate;
        });
      }
    } catch (err: unknown) {
      handleApiErrorScreen(err, setUser, setError);
    } finally {
      setLoading(false);
    }
  }, [setUser, processActivitiesSpanningMidnight]);

  useEffect(() => {
    fetchPlanning();
    const interval = setInterval(fetchPlanning, 60000);
    return () => clearInterval(interval);
  }, [fetchPlanning]);

  const handleDatePress = useCallback((date: string) => {
    setSelectedDate(date);
  }, []);

  const animateModalOpen = useCallback(() => {
    const slide = slideAnim;
    const fade = fadeAnim;
    slide.setValue(1000);
    fade.setValue(0);
    Animated.parallel([
      Animated.spring(slide, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }),
      Animated.timing(fade, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // slideAnim and fadeAnim are stable refs from useRef

  const animateModalClose = useCallback(() => {
    const slide = slideAnim;
    const fade = fadeAnim;
    Animated.parallel([
      Animated.timing(slide, {
        toValue: 1000,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fade, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowPermanenceModal(false);
      setPermanenceDetails(null);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // slideAnim and fadeAnim are stable refs from useRef

  const handlePermanencePress = useCallback(
    (permanenceData: PermanenceDetails) => {
      setLoadingPermanence(true);
      setShowPermanenceModal(true);
      setPermanenceDetails(permanenceData);

      animateModalOpen();

      setTimeout(() => {
        setLoadingPermanence(false);
      }, 100);
    },
    [animateModalOpen],
  );

  const closePermanenceModal = useCallback(() => {
    animateModalClose();
  }, [animateModalClose]);

  const formatDateForDisplay = (dateString: string) => {
    const date = new Date(dateString);
    const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    return `${dayNames[date.getDay()]} ${date.getDate().toString().padStart(2, '0')}`;
  };

  const selectedActivities = activitiesMap[selectedDate] || [];

  const listData: PlanningListItem[] = [
    { type: 'days', dates: availableDates },
    { type: 'activities', activities: selectedActivities },
  ];

  const renderItem = ({ item }: { item: PlanningListItem }) => {
    if (item.type === 'days') {
      if (item.dates.length === 0) {
        return (
          <View style={styles.noDatesContainer}>
            <Calendar size={48} color={Colors.muted} />
            <Text style={styles.noDatesText}>Aucune activité planifiée.</Text>
          </View>
        );
      }

      return (
        <View style={styles.daysContainer}>
          {item.dates.map((date: string, index: number) => {
            const isSelected = selectedDate === date;
            const [dayName, dayNumber] = formatDateForDisplay(date).split(' ');

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dayButton,
                  {
                    backgroundColor: isSelected ? Colors.primary : Colors.white,
                  },
                ]}
                onPress={() => handleDatePress(date)}
              >
                <Text
                  style={[
                    styles.dayLetter,
                    { color: isSelected ? Colors.white : Colors.primaryBorder },
                  ]}
                >
                  {dayName}
                </Text>
                <Text
                  style={[
                    styles.dayNumber,
                    { color: isSelected ? Colors.white : Colors.primaryBorder },
                  ]}
                >
                  {dayNumber}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      );
    }

    if (item.type === 'activities') {
      const formattedDate0 = selectedDate
        ? new Intl.DateTimeFormat('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          }).format(new Date(selectedDate))
        : 'Sélectionnez une date';
      const formattedDate =
        formattedDate0.charAt(0).toUpperCase() + formattedDate0.slice(1);

      return (
        <View style={styles.activitiesContainer}>
          <View style={styles.infoCard}>
            <Calendar size={20} color={Colors.primary} />
            <Text style={styles.infoText}>
              Les animations réservées sont en{' '}
              <Text style={styles.primaryText}>bleu</Text>.
            </Text>
          </View>

          <View style={styles.dateHeader}>
            <Text style={styles.dateTitle}>{formattedDate}</Text>
          </View>

          {item.activities.length > 0 ? (
            <View style={styles.activitiesList}>
              {item.activities.map((activity: Activity, index: number) => {
                const titleColor = activity.payant
                  ? Colors.primary
                  : Colors.primaryBorder;
                return (
                  <View
                    key={index}
                    style={[
                      styles.activityCard,
                      {
                        opacity:
                          activity.status === 'past'
                            ? inactiveOpacity
                            : activeOpacity,
                      },
                    ]}
                  >
                    <View style={styles.activityIndicator}>
                      <View
                        style={[
                          styles.statusDot,
                          {
                            backgroundColor:
                              activity.status === 'current'
                                ? Colors.success
                                : Colors.lightMuted,
                          },
                        ]}
                      />
                    </View>

                    <View style={styles.activityContent}>
                      <Text
                        style={[styles.activityTitle, { color: titleColor }]}
                      >
                        {activity.activity}
                      </Text>
                      <View style={styles.activityTime}>
                        <Clock size={14} color={Colors.muted} />
                        <Text style={styles.activityTimeText}>
                          {activity.originalTime
                            ? `${activity.originalTime.start} - ${activity.originalTime.end}`
                            : `${activity.time.start} - ${activity.time.end}`}
                        </Text>
                      </View>
                    </View>

                    {activity.is_permanence && activity.permanence_data && (
                      <TouchableOpacity
                        style={styles.permanenceButton}
                        onPress={() =>
                          handlePermanencePress(activity.permanence_data!)
                        }
                      >
                        <HousePlus size={18} color={Colors.primary} />
                        <Text style={styles.permanenceButtonText}>Perm</Text>
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
                Rien de prévu ce jour-là.
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
      <View style={styles.container}>
        <Header refreshFunction={undefined} disableRefresh={true} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primaryBorder} />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header refreshFunction={fetchPlanning} disableRefresh={loading} />
      <View style={styles.headerContainer}>
        <BoutonRetour title="Planning" />
      </View>

      <FlatList
        data={listData}
        keyExtractor={(item) => item.type}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      <Modal
        visible={showPermanenceModal}
        animationType="fade"
        transparent={true}
        statusBarTranslucent={true}
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
                <HousePlus size={24} color={Colors.primary} />
                <Text style={styles.modalTitle} numberOfLines={2}>
                  {permanenceDetails?.name}
                </Text>
              </View>
              <TouchableOpacity
                onPress={animateModalClose}
                style={styles.modalCloseButton}
              >
                <X size={24} color={Colors.primaryBorder} />
              </TouchableOpacity>
            </View>

            {loadingPermanence ? (
              <View style={styles.modalLoading}>
                <ActivityIndicator size="large" color={Colors.primary} />
              </View>
            ) : permanenceDetails ? (
              <ScrollView
                style={styles.modalContent}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.notesCard}>
                  <View style={styles.timeRow}>
                    <Clock size={20} color={Colors.primary} />
                    <Text style={styles.timeValue}>
                      {permanenceDetails.start_datetime
                        .split(/[T ]/)[1]
                        .slice(0, 5)}
                      {' - '}
                      {permanenceDetails.end_datetime
                        .split(/[T ]/)[1]
                        .slice(0, 5)}
                    </Text>
                  </View>

                  {permanenceDetails.location ? (
                    <View style={styles.timeRow}>
                      <MapPin size={20} color={Colors.primary} />
                      <Text style={styles.timeValue}>
                        {permanenceDetails.location}
                      </Text>
                    </View>
                  ) : null}

                  <View style={styles.timeRow}>
                    <Timer size={20} color={Colors.primary} />
                    <Text style={styles.notesText}>
                      {Math.floor(permanenceDetails.duration_minutes / 60)}h
                      {String(permanenceDetails.duration_minutes % 60).padStart(
                        2,
                        '0',
                      )}
                    </Text>
                  </View>

                  {permanenceDetails.notes ? (
                    <>
                      <View style={styles.spacer} />
                      <Text style={styles.notesText}>
                        {permanenceDetails.notes}
                      </Text>
                    </>
                  ) : null}

                  <View style={styles.spacer} />
                  <View style={styles.timeRow}>
                    <Text style={styles.notesText}>Responsable:</Text>
                    <Text style={styles.primaryText}>
                      {permanenceDetails.responsible.name}
                    </Text>
                  </View>
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
  activitiesContainer: {
    marginTop: 0,
  },
  activitiesList: {
    gap: 12,
    marginBottom: 20,
  },
  activityCard: {
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderColor: Colors.lightMuted,
    borderRadius: 12,
    borderWidth: 1,
    elevation: 1,
    flexDirection: 'row',
    padding: 16,
    position: 'relative',
    shadowColor: Colors.primaryBorder,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  activityContent: {
    flex: 1,
    gap: 4,
  },
  activityIndicator: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityTime: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  activityTimeText: {
    ...TextStyles.small,
    color: Colors.muted,
  },
  activityTitle: {
    ...TextStyles.bodyBold,
    fontSize: 16,
    lineHeight: 20,
  },

  container: {
    backgroundColor: Colors.white,
    flex: 1,
  },
  dateHeader: {
    marginVertical: 6,
  },
  dateTitle: {
    ...TextStyles.h3Bold,
    color: Colors.primaryBorder,
    marginBottom: 16,
    paddingHorizontal: 20,
  },

  dayButton: {
    alignItems: 'center',
    borderRadius: 12,
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    marginHorizontal: 2,
    paddingVertical: 8,
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
  daysContainer: {
    backgroundColor: Colors.white,
    borderColor: Colors.primary,
    borderRadius: 16,
    borderWidth: 2,
    elevation: 2,
    flexDirection: 'row',
    height: 64,
    justifyContent: 'space-around',
    marginBottom: 12,
    padding: 4,
    shadowColor: Colors.primaryBorder,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    width: '100%',
  },
  headerContainer: {
    paddingHorizontal: 20,
    width: '100%',
  },
  infoCard: {
    alignItems: 'center',
    backgroundColor: Colors.lightMuted,
    borderRadius: 12,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
    padding: 12,
  },
  infoText: {
    ...TextStyles.small,
    color: Colors.primaryBorder,
    flex: 1,
    lineHeight: 20,
  },
  listContainer: {
    paddingHorizontal: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    backgroundColor: Colors.white,
    flex: 1,
    justifyContent: 'center',
    width: '100%',
  },
  loadingText: {
    ...TextStyles.body,
    color: Colors.muted,
    marginTop: 16,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalContainer: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    elevation: 12,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  modalContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  modalHeader: {
    alignItems: 'center',
    borderBottomColor: Colors.lightMuted,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 16,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  modalHeaderContent: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 12,
    paddingRight: 16,
  },
  modalLoading: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  modalOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalTitle: {
    ...TextStyles.h2Bold,
    color: Colors.primaryBorder,
    flex: 1,
  },
  noActivitiesContainer: {
    alignItems: 'center',
    backgroundColor: Colors.lightMuted,
    borderRadius: 16,
    justifyContent: 'center',
    marginTop: 20,
    padding: 40,
  },
  noActivitiesText: {
    ...TextStyles.body,
    color: Colors.muted,
    lineHeight: 20,
    marginTop: 12,
    textAlign: 'center',
  },
  noDatesContainer: {
    alignItems: 'center',
    backgroundColor: Colors.lightMuted,
    borderRadius: 16,
    justifyContent: 'center',
    marginTop: 20,
    padding: 40,
  },
  noDatesText: {
    ...TextStyles.body,
    color: Colors.muted,
    lineHeight: 20,
    marginTop: 12,
    textAlign: 'center',
  },
  notesCard: {
    backgroundColor: Colors.lightMuted,
    borderRadius: 12,
    gap: 8,
    padding: 16,
  },
  notesText: {
    ...TextStyles.body,
    color: Colors.primaryBorder,
    lineHeight: 22,
  },
  permanenceButton: {
    alignItems: 'center',
    backgroundColor: Colors.lightMuted,
    borderColor: Colors.primary,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  permanenceButtonText: {
    ...TextStyles.body,
    color: Colors.primary,
    fontWeight: '600',
  },
  primaryText: {
    ...TextStyles.body,
    color: Colors.primary,
    fontWeight: '600',
  },
  spacer: {
    height: 8,
  },
  statusDot: {
    borderRadius: 6,
    height: 12,
    width: 12,
  },

  timeRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },

  timeValue: {
    ...TextStyles.h3Bold,
    color: Colors.primaryBorder,
    fontSize: 18,
  },
});
