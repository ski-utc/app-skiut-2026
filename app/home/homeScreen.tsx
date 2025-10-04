import { Text, View, ActivityIndicator, Image, StyleSheet, ScrollView, TouchableOpacity, Animated } from "react-native";
import { Colors, Fonts, TextStyles, loadFonts } from '@/constants/GraphSettings';
import Header from "../../components/header";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { apiPost, apiGet } from '@/constants/api/apiCalls';
import {useNavigation} from "@react-navigation/native";
import { useUser } from "@/contexts/UserContext";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { Calendar, Trophy, MessageCircle, Bug, ChevronRight, Clock, MapPin } from "lucide-react-native";
// Fallback pour LinearGradient si le module n'est pas trouvé
let LinearGradient: any;
try {
  LinearGradient = require('expo-linear-gradient').LinearGradient;
} catch (e) {
  // Fallback si expo-linear-gradient n'est pas installé
  LinearGradient = ({ children, style, ...props }: any) => (
    <View style={[style, { backgroundColor: Colors.primary }]} {...props}>
      {children}
    </View>
  );
}


// Interfaces TypeScript
interface ModernCardProps {
  title: string;
  subtitle?: string;
  description?: string;
  icon: React.ComponentType<{ size: number; color: string }>;
  gradient: string[];
  onPress?: () => void;
  delay?: number;
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ size: number; color: string }>;
  color: string;
}

// Composant de carte moderne avec accent bleu
const ModernCard: React.FC<ModernCardProps> = ({ title, subtitle, description, icon: Icon, gradient, onPress, delay = 0 }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.modernCard,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.6}
        style={styles.cardTouchable}
      >
        <View style={styles.cardContent}>
          <View style={styles.cardIconWrapper}>
            <View style={styles.iconContainer}>
              <Icon size={22} color={Colors.white} />
            </View>
          </View>
          
          <View style={styles.cardBody}>
            <Text style={styles.cardTitle}>{title}</Text>
            {subtitle && <Text style={styles.cardSubtitle}>{subtitle}</Text>}
            {description && <Text style={styles.cardDescription}>{description}</Text>}
          </View>
          
          <View style={styles.cardArrow}>
            <ChevronRight size={16} color={Colors.primary} />
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Composant de statistique avec design circulaire
const StatCard: React.FC<StatCardProps> = ({ label, value, icon: Icon, color }) => {
  return (
    <View style={styles.statCard}>
      <View style={styles.statHeader}>
        <View style={[styles.statIconContainer, { backgroundColor: Colors.primary }]}>
          <Icon size={18} color={Colors.white} />
        </View>
      </View>
      <View style={styles.statContent}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    </View>
  );
};

