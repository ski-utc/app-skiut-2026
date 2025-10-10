import { Text, View, ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, Linking, Dimensions, Animated } from "react-native";
import { Colors, FontSizes, TextStyles, loadFonts } from '@/constants/GraphSettings';
import Header from "../../components/header";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { apiPost, apiGet } from '@/constants/api/apiCalls';
import { useNavigation } from "@react-navigation/native";
import { useUser } from "@/contexts/UserContext";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import ErrorScreen from "@/components/pages/errorPage";
import { Calendar, Trophy, MessageCircle, Bug, ChevronRight, MapPin, Thermometer, Wind, Droplets, Sun, Cloud, CloudRain, CloudSnow, Moon, CloudMoon, CloudLightning, CloudDrizzle, Eye, Zap, CloudFog, CloudMoonRain } from 'lucide-react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';

interface WeatherWidgetProps {
  weatherData: any;
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
    const iconProps = {
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

  const getHourlyData = () => {
    if (!forecast?.forecastday?.[0]?.hour) return [];

    const hours = forecast.forecastday[0].hour;
    const now = new Date();
    const currentHour = now.getHours();
    const hourlyData = [];

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
      useNativeDriver: false,
      tension: 100,
      friction: 16,
    }).start();

    gestureX.setValue(0);
    setActiveView(viewIndex);
  };

  const handleGesture = Animated.event(
    [{ nativeEvent: { translationX: gestureX } }],
    { useNativeDriver: false }
  );

  const handleGestureEnd = ({ nativeEvent }: any) => {
    const threshold = screenWidth * 0.3;

    if (nativeEvent.translationX > threshold && activeView === 1) {
      animateToView(0);
    } else if (nativeEvent.translationX < -threshold && activeView === 0) {
      animateToView(1);
    } else {
      animateToView(activeView);
    }
  };

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
    <PanGestureHandler onGestureEvent={handleGesture} onEnded={handleGestureEnd}>
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
    </PanGestureHandler>
  );
};

interface WidgetCardProps {
  title: string;
  subtitles: Array<{
    text: string;
    link?: string;
  }>;
  icon: React.ComponentType<any>;
  onPress?: () => void;
  variant?: 'primary' | 'white';
}

