import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  AppState,
  Platform,
  AppStateStatus,
} from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import {
  Trophy,
  Play,
  Square,
  Zap,
  MapPin,
  Timer,
  Gauge,
  Activity,
  TrendingUp,
  LucideProps,
} from 'lucide-react-native';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import Toast from 'react-native-toast-message';

import {
  apiPost,
  isSuccessResponse,
  isPendingResponse,
  handleApiErrorToast,
  AppError,
} from '@/constants/api/apiCalls';
import { useUser } from '@/contexts/UserContext';
import { Colors, TextStyles } from '@/constants/GraphSettings';

import BoutonRetour from '../../../components/divers/boutonRetour';
import Header from '../../../components/header';

const LOCATION_TASK_NAME = 'background-location-task';

type VitesseDeGlisseStackParamList = {
  VitesseDeGlisseMain: undefined;
  PerformancesScreen: undefined;
  UserPerformancesScreen: undefined;
};

type LocationTaskData = {
  locations: Location.LocationObject[];
};

type SessionStats = {
  startTime: number;
  totalSpeed: number;
  speedReadings: number;
  validReadings: number;
};

TaskManager.defineTask<LocationTaskData>(
  LOCATION_TASK_NAME,
  async ({ data, error }) => {
    if (error) {
      return;
    }
    if (data) {
      // const { locations } = data;
      // console.log('Loc fond:', locations.length);
    }
  },
);