export default function HomeScreen() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState<any>(null);
  const [greeting, setGreeting] = useState('');

  const navigation = useNavigation();
  const { setUser, user } = useUser();
  const headerAnim = useRef(new Animated.Value(-100)).current;

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
      const response = await apiGet("getRandomData"); // Récupération des données
      if (response.success) {
        setData(response.data);
      } else {
        setError(response.message);
      }
    } catch (error : any) {
      if (error.message === 'NoRefreshTokenError' || error.JWT_ERROR) {
        setUser(null);
      } else {
        setError(error.message);
      }
    } finally {
      setLoading(false);
    }
  }, [setUser]);

  // Fonction pour générer un message de bienvenue personnalisé
  const generateGreeting = useCallback(() => {
    const hour = new Date().getHours();
    const firstName = user?.name || 'Skieur';
    
    if (hour < 12) {
      return `Bonjour ${firstName} ! ☀️`;
    } else if (hour < 18) {
      return `Bon après-midi ${firstName} ! 🎿`;
    } else {
      return `Bonsoir ${firstName} ! 🌙`;
    }
  }, [user]);

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
          await apiPost("save-token", {userToken:token});
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
      } catch (error : any) {
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

    setGreeting(generateGreeting());
    fetchData();

    // Animation du header
    Animated.timing(headerAnim, {
      toValue: 0,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [fetchData, setUser, generateGreeting]);

  if (error !== '') {
    return (
        <View style={styles.container}>
          <Header refreshFunction={fetchData} disableRefresh={false} />
          <View style={styles.errorContainer}>
            <View style={styles.welcomeContent}>
              <Text style={styles.title}>Bienvenue sur l'application Ski'UTC !</Text>
              <Text style={styles.subtitle}>Prépare-toi pour une aventure inoubliable ! 🎿</Text>
            </View>
          </View>
          <Image
              source={require("../../assets/images/oursSki.png")}
              style={styles.image}
          />
        </View>
    );
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
        <Header refreshFunction={undefined} disableRefresh={undefined}/>
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

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
      <View style={styles.container}>
        <Header refreshFunction={fetchData} disableRefresh={loading} />
        
        <ScrollView 
          style={styles.scrollContainer}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Section des statistiques avec background blanc */}
          <View style={styles.statsWrapper}>
            <View style={styles.statsSection}>
              <Text style={styles.sectionTitle}>Aperçu</Text>
              <View style={styles.statsContainer}>
                <StatCard 
                  label="Activités" 
                  value={data?.totalActivities || '...'} 
                  icon={Calendar} 
                  color={Colors.primary} 
                />
                <StatCard 
                  label="Défis" 
                  value={data?.totalChallenges || '...'} 
                  icon={Trophy} 
                  color={Colors.primary} 
                />
                <StatCard 
                  label="Anecdotes" 
                  value={data?.totalAnecdotes || '...'} 
                  icon={MessageCircle} 
                  color={Colors.primary} 
                />
              </View>
            </View>
          </View>

          {/* Section des actions avec fond gris clair */}
          <View style={styles.actionsWrapper}>
            <View style={styles.actionsSection}>
              <Text style={styles.sectionTitle}>Actions rapides</Text>
              
              {data?.closestActivity && (
                <ModernCard
                  title="Prochaine activité"
                  subtitle={data.closestActivity.text}
                  description={`${formatDate(data.closestActivity.date)} • ${data.closestActivity.startTime}`}
                  icon={Calendar}
                  gradient={[]}
                  onPress={() => (navigation as any).navigate('planningNavigator')}
                  delay={0}
                />
              )}

              {data?.randomChallenge && (
                <ModernCard
                  title="Défi à relever"
                  subtitle={data.randomChallenge}
                  description="Il est temps de montrer tes compétences !"
                  icon={Trophy}
                  gradient={[]}
                  onPress={() => (navigation as any).navigate('defisNavigator')}
                  delay={100}
                />
              )}

              {data?.bestAnecdote && (
                <ModernCard
                  title="Anecdote tendance"
                  subtitle={data.bestAnecdote}
                  description="L'histoire qui fait le buzz actuellement"
                  icon={MessageCircle}
                  gradient={[]}
                  onPress={() => (navigation as any).navigate('anecdotesNavigator')}
                  delay={200}
                />
              )}

              <ModernCard
                title="Support technique"
                subtitle="Un problème avec l'app ?"
                description="Notre équipe est là pour t'aider rapidement"
                icon={Bug}
                gradient={[]}
                onPress={() => (navigation as any).navigate('profilNavigator', { screen: 'contactScreen' })}
                delay={300}
              />
            </View>
          </View>

          {/* Espacement pour la navigation */}
          <View style={{ height: 120 }} />
        </ScrollView>
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 0,
  },
  
  // Section héro avec fond bleu
  heroSection: {
    backgroundColor: Colors.primary,
    paddingTop: 40,
    paddingBottom: 50,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  heroContent: {
    alignItems: 'center',
  },
  heroGreeting: {
    ...TextStyles.h1,
    color: Colors.white,
    marginBottom: 8,
    textAlign: 'center',
    fontSize: 30,
    fontWeight: '700',
  },
  heroSubtext: {
    ...TextStyles.body,
    color: Colors.white,
    textAlign: 'center',
    opacity: 0.9,
    fontSize: 16,
  },
  
  // Wrapper pour les statistiques
  statsWrapper: {
    backgroundColor: Colors.white,
    marginTop: -20,
    marginHorizontal: 16,
    borderRadius: 20,
    shadowColor: Colors.primaryBorder,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  statsSection: {
    padding: 24,
  },
  sectionTitle: {
    ...TextStyles.h3,
    color: Colors.primaryBorder,
    marginBottom: 20,
    fontSize: 20,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statCard: {
    alignItems: 'center',
    flex: 1,
  },
  statHeader: {
    marginBottom: 12,
  },
  statIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statContent: {
    alignItems: 'center',
  },
  statValue: {
    ...TextStyles.h2,
    color: Colors.primaryBorder,
    marginBottom: 4,
    fontSize: 28,
    fontWeight: '800',
  },
  statLabel: {
    ...TextStyles.small,
    color: Colors.gray,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '500',
  },
  
  // Wrapper pour les actions
  actionsWrapper: {
    backgroundColor: '#f8f9fa',
    marginTop: 24,
    paddingTop: 8,
  },
  actionsSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  
  // Cartes modernes avec nouveau style
  modernCard: {
    marginBottom: 12,
  },
  cardTouchable: {
    borderRadius: 18,
    overflow: 'hidden',
  },
  cardContent: {
    backgroundColor: Colors.white,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    shadowColor: Colors.primaryBorder,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f0f2f5',
  },
  cardIconWrapper: {
    marginRight: 16,
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardBody: {
    flex: 1,
    marginRight: 12,
  },
  cardTitle: {
    ...TextStyles.body,
    color: Colors.primaryBorder,
    marginBottom: 4,
    fontSize: 16,
    fontWeight: '600',
  },
  cardSubtitle: {
    ...TextStyles.small,
    color: Colors.primaryBorder,
    fontWeight: '500',
    marginBottom: 4,
    fontSize: 14,
    lineHeight: 18,
  },
  cardDescription: {
    ...TextStyles.small,
    color: Colors.gray,
    fontSize: 12,
    lineHeight: 16,
    opacity: 0.8,
  },
  cardArrow: {
    padding: 4,
  },
  
  // Page d'erreur/bienvenue
  errorContainer: {
    width: "100%",
    flex: 1,
    backgroundColor: Colors.primary + '10',
    paddingBottom: 16,
  },
  welcomeContent: {
    paddingTop: 80,
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  title: {
    ...TextStyles.h1,
    color: Colors.primaryBorder,
    marginBottom: 16,
    fontSize: 32,
    lineHeight: 40,
    textAlign: 'center',
    fontWeight: '700',
  },
  subtitle: {
    ...TextStyles.h3,
    color: Colors.gray,
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 24,
  },
  image: {
    width: "100%",
    height: 390,
    resizeMode: "cover",
    position: "absolute",
    bottom: 0,
  },
});