import React, { useState, useEffect, useCallback, useRef } from "react";
import { Text, View, ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, Linking, Dimensions, Animated } from "react-native";
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { Calendar, Trophy, MessageCircle, ChevronRight, MapPin, Thermometer, Wind, Droplets, Sun, Cloud, CloudRain, CloudSnow, Moon, CloudMoon, CloudLightning, CloudDrizzle, CloudFog, CloudMoonRain, Home, LucideProps } from 'lucide-react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import { apiGet, isSuccessResponse, handleApiErrorToast, AppError } from '@/constants/api/apiCalls';
import { useUser } from "@/contexts/UserContext";
import ErrorScreen from "@/components/pages/errorPage";
import { Colors, TextStyles, FontSizes } from '@/constants/GraphSettings';
import { OfflineStatusBanner, PendingRequestsWidget } from '@/components/home/offlineWidgets';

import Header from "../../components/header";
import { RootTabParamList } from '../_layout';

type WeatherCondition = {
  text: string;
  code: number;
}

type WeatherHour = {
  time: string;
  temp_c: number;
  is_day: number;
  condition: WeatherCondition;
}

type WeatherData = {
  location: {
    name: string;
  };
  current: {
    temp_c: number;
    is_day: number;
    condition: WeatherCondition;
    feelslike_c: number;
    wind_kph: number;
    humidity: number;
  };
  forecast: {
    forecastday: Array<{
      hour: WeatherHour[];
    }>;
  };
}

type Activity = {
  text: string;
  date: number;
  startTime: string;
  endTime: string;
}

type HomeData = {
  closestActivity?: Activity;
  randomChallenge?: string;
  bestAnecdote?: string;
}

type TeamMember = {
  firstName: string;
  lastName: string;
}

type TourStatus = {
  tour_active: boolean;
  rooms_before: number;
  binome: {
    members: TeamMember[];
  };
}

type WeatherWidgetProps = {
  weatherData: WeatherData;
}

type HourlyDisplayData = {
  time: string;
  temp: number;
  icon: React.JSX.Element;
  condition: string;
}