export default function VitesseDeGlisseScreen() {
  const [isTracking, setIsTracking] = useState(false);
  const [distance, setDistance] = useState(0);
  const [maxSpeed, setMaxSpeed] = useState(0);
  const [averageSpeed, setAverageSpeed] = useState(0);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [trackingTime, setTrackingTime] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const prevLocationRef = useRef<Location.LocationObjectCoords | null>(null);

  const [sessionStats, setSessionStats] = useState<SessionStats>({
    startTime: 0,
    totalSpeed: 0,
    speedReadings: 0,
    validReadings: 0,
  });

  const { user, setUser } = useUser();
  const navigation =
    useNavigation<NavigationProp<VitesseDeGlisseStackParamList>>();

  const appState = useRef(AppState.currentState);
  const trackingInterval = useRef<NodeJS.Timeout | null>(null);
  const locationSubscription = useRef<Location.LocationSubscription | null>(
    null,
  );

  useEffect(() => {
    return () => {
      if (locationSubscription.current) locationSubscription.current.remove();
      if (trackingInterval.current) clearInterval(trackingInterval.current);
    };
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      (nextAppState: AppStateStatus) => {
        if (
          appState.current === 'active' &&
          nextAppState.match(/inactive|background/)
        ) {
          if (isTracking) {
            enableBackgroundLocation().catch((err) => console.warn(err));
          }
        }
        appState.current = nextAppState;
      },
    );

    return () => subscription.remove();
  }, [isTracking]);

  useEffect(() => {
    if (isTracking) {
      trackingInterval.current = setInterval(() => {
        setTrackingTime((time) => time + 1);
      }, 1000);
    } else {
      if (trackingInterval.current) {
        clearInterval(trackingInterval.current);
        trackingInterval.current = null;
      }
    }
    return () => {
      if (trackingInterval.current) clearInterval(trackingInterval.current);
    };
  }, [isTracking]);

  const enableBackgroundLocation = async () => {
    try {
      const isRegistered =
        await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);
      if (isRegistered) return;

      if (Platform.OS === 'ios') {
        const { status } = await Location.requestBackgroundPermissionsAsync();
        if (status === 'granted') {
          await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
            accuracy: Location.Accuracy.BestForNavigation,
            timeInterval: 5000,
            distanceInterval: 10,
            showsBackgroundLocationIndicator: true,
            pausesUpdatesAutomatically: false,
            activityType: Location.ActivityType.Fitness,
          });
        }
      } else if (Platform.OS === 'android') {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
            accuracy: Location.Accuracy.BestForNavigation,
            timeInterval: 5000,
            distanceInterval: 10,
            foregroundService: {
              notificationTitle: 'Suivi de glisse en cours',
              notificationBody: 'Nous enregistrons votre vitesse et distance.',
            },
          });
        }
      }
    } catch (error) {
      console.warn('Background loc error:', error);
    }
  };

  const startTracking = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      handleApiErrorToast(
        "Permission refusée pour l'accès à la localisation.",
        setUser,
      );
      return;
    }

    const newSessionId = Date.now().toString();
    setSessionId(newSessionId);
    setDistance(0);
    setMaxSpeed(0);
    setAverageSpeed(0);
    setCurrentSpeed(0);
    setTrackingTime(0);
    prevLocationRef.current = null;
    setSessionStats({
      startTime: Date.now(),
      totalSpeed: 0,
      speedReadings: 0,
      validReadings: 0,
    });

    setIsTracking(true);

    try {
      locationSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 1000,
          distanceInterval: 1,
        },
        (location) => processLocationUpdate(location),
      );
    } catch {
      handleApiErrorToast(
        'Une erreur est survenue lors du démarrage du GPS.',
        setUser,
      );
      setIsTracking(false);
    }
  };

  const processLocationUpdate = (location: Location.LocationObject) => {
    const { coords } = location;

    if (coords.accuracy && coords.accuracy > 30) return; // Avoid data with bad accuracy

    const currentSpeedKmh = Math.max(0, (coords.speed || 0) * 3.6);
    setCurrentSpeed(currentSpeedKmh);

    if (currentSpeedKmh > 150) return; // Avoid ridiculous speed

    const prevLoc = prevLocationRef.current;

    if (prevLoc) {
      const deltaDist = getDistanceFromLatLonInMeters(
        prevLoc.latitude,
        prevLoc.longitude,
        coords.latitude,
        coords.longitude,
      );

      if (deltaDist > 0 && deltaDist < 100) {
        setDistance((prev) => prev + deltaDist);

        setMaxSpeed((prev) => Math.max(prev, currentSpeedKmh));

        setSessionStats((prev) => {
          const newTotalSpeed = prev.totalSpeed + currentSpeedKmh;
          const newReadings = prev.speedReadings + 1;
          setAverageSpeed(newTotalSpeed / newReadings);

          return {
            ...prev,
            totalSpeed: newTotalSpeed,
            speedReadings: newReadings,
            validReadings: prev.validReadings + 1,
          };
        });
      }
    }

    prevLocationRef.current = coords;
  };

  const stopTracking = async () => {
    setIsTracking(false);

    if (locationSubscription.current) {
      locationSubscription.current.remove();
      locationSubscription.current = null;
    }

    try {
      const isRegistered =
        await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);
      if (isRegistered) {
        await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
      }
    } catch {
      handleApiErrorToast(
        "Une erreur est survenue lors de l'arrêt du GPS.",
        setUser,
      );
    }

    const totalDistanceKm = distance / 1000;
    const avgSpeedFinal =
      sessionStats.speedReadings > 0
        ? sessionStats.totalSpeed / sessionStats.speedReadings
        : 0;

    if (totalDistanceKm > 0.1 && trackingTime > 10) {
      try {
        const response = await apiPost('create-performance', {
          user_id: user?.id,
          speed: maxSpeed,
          distance: totalDistanceKm,
          duration: trackingTime,
          average_speed: avgSpeedFinal,
          session_id: sessionId,
        });

        if (isSuccessResponse(response)) {
          Toast.show({
            type: 'success',
            text1: 'Performance enregistrée !',
            text2: `${maxSpeed.toFixed(1)} km/h • ${totalDistanceKm.toFixed(2)} km`,
          });
        } else if (isPendingResponse(response)) {
          Toast.show({
            type: 'info',
            text1: 'Session sauvegardée (Hors ligne)',
            text2: 'Elle sera synchronisée plus tard.',
          });
        } else {
          Toast.show({
            type: 'error',
            text1: 'Erreur',
            text2: response.message || 'Echec enregistrement',
          });
        }
      } catch (err: unknown) {
        handleApiErrorToast(err as AppError, setUser);
      }
    } else {
      Toast.show({
        type: 'info',
        text1: 'Session ignorée',
        text2: 'Trop courte (< 100m ou < 10s)',
      });
    }
  };

  const getDistanceFromLatLonInMeters = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ) => {
    const R = 6371e3;
    const toRad = (val: number) => (val * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const StatCard = ({
    icon: IconComponent,
    title,
    value,
    unit,
    color = Colors.primary,
    isLive = false,
    compact = false,
  }: {
    icon: React.FC<LucideProps>;
    title: string;
    value: string;
    unit: string;
    color?: string;
    isLive?: boolean;
    compact?: boolean;
  }) => (
    <View
      style={[
        styles.statCard,
        isLive && styles.statCardLive,
        compact && styles.statCardCompact,
      ]}
    >
      <View
        style={[
          styles.statIcon,
          { backgroundColor: color },
          compact && styles.statIconCompact,
        ]}
      >
        <IconComponent size={compact ? 18 : 24} color={Colors.white} />
      </View>
      <View style={styles.statContent}>
        <Text style={[styles.statTitle, compact && styles.statTitleCompact]}>
          {title}
        </Text>
        <View style={styles.statValueContainer}>
          <Text
            style={[
              styles.statValue,
              isLive && styles.statValueLive,
              compact && styles.statValueCompact,
            ]}
          >
            {value}
          </Text>
          <Text style={[styles.statUnit, compact && styles.statUnitCompact]}>
            {unit}
          </Text>
        </View>
      </View>
    </View>
  );

  const ActionButton = ({
    onPress,
    title,
    icon: IconComponent,
    variant = 'primary',
    disabled = false,
  }: {
    onPress: () => void;
    title: string;
    icon: React.FC<LucideProps>;
    variant?: 'primary' | 'secondary';
    disabled?: boolean;
  }) => (
    <TouchableOpacity
      style={[
        styles.actionButton,
        variant === 'secondary' && styles.actionButtonSecondary,
        disabled && styles.actionButtonDisabled,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={disabled}
    >
      <View
        style={[
          styles.actionButtonIcon,
          variant === 'secondary' && styles.actionButtonIconSecondary,
        ]}
      >
        <IconComponent
          size={20}
          color={variant === 'primary' ? Colors.primary : Colors.primaryBorder}
        />
      </View>
      <Text
        style={[
          styles.actionButtonText,
          variant === 'secondary' && styles.actionButtonTextSecondary,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header refreshFunction={null} disableRefresh={true} />
      <View style={styles.headerContainer}>
        <BoutonRetour title={'Vitesse de glisse'} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroSection}>
          <View style={[styles.heroIcon, isTracking && styles.heroIconActive]}>
            <Zap size={32} color={isTracking ? Colors.white : Colors.primary} />
          </View>
          <Text style={styles.heroTitle}>
            {isTracking ? 'Enregistrement en cours...' : 'Vitesse de glisse'}
          </Text>
          {isTracking && (
            <Text style={styles.heroSubtitle}>
              Session active • {formatTime(trackingTime)}
            </Text>
          )}
        </View>

        <View style={styles.statsSection}>
          <StatCard
            icon={Activity}
            title="Vitesse actuelle"
            value={currentSpeed.toFixed(1)}
            unit="km/h"
            color={Colors.success}
            isLive={isTracking}
          />

          <View style={styles.twoColumnRow}>
            <View style={styles.halfColumn}>
              <StatCard
                icon={Zap}
                title="Vitesse max"
                value={maxSpeed.toFixed(1)}
                unit="km/h"
                color={Colors.primary}
                compact={true}
              />
            </View>
            <View style={styles.halfColumn}>
              <StatCard
                icon={TrendingUp}
                title="Vitesse moy"
                value={averageSpeed.toFixed(1)}
                unit="km/h"
                color={Colors.accent}
                compact={true}
              />
            </View>
          </View>

          <View style={styles.twoColumnRow}>
            <View style={styles.halfColumn}>
              <StatCard
                icon={MapPin}
                title="Distance"
                value={(distance / 1000).toFixed(2)}
                unit="km"
                color={Colors.primaryBorder}
                compact={true}
              />
            </View>
            <View style={styles.halfColumn}>
              <StatCard
                icon={Timer}
                title="Durée"
                value={formatTime(trackingTime)}
                unit=""
                color={Colors.muted}
                compact={true}
              />
            </View>
          </View>
        </View>

        <View style={styles.controlsSection}>
          <Text style={styles.sectionTitle}>Contrôles</Text>

          <ActionButton
            title={
              isTracking
                ? "Arrêter l'enregistrement"
                : "Commencer l'enregistrement"
            }
            icon={isTracking ? Square : Play}
            onPress={isTracking ? stopTracking : startTracking}
            variant="primary"
          />

          <ActionButton
            title="Voir le classement"
            icon={Trophy}
            onPress={() => navigation.navigate('PerformancesScreen')}
            variant="secondary"
            disabled={isTracking}
          />

          <ActionButton
            title="Mes enregistrements"
            icon={Gauge}
            onPress={() => navigation.navigate('UserPerformancesScreen')}
            variant="secondary"
            disabled={isTracking}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  actionButton: {
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 12,
    flexDirection: 'row',
    marginBottom: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  actionButtonDisabled: {
    opacity: 0.6,
  },
  actionButtonIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    marginRight: 16,
    width: 40,
  },
  actionButtonIconSecondary: {
    backgroundColor: Colors.lightMuted,
  },
  actionButtonSecondary: {
    backgroundColor: Colors.white,
    borderColor: Colors.primaryBorder,
    borderWidth: 2,
  },
  actionButtonText: {
    ...TextStyles.button,
    color: Colors.white,
    flex: 1,
    fontWeight: '600',
  },
  actionButtonTextSecondary: {
    color: Colors.primaryBorder,
  },
  container: {
    backgroundColor: Colors.white,
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  controlsSection: {
    marginBottom: 24,
  },
  halfColumn: {
    flex: 1,
    minWidth: 0,
  },
  headerContainer: {
    paddingBottom: 8,
    paddingHorizontal: 20,
    width: '100%',
  },
  heroIcon: {
    alignItems: 'center',
    backgroundColor: Colors.lightMuted,
    borderRadius: 40,
    height: 80,
    justifyContent: 'center',
    marginBottom: 16,
    width: 80,
  },
  heroIconActive: {
    backgroundColor: Colors.primary,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  heroSubtitle: {
    ...TextStyles.body,
    color: Colors.primary,
    fontWeight: '600',
    textAlign: 'center',
  },
  heroTitle: {
    ...TextStyles.h2Bold,
    color: Colors.primaryBorder,
    marginBottom: 4,
    textAlign: 'center',
  },
  sectionTitle: {
    ...TextStyles.h3Bold,
    color: Colors.primaryBorder,
    marginBottom: 16,
  },
  statCard: {
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderColor: 'rgba(0,0,0,0.06)',
    borderRadius: 14,
    borderWidth: 1,
    elevation: 3,
    flexDirection: 'row',
    overflow: 'hidden',
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
  },
  statCardCompact: {
    padding: 10,
  },
  statCardLive: {
    borderColor: Colors.success,
    borderWidth: 2,
  },
  statContent: {
    flex: 1,
  },
  statIcon: {
    alignItems: 'center',
    borderRadius: 21,
    flexShrink: 0,
    height: 42,
    justifyContent: 'center',
    marginRight: 12,
    width: 42,
  },
  statIconCompact: {
    borderRadius: 18,
    height: 36,
    marginRight: 8,
    width: 36,
  },
  statTitle: {
    ...TextStyles.body,
    color: Colors.muted,
    marginBottom: 4,
  },
  statTitleCompact: {
    ...TextStyles.small,
    marginBottom: 2,
  },
  statUnit: {
    ...TextStyles.body,
    color: Colors.primary,
    fontWeight: '600',
  },
  statUnitCompact: {
    ...TextStyles.small,
  },
  statValue: {
    ...TextStyles.h3Bold,
    color: Colors.primaryBorder,
    marginRight: 4,
  },
  statValueCompact: {
    ...TextStyles.bodyBold,
  },
  statValueContainer: {
    alignItems: 'baseline',
    flexDirection: 'row',
  },
  statValueLive: {
    color: Colors.success,
  },
  statsSection: {
    gap: 8,
    marginBottom: 16,
  },
  twoColumnRow: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
  },
});
