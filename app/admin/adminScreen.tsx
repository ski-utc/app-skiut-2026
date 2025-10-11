import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, ActivityIndicator, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { apiGet } from '@/constants/api/apiCalls';
import BoutonRetour from '@/components/divers/boutonRetour';
import Header from '../../components/header';
import ErrorScreen from '@/components/pages/errorPage';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '@/contexts/UserContext';
import { Colors, TextStyles, loadFonts } from '@/constants/GraphSettings';
import { ChevronRight, Shield, MessageSquare, Trophy, Bell } from 'lucide-react-native';

interface BoutonAdminProps {
  nextRoute: string;
  title: string;
  icon: React.ReactNode;
  description: string;
}

const BoutonAdmin: React.FC<BoutonAdminProps> = ({ nextRoute, title, icon, description }) => {
  const navigation = useNavigation();

  const onPress = () => {
    (navigation as any).navigate(nextRoute);
  };

  return (
    <TouchableOpacity onPress={onPress} style={styles.adminCard} activeOpacity={0.8}>
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

const adminControls = [
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
];

export default function Admin() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const navigation = useNavigation();
  const { setUser } = useUser();

  const fetchAdmin = useCallback(async () => {
    setLoading(true);

    try {
      const response = await apiGet("admin");
      if (!response.success) {
        navigation.goBack();
        return null;
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
  }, [navigation, setUser]);

  useEffect(() => {
    const loadAsyncFonts = async () => {
      await loadFonts();
    };
    loadAsyncFonts();

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
        <BoutonRetour previousRoute="homeNavigator" title="Contrôle Admin" />
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
          keyExtractor={(item, index) => index.toString()}
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
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  headerContainer: {
    width: '100%',
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    ...TextStyles.body,
    color: Colors.muted,
    marginTop: 16,
    textAlign: 'center',
  },
  heroSection: {
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingBottom: 8,
    marginBottom: 16,
  },
  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.lightMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    ...TextStyles.h2Bold,
    color: Colors.primaryBorder,
    textAlign: 'center',
    marginBottom: 8,
  },
  heroSubtitle: {
    ...TextStyles.body,
    color: Colors.muted,
    textAlign: 'center',
    lineHeight: 22,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  listContainer: {
    paddingBottom: 20,
  },
  adminCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 2, height: 3 },
    shadowRadius: 5,
    elevation: 3,
    marginBottom: 12,
    padding: 16,
  },
  cardIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.lightMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    ...TextStyles.bodyBold,
    color: Colors.primaryBorder,
    marginBottom: 4,
  },
  cardDescription: {
    ...TextStyles.small,
    color: Colors.muted,
  },
  cardArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.lightMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
