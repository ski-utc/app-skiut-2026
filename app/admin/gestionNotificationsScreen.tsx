import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import BoutonRetour from '@/components/divers/boutonRetour';
import Header from '../../components/header';
import BoutonGestion from '@/components/admins/boutonGestion';
import { apiGet } from '@/constants/api/apiCalls';
import { useNavigation } from '@react-navigation/native';
import ErrorScreen from '@/components/pages/errorPage';
import { Bell, PenLine, Send, CheckCircle, Clock, AlertTriangle } from 'lucide-react-native';
import { Colors, TextStyles } from '@/constants/GraphSettings';
import { useUser } from '@/contexts/UserContext';

interface FilterButtonProps {
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onPress: () => void;
  count?: number;
}

interface NotificationItem {
  id: number;
  title: string;
  display: boolean;
  created_at: string;
}

const FilterButton: React.FC<FilterButtonProps> = ({ label, icon, isActive, onPress, count }) => (
  <TouchableOpacity
    style={[styles.filterButton, isActive && styles.filterButtonActive]}
    onPress={onPress}
  >
    <View style={styles.filterButtonContent}>
      <View style={styles.filterIcon}>
        {icon}
      </View>
      <Text style={[styles.filterButtonText, isActive && styles.filterButtonTextActive]}>
        {label}
      </Text>
      {count !== undefined && count > 0 && (
        <View style={styles.filterBadge}>
          <Text style={styles.filterBadgeText}>{count}</Text>
        </View>
      )}
    </View>
  </TouchableOpacity>
);

const GestionNotificationsScreen = () => {
  const navigation = useNavigation();
  const { setUser } = useUser();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [disableRefresh, setDisableRefresh] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'displayed'>('all');

  const handleFilter = useCallback((filter: 'all' | 'active' | 'displayed') => {
    setActiveFilter(filter);
    switch (filter) {
      case 'active':
        setFilteredNotifications(notifications.filter((item) => !item.display));
        break;
      case 'displayed':
        setFilteredNotifications(notifications.filter((item) => item.display));
        break;
      default:
        setFilteredNotifications(notifications);
        break;
    }
  }, [notifications]);

  const getFilterCounts = () => {
    return {
      all: notifications.length,
      active: notifications.filter((item) => !item.display).length,
      displayed: notifications.filter((item) => item.display).length,
    };
  };

  const fetchAdminNotifications = useCallback(async () => {
    setLoading(true);
    setDisableRefresh(true);
    try {
      const response = await apiGet('admin/notifications');
      if (response.success) {
        setNotifications(response.data);
        setFilteredNotifications(response.data);
      } else {
        setError('Erreur lors de la récupération des notifications');
      }
    } catch (error: any) {
      if (error.message === 'NoRefreshTokenError' || error.JWT_ERROR) {
        setUser(null);
      } else {
        setError(error.message);
      }
    } finally {
      setLoading(false);
      setTimeout(() => {
        setDisableRefresh(false);
      }, 5000);
    }
  }, [setUser]);

  useEffect(() => {
    fetchAdminNotifications();
    const unsubscribe = navigation.addListener('focus', () => {
      fetchAdminNotifications();
      handleFilter(activeFilter);
    });

    return unsubscribe;
  }, [navigation, fetchAdminNotifications, activeFilter, handleFilter]);

  if (error !== '') {
    return <ErrorScreen error={error} />;
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header refreshFunction={null} disableRefresh={true} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Chargement des notifications...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header refreshFunction={fetchAdminNotifications} disableRefresh={disableRefresh} />
      <View style={styles.headerContainer}>
        <BoutonRetour previousRoute="adminScreen" title="Gestion des notifications" />
      </View>

      <View style={styles.heroSection}>
        <View style={styles.heroIcon}>
          <Bell size={24} color={Colors.primary} />
        </View>
        <Text style={styles.heroTitle}>Gestion des notifications</Text>
        <Text style={styles.heroSubtitle}>
          Créez et gérez les notifications pour les utilisateurs
        </Text>
      </View>

      <View style={styles.createButtonContainer}>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => (navigation as any).navigate('createNotificationScreen')}
        >
          <View style={styles.createButtonIcon}>
            <PenLine size={20} color={Colors.white} />
          </View>
          <Text style={styles.createButtonText}>Créer une notification</Text>
          <Send size={16} color={Colors.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.filtersContainer}>
        <FilterButton
          label="Toutes"
          icon={<CheckCircle size={16} color={activeFilter === 'all' ? Colors.white : Colors.primary} />}
          isActive={activeFilter === 'all'}
          onPress={() => handleFilter('all')}
        // count={getFilterCounts().all}
        />
        <FilterButton
          label="Actives"
          icon={<Clock size={16} color={activeFilter === 'active' ? Colors.white : Colors.primary} />}
          isActive={activeFilter === 'active'}
          onPress={() => handleFilter('active')}
          count={getFilterCounts().active}
        />
        <FilterButton
          label="Désactivées"
          icon={<AlertTriangle size={16} color={activeFilter === 'displayed' ? Colors.white : Colors.error} />}
          isActive={activeFilter === 'displayed'}
          onPress={() => handleFilter('displayed')}
          count={getFilterCounts().displayed}
        />
      </View>

      <View style={styles.list}>
        <FlatList
          data={filteredNotifications}
          renderItem={({ item }) => (
            <BoutonGestion
              title={item.title}
              subtitle={`Date : ${item?.created_at ? new Date(item.created_at).toLocaleDateString('fr-FR', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              }) + ' ' + new Date(item.created_at).toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
              }) : 'Date non disponible'} | Statut : ${item.display === true ? 'Active' : 'Désactivée'}`}
              subtitleStyle={undefined}
              nextRoute="valideNotificationsScreen"
              id={item.id}
              valide={item.display}
            />
          )}
          keyExtractor={(item) => item.id.toString()}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIcon}>
                <Bell size={48} color={Colors.lightMuted} />
              </View>
              <Text style={styles.emptyTitle}>Aucune notification trouvée</Text>
              <Text style={styles.emptyText}>
                {activeFilter === 'active'
                  ? 'Aucune notification active pour le moment'
                  : activeFilter === 'displayed'
                    ? 'Aucune notification désactivée'
                    : 'Aucune notification disponible'}
              </Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  loadingText: {
    ...TextStyles.body,
    color: Colors.muted,
    marginTop: 16,
    textAlign: 'center',
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  heroSection: {
    alignItems: 'center',
    paddingBottom: 24,
    paddingHorizontal: 20,
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
    marginBottom: 8,
    textAlign: 'center',
  },
  heroSubtitle: {
    ...TextStyles.body,
    color: Colors.muted,
    textAlign: 'center',
    lineHeight: 20,
  },
  createButtonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  createButton: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 4,
  },
  createButtonIcon: {
    marginRight: 12,
  },
  createButtonText: {
    ...TextStyles.body,
    color: Colors.white,
    fontWeight: '600',
    fontSize: 16,
    flex: 1,
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 8,
  },
  filterButton: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 2, height: 3 },
    shadowRadius: 5,
    elevation: 3,
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    position: 'relative',
  },
  filterIcon: {
    marginRight: 8,
  },
  filterButtonText: {
    ...TextStyles.body,
    color: Colors.primaryBorder,
    fontWeight: '600',
    fontSize: 14,
  },
  filterButtonTextActive: {
    color: Colors.white,
  },
  filterBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: Colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  list: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0,0,0,0.03)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    ...TextStyles.h3Bold,
    color: Colors.primaryBorder,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    ...TextStyles.body,
    color: Colors.muted,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default GestionNotificationsScreen;