const WidgetCard: React.FC<WidgetCardProps> = ({
  title,
  subtitles,
  icon: IconComponent,
  onPress,
  variant = 'primary'
}) => {
  const backgroundColor = variant === 'primary' ? Colors.primary : Colors.white;
  const textColor = variant === 'primary' ? Colors.white : Colors.primaryBorder;
  const borderColor = variant === 'primary' ? Colors.primaryBorder : Colors.lightMuted;
  const iconContainerBg = variant === 'primary'
    ? 'rgba(255, 255, 255, 0.2)'
    : Colors.lightMuted;

  return (
    <TouchableOpacity
      style={[
        styles.widgetCard,
        {
          backgroundColor,
          borderColor,
          borderWidth: variant === 'primary' ? 0 : 1
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
            color={variant === 'primary' ? Colors.white : Colors.primary}
            strokeWidth={2}
          />
        </View>
        <View style={styles.widgetContent}>
          <Text style={[styles.widgetTitle, { color: textColor }]}>{title}</Text>
          {subtitles.map((subtitle: any, index: number) => (
            <Text key={index} style={[styles.widgetSubtitle, { color: textColor }]}>
              {subtitle.text}
              {subtitle.link && (
                <Text
                  style={[styles.widgetLink, { color: Colors.accent }]}
                  onPress={() => Linking.openURL(subtitle.link)}
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
  const [data, setData] = useState<any>(null);
  const [weatherData, setWeatherData] = useState<any>(null);

  const navigation = useNavigation();
  const { setUser } = useUser();

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: false,
      shouldShowAlert: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiGet("getRandomData");
      const responseWeather = await apiGet("getWeather");
      if (response.success) {
        setData(response.data);
        if (responseWeather.success) {
          setWeatherData(responseWeather.data);
        }
      } else {
        setError(response.message);
      }
    } catch (error: any) {
      if (error.message === 'NoRefreshTokenError' || error.JWT_ERROR) {
        setUser(null);
      } else {
        setError(error.message);
      }
    } finally {
      setLoading(false);
    }
  }, [setUser]);

  useEffect(() => {
    const registerForPushNotifications = async () => {
      try {
        if (Device.isDevice) {
          const { status: existingStatus } = await Notifications.getPermissionsAsync();
          let finalStatus = existingStatus;

          if (existingStatus !== "granted") {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
          }
          if (finalStatus !== "granted") {
            alert("Erreur d'accès aux notifications");
            return;
          }

          const token = (await Notifications.getExpoPushTokenAsync()).data;
          await apiPost("save-token", { userToken: token });
        } else {
          alert("Doit être utilisé sur un appareil physique pour les notifications push");
        }

        if (Platform.OS === "android") {
          Notifications.setNotificationChannelAsync("default", {
            name: "default",
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: "#FF231F7C",
          });
        }
      } catch (error: any) {
        if (error.message === 'NoRefreshTokenError' || error.JWT_ERROR) {
          setUser(null);
        }
      }
    };

    registerForPushNotifications();

    const loadAsyncFonts = async () => {
      await loadFonts();
    };
    loadAsyncFonts();

    fetchData();
  }, [fetchData, setUser]);

  if (error) {
    return (
      <ErrorScreen error={error} />
    );
  }

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

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <View style={styles.container}>
      <Header refreshFunction={null} disableRefresh={undefined} />
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {weatherData && <WeatherWidget weatherData={weatherData} />}

        {data && data.closestActivity && (
          <WidgetCard
            title={`Prochaine activité : ${data.closestActivity.text}`}
            subtitles={[
              { text: `Jour : ${formatDate(data.closestActivity.date)}` },
              { text: `Début : ${data.closestActivity.startTime}` },
              { text: `Fin : ${data.closestActivity.endTime}` },
            ]}
            icon={Calendar}
            variant="primary"
            onPress={() => (navigation as any).navigate('planningNavigator')}
          />
        )}

        {data && data.randomChallenge && (
          <WidgetCard
            title="Nouveau défi disponible !"
            subtitles={[{ text: data.randomChallenge }]}
            icon={Trophy}
            variant="white"
            onPress={() => (navigation as any).navigate('defisNavigator')}
          />
        )}

        {data && data.bestAnecdote && (
          <WidgetCard
            title="L'anecdote la plus likée"
            subtitles={[{ text: data.bestAnecdote }]}
            icon={MessageCircle}
            variant="primary"
            onPress={() => (navigation as any).navigate('anecdotesNavigator')}
          />
        )}

        <WidgetCard
          title="Signaler un bug"
          subtitles={[
            { text: "Un problème avec l'app ? Fais-nous le savoir !" },
            {
              text: 'Formulaire de retour : ',
              link: 'https://forms.gle/E8hhG7pDRqyfR8CS6',
            },
          ]}
          icon={Bug}
          variant="white"
          onPress={undefined}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },

  weatherWidget: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.lightMuted,
    shadowColor: Colors.primaryBorder,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    minHeight: 180,
  },

  weatherContainer: {
    flex: 1,
    overflow: 'hidden',
  },

  weatherSlider: {
    flexDirection: 'row',
    height: '100%',
  },

  weatherSlide: {
    flex: 1,
    justifyContent: 'center',
  },

  weatherCurrentView: {
    flex: 1,
    width: '95%',
  },
  weatherHeader: {
    marginBottom: 16,
  },
  weatherMainInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  weatherIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.lightMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  weatherTempInfo: {
    flex: 1,
  },
  weatherTemp: {
    ...TextStyles.h1,
    color: Colors.primaryBorder,
    marginBottom: 6,
    fontSize: 32,
    fontWeight: '700',
  },
  weatherCondition: {
    ...TextStyles.bodyLarge,
    color: Colors.muted,
    fontSize: FontSizes.large,
  },
  weatherLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  weatherLocationText: {
    ...TextStyles.small,
    color: Colors.muted,
    marginLeft: 4,
    fontSize: FontSizes.large,
  },
  weatherDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.lightMuted,
  },
  weatherDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  weatherDetailText: {
    ...TextStyles.small,
    color: Colors.muted,
    marginLeft: 6,
    fontSize: FontSizes.medium,
  },

  weatherHourlyView: {
    flex: 1,
    width: '90%',
  },
  weatherHourlyHeader: {
    marginBottom: 8,
    alignItems: 'center',
  },
  weatherHourlyTitle: {
    ...TextStyles.h4,
    color: Colors.primaryBorder,
    marginBottom: 8,
    fontSize: FontSizes.large,
    fontWeight: '600',
  },
  weatherHourlyGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  weatherHourlyItem: {
    flex: 1,
    alignItems: 'center',
    maxWidth: 50,
  },
  weatherHourlyTime: {
    ...TextStyles.small,
    color: Colors.muted,
    fontSize: 12,
    marginBottom: 2,
    fontWeight: '500',
  },
  weatherHourlyIcon: {
    marginBottom: 4,
    alignItems: 'center',
    justifyContent: 'center',
    height: 20,
  },
  weatherHourlyTemp: {
    ...TextStyles.small,
    color: Colors.primaryBorder,
    fontSize: 14,
    fontWeight: '600',
  },

  weatherIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  weatherIndicatorTouchable: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weatherIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  widgetCard: {
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: Colors.primaryBorder,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  widgetHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 20,
  },
  widgetIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    flexShrink: 0,
  },
  widgetContent: {
    flex: 1,
    marginRight: 8,
  },
  widgetTitle: {
    ...TextStyles.bodyBold,
    fontSize: FontSizes.large,
    marginBottom: 8,
    lineHeight: 24,
  },
  widgetSubtitle: {
    ...TextStyles.body,
    fontSize: FontSizes.medium,
    lineHeight: 20,
    marginBottom: 4,
  },
  widgetLink: {
    ...TextStyles.body,
    fontSize: FontSizes.medium,
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
  chevronIcon: {
    opacity: 0.7,
    marginTop: 2,
  },

  widgetContainer: {
    padding: 16,
    borderRadius: 16,
    marginVertical: 8,
  },
  errorContainer: {
    width: "100%",
    flex: 1,
    backgroundColor: Colors.success,
    paddingBottom: 16,
  },
  image: {
    width: "100%",
    height: 390,
    resizeMode: "cover",
    position: "absolute",
    bottom: 0,
  },
  title: {
    ...TextStyles.h1,
    paddingTop: 60,
    paddingBottom: 15,
    paddingLeft: 21,
    lineHeight: 45,
    fontSize: 35,
    textAlign: "left",
    maxWidth: "95%",
    color: Colors.white,
  },
  errorMessage: {
    ...TextStyles.h3,
    paddingLeft: 21,
    fontSize: 25,
    textAlign: "left",
    maxWidth: "90%",
    color: Colors.white,
  },
});