import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, ActivityIndicator, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { ChevronRight, Shield, MessageSquare, Trophy, Bell, Clock, Home } from 'lucide-react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';

import { apiGet, AppError, handleApiErrorScreen, handleApiErrorToast, isSuccessResponse } from '@/constants/api/apiCalls';
import BoutonRetour from '@/components/divers/boutonRetour';
import ErrorScreen from '@/components/pages/errorPage';
import { useUser } from '@/contexts/UserContext';
import { Colors, TextStyles } from '@/constants/GraphSettings';

import Header from '../../components/header';

type AdminStackParamList = {
  adminScreen: undefined;
  gestionDefisScreen: undefined;
  gestionAnecdotesScreen: undefined;
  gestionNotificationsScreen: undefined;
  gestionPermanencesScreen: undefined;
  gestionTourneeChambreScreen: undefined;
};

type BoutonAdminProps = {
  nextRoute: keyof AdminStackParamList;
  title: string;
  icon: React.ReactNode;
  description: string;
};

type AdminControl = {
  title: string;
  nextRoute: keyof AdminStackParamList;
  icon: React.ReactNode;
  description: string;
};

const BoutonAdmin: React.FC<BoutonAdminProps> = ({ nextRoute, title, icon, description }) => {
  const navigation = useNavigation<NavigationProp<AdminStackParamList>>();

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate(nextRoute)}
      style={styles.adminCard}
      activeOpacity={0.8}
    >
      <View style={styles.cardIconContainer}>
        {icon}
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardDescription}>{description}</Text>
      </View>
      <View style={styles.cardArrow}>
        <ChevronRight size={20} color={Colors.primary} />
      </View>
    </TouchableOpacity>
  );
};

const adminControls: AdminControl[] = [
  {
    title: 'Gestion des défis',
    nextRoute: 'gestionDefisScreen',
    icon: <Trophy size={24} color={Colors.primary} />,
    description: 'Créer et gérer les défis'
  },
  {
    title: 'Gestion des anecdotes',
    nextRoute: 'gestionAnecdotesScreen',
    icon: <MessageSquare size={24} color={Colors.primary} />,
    description: 'Modérer les anecdotes partagées'
  },
  {
    title: 'Gestion des notifications',
    nextRoute: 'gestionNotificationsScreen',
    icon: <Bell size={24} color={Colors.primary} />,
    description: 'Envoyer des notifications'
  },
  {
    title: 'Gestion des permanences',
    nextRoute: 'gestionPermanencesScreen',
    icon: <Clock size={24} color={Colors.primary} />,
    description: 'Planifier et gérer les permanences'
  },
  {
    title: 'Tournée des chambres',
    nextRoute: 'gestionTourneeChambreScreen',
    icon: <Home size={24} color={Colors.primary} />,
    description: 'Organiser les tournées de chambres'
  },
];

export default function Admin() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const navigation = useNavigation<NavigationProp<AdminStackParamList>>();
  const { setUser } = useUser();

  const fetchAdmin = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiGet("admin");
      if (!isSuccessResponse(response)) {
        navigation.goBack();
        handleApiErrorToast("Accès non autorisé", setUser);
        return null;
      }
    } catch (error: unknown) {
      handleApiErrorScreen(error as AppError, setUser, setError);
    } finally {
      setLoading(false);
    }
  }, [navigation, setUser]);

  useEffect(() => {
    fetchAdmin();
  }, [fetchAdmin]);

  if (error !== '') {
    return <ErrorScreen error={error} />;
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header refreshFunction={null} disableRefresh={true} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Vérification des droits...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header refreshFunction={null} disableRefresh={true} />
      <View style={styles.headerContainer}>
        <BoutonRetour title="Contrôle Admin" />
      </View>

      <View style={styles.heroSection}>
        <View style={styles.heroIcon}>
          <Shield size={32} color={Colors.primary} />
        </View>
        <Text style={styles.heroTitle}>Panel Admin</Text>
        <Text style={styles.heroSubtitle}>
          Gérez les contenus et interactions de l'application
        </Text>
      </View>

      <View style={styles.contentContainer}>
        <FlatList
          data={adminControls}
          keyExtractor={(item) => item.title}
          renderItem={({ item }) => (
            <BoutonAdmin
              nextRoute={item.nextRoute}
              title={item.title}
              icon={item.icon}
              description={item.description}
            />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  adminCard: {
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderColor: 'rgba(0,0,0,0.06)',
    borderRadius: 16,
    borderWidth: 1,
    elevation: 3,
    flexDirection: 'row',
    marginBottom: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
  },
  cardArrow: {
    alignItems: 'center',
    backgroundColor: Colors.lightMuted,
    borderRadius: 16,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  cardContent: {
    flex: 1,
  },
  cardDescription: {
    ...TextStyles.small,
    color: Colors.muted,
  },
  cardIconContainer: {
    alignItems: 'center',
    backgroundColor: Colors.lightMuted,
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    marginRight: 16,
    width: 48,
  },
  cardTitle: {
    ...TextStyles.bodyBold,
    color: Colors.primaryBorder,
    marginBottom: 4,
  },
  container: {
    backgroundColor: Colors.white,
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  headerContainer: {
    paddingBottom: 8,
    paddingHorizontal: 20,
    width: '100%',
  },
  heroIcon: {
    alignItems: 'center',
    backgroundColor: Colors.lightMuted,
    borderRadius: 32,
    height: 64,
    justifyContent: 'center',
    marginBottom: 16,
    width: 64,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 8,
    paddingHorizontal: 32,
  },
  heroSubtitle: {
    ...TextStyles.body,
    color: Colors.muted,
    lineHeight: 22,
    textAlign: 'center',
  },
  heroTitle: {
    ...TextStyles.h2Bold,
    color: Colors.primaryBorder,
    marginBottom: 8,
    textAlign: 'center',
  },
  listContainer: {
    paddingBottom: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    ...TextStyles.body,
    color: Colors.muted,
    marginTop: 16,
    textAlign: 'center',
  },
});