const WeatherWidget: React.FC<WeatherWidgetProps> = ({ weatherData }) => {
  const [activeView, setActiveView] = useState(0);
  const translateX = useRef(new Animated.Value(0)).current;
  const gestureX = useRef(new Animated.Value(0)).current;
  const screenWidth = Dimensions.get('window').width - 40;

  if (!weatherData || !weatherData.location || !weatherData.current) {
    return null;
  }

  const { location, current, forecast } = weatherData;

  const getWeatherIcon = (conditionCode: number, isDay: number, size: number = 24) => {
    const iconProps: LucideProps = {
      size,
      strokeWidth: 1.5,
      color: Colors.primary
    };

    if (size <= 20) {
      iconProps.color = Colors.muted;
    }

    const isDayTime = isDay === 1;

    if (conditionCode === 1000 || conditionCode === 1003) {
      return isDayTime ? <Sun {...iconProps} /> : <Moon {...iconProps} />;
    } else if (conditionCode === 1006 || conditionCode === 1009) {
      return isDayTime ? <Cloud {...iconProps} /> : <CloudMoon {...iconProps} />;
    } else if (conditionCode === 1030 || conditionCode === 1135 || conditionCode === 1147) {
      return <CloudFog {...iconProps} />;
    } else if (conditionCode >= 1063 && conditionCode <= 1066) {
      return <CloudDrizzle {...iconProps} />;
    } else if (conditionCode >= 1069 && conditionCode <= 1198) {
      return isDayTime ? <CloudRain {...iconProps} /> : <CloudMoonRain {...iconProps} />;
    } else if (conditionCode >= 1201 && conditionCode <= 1204) {
      return <CloudDrizzle {...iconProps} />;
    } else if (conditionCode >= 1207 && conditionCode <= 1207) {
      return isDayTime ? <CloudRain {...iconProps} /> : <CloudMoonRain {...iconProps} />;
    } else if (conditionCode >= 1210 && conditionCode <= 1252) {
      return <CloudSnow {...iconProps} />;
    } else if (conditionCode >= 1255 && conditionCode <= 1306) {
      return <CloudLightning {...iconProps} />;
    } else {
      return isDayTime ? <Cloud {...iconProps} /> : <CloudMoon {...iconProps} />;
    }
  };

  const getHourlyData = (): HourlyDisplayData[] => {
    if (!forecast?.forecastday?.[0]?.hour) return [];

    const hours = forecast.forecastday[0].hour;
    const now = new Date();
    const currentHour = now.getHours();
    const hourlyData: HourlyDisplayData[] = [];

    let startHour = currentHour;
    if (currentHour % 2 !== 0) {
      startHour = currentHour + 1;
    }

    for (let i = 0; i < 12; i++) {
      const hourIndex = (startHour + (i * 2)) % 24;
      const hourData = hours[hourIndex];
      if (hourData) {
        hourlyData.push({
          time: `${hourIndex.toString().padStart(2, '0')}:00`,
          temp: Math.round(hourData.temp_c),
          icon: getWeatherIcon(hourData.condition.code, hourData.is_day, 20),
          condition: hourData.condition.text
        });
      }
    }

    return hourlyData;
  };

  const animateToView = (viewIndex: number) => {
    const toValue = -viewIndex * screenWidth;

    Animated.spring(translateX, {
      toValue,
      useNativeDriver: true,
      tension: 100,
      friction: 16,
    }).start();

    gestureX.setValue(0);
    setActiveView(viewIndex);
  };

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onUpdate((e) => {
      gestureX.setValue(e.translationX);
    })
    .onEnd((e) => {
      const threshold = screenWidth * 0.25;
      const { translationX, velocityX } = e;

      if ((translationX > threshold || velocityX > 300) && activeView === 1) {
        animateToView(0);
      } else if ((translationX < -threshold || velocityX < -300) && activeView === 0) {
        animateToView(1);
      } else {
        animateToView(activeView);
      }
    });

  const renderCurrentView = () => (
    <View style={styles.weatherCurrentView}>
      <View style={styles.weatherHeader}>
        <View style={styles.weatherMainInfo}>
          <View style={styles.weatherIconContainer}>
            {getWeatherIcon(current.condition.code, current.is_day, 32)}
          </View>
          <View style={styles.weatherTempInfo}>
            <Text style={styles.weatherTemp}>{Math.round(current.temp_c)}°C</Text>
            <Text style={styles.weatherCondition}>{current.condition.text}</Text>
          </View>
        </View>
        <View style={styles.weatherLocation}>
          <MapPin size={16} color={Colors.muted} strokeWidth={2} />
          <Text style={styles.weatherLocationText}>{location.name}</Text>
        </View>
      </View>

      <View style={styles.weatherDetails}>
        <View style={styles.weatherDetailItem}>
          <Thermometer size={16} color={Colors.muted} strokeWidth={2} />
          <Text style={styles.weatherDetailText}>Ressenti {Math.round(current.feelslike_c)}°C</Text>
        </View>
        <View style={styles.weatherDetailItem}>
          <Wind size={16} color={Colors.muted} strokeWidth={2} />
          <Text style={styles.weatherDetailText}>{Math.round(current.wind_kph)} km/h</Text>
        </View>
        <View style={styles.weatherDetailItem}>
          <Droplets size={16} color={Colors.muted} strokeWidth={2} />
          <Text style={styles.weatherDetailText}>{current.humidity}%</Text>
        </View>
      </View>
    </View>
  );

  const renderHourlyView = () => {
    const hourlyData = getHourlyData();

    return (
      <View style={styles.weatherHourlyView}>
        <View style={styles.weatherHourlyHeader}>
          <Text style={styles.weatherHourlyTitle}>Prochaines 24h</Text>
        </View>

        <View style={styles.weatherHourlyGrid}>
          {hourlyData.slice(0, 6).map((hour, index) => (
            <View key={`row1-${index}`} style={styles.weatherHourlyItem}>
              <Text style={styles.weatherHourlyTime}>{hour.time}</Text>
              <View style={styles.weatherHourlyIcon}>
                {hour.icon}
              </View>
              <Text style={styles.weatherHourlyTemp}>{hour.temp}°</Text>
            </View>
          ))}
        </View>

        <View style={styles.weatherHourlyGrid}>
          {hourlyData.slice(6, 12).map((hour, index) => (
            <View key={`row2-${index}`} style={styles.weatherHourlyItem}>
              <Text style={styles.weatherHourlyTime}>{hour.time}</Text>
              <View style={styles.weatherHourlyIcon}>
                {hour.icon}
              </View>
              <Text style={styles.weatherHourlyTemp}>{hour.temp}°</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <GestureDetector gesture={panGesture}>
      <View style={styles.weatherWidget}>
        <View style={styles.weatherContainer}>
          <Animated.View
            style={[
              styles.weatherSlider,
              {
                transform: [{
                  translateX: Animated.add(translateX, gestureX)
                }],
                width: screenWidth * 2,
              }
            ]}
          >
            <View style={[styles.weatherSlide, { width: screenWidth }]}>
              {renderCurrentView()}
            </View>
            <View style={[styles.weatherSlide, { width: screenWidth }]}>
              {renderHourlyView()}
            </View>
          </Animated.View>
        </View>

        <View style={styles.weatherIndicators}>
          <TouchableOpacity
            style={styles.weatherIndicatorTouchable}
            onPress={() => animateToView(0)}
          >
            <View style={[
              styles.weatherIndicator,
              { backgroundColor: activeView === 0 ? Colors.primaryBorder : Colors.lightMuted }
            ]} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.weatherIndicatorTouchable}
            onPress={() => animateToView(1)}
          >
            <View style={[
              styles.weatherIndicator,
              { backgroundColor: activeView === 1 ? Colors.primaryBorder : Colors.lightMuted }
            ]} />
          </TouchableOpacity>
        </View>
      </View>
    </GestureDetector>
  );
};

type WidgetCardProps = {
  title: string;
  subtitles: {
    text: string;
    link?: string;
  }[];
  icon: React.FC<LucideProps>;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'white';
}

const WidgetCard: React.FC<WidgetCardProps> = ({
  title,
  subtitles,
  icon: IconComponent,
  onPress,
  variant = 'primary'
}) => {
  const backgroundColor = variant === 'primary'
    ? Colors.primary
    : variant === 'secondary'
      ? Colors.secondaryBorder
      : Colors.white;

  const textColor = variant === 'primary'
    ? Colors.white
    : variant === 'secondary'
      ? Colors.white
      : Colors.primaryBorder;

  const borderColor = variant === 'primary'
    ? Colors.primaryBorder
    : variant === 'secondary'
      ? Colors.secondaryBorder
      : Colors.lightMuted;

  const iconContainerBg = variant === 'primary' || variant === 'secondary'
    ? 'rgba(255, 255, 255, 0.2)'
    : Colors.lightMuted;

  const iconColor = variant === 'primary' || variant === 'secondary'
    ? Colors.white
    : Colors.primary;

  const widgetBorderWidth = variant === 'primary' || variant === 'secondary'
    ? 0
    : 1;

  return (
    <TouchableOpacity
      style={[
        styles.widgetCard,
        {
          backgroundColor,
          borderColor,
          borderWidth: widgetBorderWidth
        }
      ]}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.8}
    >
      <View style={styles.widgetHeader}>
        <View style={[styles.widgetIconContainer, { backgroundColor: iconContainerBg }]}>
          <IconComponent
            size={24}
            color={iconColor}
            strokeWidth={2}
          />
        </View>
        <View style={styles.widgetContent}>
          <Text style={[styles.widgetTitle, { color: textColor }]}>{title}</Text>
          {subtitles.map((subtitle, index) => (
            <Text key={index} style={[styles.widgetSubtitle, { color: textColor }]}>
              {subtitle.text}
              {subtitle.link && (
                <Text
                  style={[styles.widgetLink, { color: Colors.accent }]}
                  onPress={() => subtitle.link && Linking.openURL(subtitle.link)}
                >
                  {' '}
                  {subtitle.link}
                </Text>
              )}
            </Text>
          ))}
        </View>
        {onPress && (
          <ChevronRight
            size={20}
            color={textColor}
            style={styles.chevronIcon}
          />
        )}
      </View>
    </TouchableOpacity>
  );
};

export default function HomeScreen() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [homeData, setHomeData] = useState<HomeData | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [tourStatus, setTourStatus] = useState<TourStatus | null>(null);

  const navigation = useNavigation<NavigationProp<RootTabParamList>>();
  const { setUser } = useUser();

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const [homeRes, weatherRes, tourRes] = await Promise.all([
        apiGet<HomeData>("home/random-data"),
        apiGet<WeatherData>("home/weather"),
        apiGet<TourStatus>("room-tours/status")
      ]);

      if (isSuccessResponse(homeRes) && homeRes.data) {
        setHomeData(homeRes.data);
      }

      if (isSuccessResponse(weatherRes) && weatherRes.data) {
        setWeatherData(weatherRes.data);
      }

      if (isSuccessResponse(tourRes) && tourRes.data) {
        setTourStatus(tourRes.data);
      }

    } catch (err: unknown) {
      handleApiErrorToast(err as AppError, setUser);
    } finally {
      setLoading(false);
    }
  }, [setUser]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (error) {
    return (
      <ErrorScreen error={error} />
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <Header refreshFunction={undefined} disableRefresh={true} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primaryBorder} />
          <Text style={styles.loadingText}>
            Chargement...
          </Text>
        </View>
      </View>
    );
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <View style={styles.container}>
      <Header refreshFunction={fetchData} disableRefresh={false} />

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <OfflineStatusBanner />
        <PendingRequestsWidget />

        {weatherData && <WeatherWidget weatherData={weatherData} />}

        {tourStatus && tourStatus.tour_active && (
          <WidgetCard
            title={`Tournée des chambres en cours`}
            subtitles={
              [
                { text: `${tourStatus.binome.members[0].firstName} ${tourStatus.binome.members[0].lastName} et ${tourStatus.binome.members[1].firstName} ${tourStatus.binome.members[1].lastName} vont bientôt passer vous voir` },
                {
                  text: tourStatus.rooms_before === 0
                    ? 'Votre chambre est la prochaine sur la liste !'
                    : `${tourStatus.rooms_before} chambre${tourStatus.rooms_before !== 1 ? 's' : ''} à visiter avant la vôtre`
                },
              ]
            }
            icon={Home}
            variant="secondary"
          />
        )}

        {homeData?.closestActivity && (
          <WidgetCard
            title={`Prochaine activité : ${homeData.closestActivity.text}`}
            subtitles={[
              { text: `Jour : ${formatDate(homeData.closestActivity.date)}` },
              { text: `Début : ${homeData.closestActivity.startTime}` },
              { text: `Fin : ${homeData.closestActivity.endTime}` },
            ]}
            icon={Calendar}
            variant="primary"
            onPress={() => navigation.navigate('planningNavigator')}
          />
        )}

        {homeData?.randomChallenge && (
          <WidgetCard
            title="Nouveau défi disponible !"
            subtitles={[{ text: homeData.randomChallenge }]}
            icon={Trophy}
            variant="white"
            onPress={() => navigation.navigate('defisNavigator')}
          />
        )}

        {homeData?.bestAnecdote && (
          <WidgetCard
            title="L'anecdote la plus likée"
            subtitles={[{ text: homeData.bestAnecdote }]}
            icon={MessageCircle}
            variant="primary"
            onPress={() => navigation.navigate('anecdotesNavigator')}
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  chevronIcon: {
    marginTop: 2,
    opacity: 0.7,
  },

  container: {
    backgroundColor: Colors.white,
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 40,
    paddingHorizontal: 16,
    paddingTop: 20,
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

  scrollContainer: {
    flex: 1,
  },

  weatherCondition: {
    ...TextStyles.bodyLarge,
    color: Colors.muted,
    fontSize: FontSizes.large,
  },
  weatherContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  weatherCurrentView: {
    flex: 1,
    width: '95%',
  },
  weatherDetailItem: {
    alignItems: 'center',
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'center',
  },
  weatherDetailText: {
    ...TextStyles.small,
    color: Colors.muted,
    fontSize: FontSizes.medium,
    marginLeft: 6,
  },
  weatherDetails: {
    borderTopColor: Colors.lightMuted,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 16,
  },
  weatherHeader: {
    marginBottom: 16,
  },
  weatherHourlyGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  weatherHourlyHeader: {
    alignItems: 'center',
    marginBottom: 8,
  },
  weatherHourlyIcon: {
    alignItems: 'center',
    height: 20,
    justifyContent: 'center',
    marginBottom: 4,
  },
  weatherHourlyItem: {
    alignItems: 'center',
    flex: 1,
    maxWidth: 50,
  },

  weatherHourlyTemp: {
    ...TextStyles.small,
    color: Colors.primaryBorder,
    fontSize: 14,
    fontWeight: '600',
  },
  weatherHourlyTime: {
    ...TextStyles.small,
    color: Colors.muted,
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 2,
  },
  weatherHourlyTitle: {
    ...TextStyles.h4Bold,
    color: Colors.primaryBorder,
    fontSize: FontSizes.large,
    marginBottom: 8,
  },
  weatherHourlyView: {
    flex: 1,
    width: '90%',
  },
  weatherIconContainer: {
    alignItems: 'center',
    backgroundColor: Colors.lightMuted,
    borderRadius: 28,
    height: 56,
    justifyContent: 'center',
    marginRight: 16,
    width: 56,
  },
  weatherIndicator: {
    borderRadius: 3,
    height: 6,
    width: 6,
  },
  weatherIndicatorTouchable: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  weatherIndicators: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },

  weatherLocation: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  weatherLocationText: {
    ...TextStyles.small,
    color: Colors.muted,
    fontSize: FontSizes.large,
    marginLeft: 4,
  },
  weatherMainInfo: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 24,
  },

  weatherSlide: {
    flex: 1,
    justifyContent: 'center',
  },
  weatherSlider: {
    flexDirection: 'row',
    height: '100%',
  },
  weatherTemp: {
    ...TextStyles.h1Bold,
    color: Colors.primaryBorder,
    fontSize: 32,
    marginBottom: 6,
  },
  weatherTempInfo: {
    flex: 1,
  },
  weatherWidget: {
    backgroundColor: Colors.white,
    borderColor: Colors.lightMuted,
    borderRadius: 20,
    borderWidth: 1,
    elevation: 3,
    marginBottom: 24,
    minHeight: 180,
    padding: 20,
    shadowColor: Colors.primaryBorder,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  widgetCard: {
    borderRadius: 16,
    elevation: 3,
    marginBottom: 16,
    shadowColor: Colors.primaryBorder,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  widgetContent: {
    flex: 1,
    marginRight: 8,
  },

  widgetHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    padding: 20,
  },
  widgetIconContainer: {
    alignItems: 'center',
    borderRadius: 24,
    flexShrink: 0,
    height: 48,
    justifyContent: 'center',
    marginRight: 16,
    width: 48,
  },
  widgetLink: {
    ...TextStyles.body,
    fontSize: FontSizes.medium,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  widgetSubtitle: {
    ...TextStyles.body,
    fontSize: FontSizes.medium,
    lineHeight: 20,
    marginBottom: 4,
  },
  widgetTitle: {
    ...TextStyles.bodyBold,
    fontSize: FontSizes.large,
    lineHeight: 24,
    marginBottom: 8,
  },
});
