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
  handleApiErrorToast,
  AppError,
} from '@/constants/api/apiCalls';
import { useUser } from '@/contexts/UserContext';

type PermanencePreview = {
  id: number;
  name: string;
  description?: string;
  location?: string;
  status: string;
};

type Activity = {
  activity: string;
  time: {
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

  // Animations for modal
  const slideAnim = useRef(new Animated.Value(1000)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const activeOpacity = 1;
  const inactiveOpacity = 0.4;

  const sortActivitiesByTime = (activities: Activity[]) => {
    return activities.sort((a, b) => a.time.start.localeCompare(b.time.start));
  };

  const getDefaultDate = (map: PlanningResponse) => {
    const dates = Object.keys(map).sort();
    if (dates.length === 0) return null;

    const today = new Date().toISOString().split('T')[0];
    return dates.includes(today) ? today : dates[0];
  };

  const fetchPlanning = useCallback(async () => {
    if (Object.keys(activitiesMap).length === 0) {
      setLoading(true);
    }
    setError('');

    try {
      const response = await apiGet<PlanningResponse>('planning');

      if (isSuccessResponse(response) && response.data) {
        const sortedMap: PlanningResponse = {};

        Object.keys(response.data).forEach((date) => {
          sortedMap[date] = sortActivitiesByTime(response.data[date]);
        });

        setActivitiesMap(sortedMap);
        const dates = Object.keys(sortedMap).sort();
        setAvailableDates(dates);

        if (
          dates.length > 0 &&
          (!selectedDate || !dates.includes(selectedDate))
        ) {
          const defaultDate = getDefaultDate(sortedMap);
          if (defaultDate) setSelectedDate(defaultDate);
        }
      }
    } catch (err: unknown) {
      handleApiErrorScreen(err, setUser, setError);
    } finally {
      setLoading(false);
    }
  }, [setUser]);

  useEffect(() => {
    fetchPlanning();
  }, [fetchPlanning]);

  const handleDatePress = useCallback((date: string) => {
    setSelectedDate(date);
  }, []);

  const handlePermanencePress = useCallback(
    async (permanenceId: number) => {
      setLoadingPermanence(true);
      setShowPermanenceModal(true);

      // Animate modal opening
      slideAnim.setValue(1000);
      fadeAnim.setValue(0);
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 65,
          friction: 11,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();

      try {
        const response = await apiGet<PermanenceDetails>(
          `permanences/${permanenceId}`,
        );

        if (isSuccessResponse(response) && response.data) {
          setPermanenceDetails(response.data);
        }
      } catch (err: unknown) {
        setShowPermanenceModal(false);
        handleApiErrorToast(err as AppError, setUser);
      } finally {
        setLoadingPermanence(false);
      }
    },
    [setUser],
  );

  const closePermanenceModal = useCallback(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 1000,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowPermanenceModal(false);
      setPermanenceDetails(null);
    });
  }, [slideAnim, fadeAnim]);

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
                          {activity.time.start} - {activity.time.end}
                        </Text>
                      </View>
                    </View>

                    {activity.is_permanence && activity.permanence_data && (
                      <TouchableOpacity
                        style={styles.permanenceButton}
                        onPress={() =>
                          handlePermanencePress(activity.permanence_data!.id)
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
        animationType="none"
        transparent={true}
        onRequestClose={closePermanenceModal}
      >
        <Animated.View style={[styles.modalOverlay, { opacity: fadeAnim }]}>
          <TouchableOpacity
            style={{ flex: 1 }}
            activeOpacity={1}
            onPress={closePermanenceModal}
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.modalAnimatedContainer,
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
            style={styles.modalContainer}
          >
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderContent}>
                <HousePlus size={28} color={Colors.primary} />
                <Text style={styles.modalTitle}>
                  {permanenceDetails?.name || 'Permanence'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={closePermanenceModal}
                style={styles.closeButton}
              >
                <X size={24} color={Colors.primaryBorder} />
              </TouchableOpacity>
            </View>

            {loadingPermanence ? (
              <View style={styles.modalLoading}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={styles.loadingText}>Chargement...</Text>
              </View>
            ) : permanenceDetails ? (
              <ScrollView
                style={styles.modalContent}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.detailSection}>
                  <View style={styles.detailCard}>
                    <View style={styles.detailCardHeader}>
                      <Clock
                        size={20}
                        color={Colors.primary}
                        strokeWidth={2.5}
                      />
                      <Text style={styles.detailCardTitle}>Horaires</Text>
                    </View>
                    <View style={styles.detailCardContent}>
                      <Text style={styles.detailValue}>
                        {new Date(
                          permanenceDetails.start_datetime,
                        ).toLocaleDateString('fr-FR', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                        })}
                      </Text>
                      <View style={styles.timeRow}>
                        <Text style={styles.timeValue}>
                          {new Date(
                            permanenceDetails.start_datetime,
                          ).toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </Text>
                        <Text style={styles.detailSeparator}>→</Text>
                        <Text style={styles.timeValue}>
                          {new Date(
                            permanenceDetails.end_datetime,
                          ).toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </Text>
                      </View>
                      <View style={styles.durationBadge}>
                        <Timer
                          size={14}
                          color={Colors.primary}
                          strokeWidth={2.5}
                        />
                        <Text style={styles.durationText}>
                          {Math.floor(permanenceDetails.duration_minutes / 60)}h
                          {permanenceDetails.duration_minutes % 60 > 0 &&
                            ` ${permanenceDetails.duration_minutes % 60}min`}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {permanenceDetails.location && (
                    <View style={styles.detailCard}>
                      <View style={styles.detailCardHeader}>
                        <MapPin
                          size={20}
                          color={Colors.primary}
                          strokeWidth={2.5}
                        />
                        <Text style={styles.detailCardTitle}>Lieu</Text>
                      </View>
                      <View style={styles.detailCardContent}>
                        <Text style={styles.detailValue}>
                          {permanenceDetails.location}
                        </Text>
                      </View>
                    </View>
                  )}

                  {permanenceDetails.notes && (
                    <View style={styles.notesCard}>
                      <View style={styles.detailCardHeader}>
                        <Info
                          size={20}
                          color={Colors.primary}
                          strokeWidth={2.5}
                        />
                        <Text style={styles.detailCardTitle}>Notes</Text>
                      </View>
                      <Text style={styles.notesText}>
                        {permanenceDetails.notes}
                      </Text>
                    </View>
                  )}
                </View>
              </ScrollView>
            ) : null}
          </TouchableOpacity>
        </Animated.View>
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
  closeButton: {
    alignItems: 'center',
    backgroundColor: Colors.lightMuted,
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  container: {
    backgroundColor: Colors.white,
    flex: 1,
  },
  dateHeader: {
    marginBottom: 16,
  },
  dateTitle: {
    ...TextStyles.h3Bold,
    color: Colors.primaryBorder,
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
  detailCard: {
    backgroundColor: Colors.white,
    borderColor: Colors.lightMuted,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
    padding: 16,
  },
  detailCardContent: {
    gap: 8,
  },
  detailCardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    marginBottom: 4,
  },
  detailCardTitle: {
    ...TextStyles.bodyBold,
    color: Colors.primaryBorder,
    fontSize: 16,
  },
  detailSection: {
    gap: 16,
    paddingBottom: 20,
  },
  detailSeparator: {
    ...TextStyles.body,
    color: Colors.primary,
    fontSize: 20,
  },
  detailValue: {
    ...TextStyles.body,
    color: Colors.primaryBorder,
    lineHeight: 22,
    textTransform: 'capitalize',
  },
  durationBadge: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: Colors.lightMuted,
    borderRadius: 8,
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  durationText: {
    ...TextStyles.small,
    color: Colors.primaryBorder,
    fontWeight: '600',
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
  modalAnimatedContainer: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
  },
  modalContainer: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    elevation: 12,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
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
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  modalHeaderContent: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  modalLoading: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  modalOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  modalTitle: {
    ...TextStyles.h2Bold,
    color: Colors.primaryBorder,
    flex: 1,
    flexWrap: 'wrap',
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
