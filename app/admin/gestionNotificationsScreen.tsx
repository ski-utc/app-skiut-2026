import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Text,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import {
  Bell,
  PenLine,
  Send,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react-native';

import BoutonGestion from '@/components/admins/boutonGestion';
import {
  ApiError,
  apiGet,
  AppError,
  handleApiErrorScreen,
} from '@/constants/api/apiCalls';
import ErrorScreen from '@/components/pages/errorPage';
import BoutonRetour from '@/components/divers/boutonRetour';
import { Colors, TextStyles } from '@/constants/GraphSettings';
import { useUser } from '@/contexts/UserContext';

import Header from '../../components/header';

import { AdminStackParamList } from './adminNavigator';

type FilterButtonProps = {
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onPress: () => void;
  count?: number;
};

type NotificationItem = {
  id: number;
  title: string;
  display: boolean;
  created_at: string;
};

const FilterButton: React.FC<FilterButtonProps> = ({
  label,
  icon,
  isActive,
  onPress,
  count,
}) => (
  <TouchableOpacity
    style={[styles.filterButton, isActive && styles.filterButtonActive]}
    onPress={onPress}
  >
    <View style={styles.filterButtonContent}>
      <View style={styles.filterIcon}>{icon}</View>
      <Text
        style={[
          styles.filterButtonText,
          isActive && styles.filterButtonTextActive,
        ]}
      >
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
  const navigation = useNavigation<NavigationProp<AdminStackParamList>>();
  const { setUser } = useUser();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<
    NotificationItem[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [disableRefresh, setDisableRefresh] = useState(false);
  const [activeFilter, setActiveFilter] = useState<
    'all' | 'displayed' | 'non_displayed'
  >('all');

  const applyFilter = useCallback(
    (
      filter: 'all' | 'displayed' | 'non_displayed',
      data: NotificationItem[],
    ) => {
      switch (filter) {
        case 'displayed':
          setFilteredNotifications(data.filter((item) => item.display));
          break;
        case 'non_displayed':
          setFilteredNotifications(data.filter((item) => !item.display));
          break;
        default:
          setFilteredNotifications(data);
          break;
      }
    },
    [],
  );

  const handleFilter = useCallback(
    (filter: 'all' | 'displayed' | 'non_displayed') => {
      setActiveFilter(filter);
      applyFilter(filter, notifications);
    },
    [notifications, applyFilter],
  );

  const getFilterCounts = () => {
    return {
      all: notifications.length,
      displayed: notifications.filter((item) => item.display).length,
      non_displayed: notifications.filter((item) => !item.display).length,
    };
  };

  const fetchAdminNotifications = useCallback(async () => {
    setLoading(true);
    setDisableRefresh(true);
    try {
      const response = await apiGet<NotificationItem[]>('admin/notifications');
      if (response.success) {
        setNotifications(response.data);
        // Apply filter directly here with current state
        setFilteredNotifications(response.data);
      } else {
        handleApiErrorScreen(new ApiError(response.message), setUser, setError);
      }
    } catch (error: unknown) {
      handleApiErrorScreen(error as AppError, setUser, setError);
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
    });

    return unsubscribe;
  }, [navigation, fetchAdminNotifications]);

  // Re-apply filter when activeFilter changes
  useEffect(() => {
    applyFilter(activeFilter, notifications);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFilter]);

  if (error !== '') {
    return <ErrorScreen error={error} />;
  }

  if (loading) {
    return (
      <SafeAreaView
        style={styles.container}
        edges={['bottom', 'left', 'right']}
      >
        <Header refreshFunction={null} disableRefresh={true} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>
            Chargement des notifications...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <Header
        refreshFunction={fetchAdminNotifications}
        disableRefresh={disableRefresh}
      />
      <View style={styles.headerContainer}>
        <BoutonRetour title="Gestion des notifications" />
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
          onPress={() => navigation.navigate('createNotificationScreen')}
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
          icon={
            <CheckCircle
              size={16}
              color={activeFilter === 'all' ? Colors.white : Colors.primary}
            />
          }
          isActive={activeFilter === 'all'}
          onPress={() => handleFilter('all')}
          // count={getFilterCounts().all}
        />
        <FilterButton
          label="Affichées"
          icon={
            <AlertTriangle
              size={16}
              color={activeFilter === 'displayed' ? Colors.white : Colors.error}
            />
          }
          isActive={activeFilter === 'displayed'}
          onPress={() => handleFilter('displayed')}
          count={getFilterCounts().displayed}
        />
        <FilterButton
          label="Masquées"
          icon={
            <AlertTriangle
              size={16}
              color={
                activeFilter === 'non_displayed' ? Colors.white : Colors.muted
              }
            />
          }
          isActive={activeFilter === 'non_displayed'}
          onPress={() => handleFilter('non_displayed')}
          count={getFilterCounts().non_displayed}
        />
      </View>

      <View style={styles.list}>
        <FlatList
          data={filteredNotifications}
          renderItem={({ item }) => (
            <BoutonGestion
              title={item.title}
              subtitle={`Date : ${
                item?.created_at
                  ? new Date(item.created_at).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                    }) +
                    ' ' +
                    new Date(item.created_at).toLocaleTimeString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false,
                    })
                  : 'Date non disponible'
              } | Statut : ${item.display === true ? 'Active' : 'Désactivée'}`}
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
                {activeFilter === 'displayed'
                  ? 'Aucune notification affichée pour le moment'
                  : activeFilter === 'non_displayed'
                    ? 'Aucune notification non affichée'
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
    backgroundColor: Colors.white,
    flex: 1,
  },
  createButton: {
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 14,
    elevation: 4,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  createButtonContainer: {
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  createButtonIcon: {
    marginRight: 12,
  },
  createButtonText: {
    ...TextStyles.body,
    color: Colors.white,
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  emptyIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 40,
    height: 80,
    justifyContent: 'center',
    marginBottom: 16,
    width: 80,
  },
  emptyText: {
    ...TextStyles.body,
    color: Colors.muted,
    lineHeight: 20,
    textAlign: 'center',
  },
  emptyTitle: {
    ...TextStyles.h3Bold,
    color: Colors.primaryBorder,
    marginBottom: 8,
    textAlign: 'center',
  },
  filterBadge: {
    alignItems: 'center',
    backgroundColor: Colors.error,
    borderRadius: 10,
    height: 20,
    justifyContent: 'center',
    minWidth: 20,
    position: 'absolute',
    right: -8,
    top: -8,
  },
  filterBadgeText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  filterButton: {
    backgroundColor: Colors.white,
    borderColor: 'rgba(0,0,0,0.06)',
    borderRadius: 12,
    borderWidth: 1,
    elevation: 3,
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterButtonContent: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    position: 'relative',
  },
  filterButtonText: {
    ...TextStyles.body,
    color: Colors.primaryBorder,
    fontSize: 14,
    fontWeight: '600',
  },
  filterButtonTextActive: {
    color: Colors.white,
  },
  filterIcon: {
    marginRight: 8,
  },
  filtersContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  headerContainer: {
    paddingBottom: 8,
    paddingHorizontal: 20,
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
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  heroSubtitle: {
    ...TextStyles.body,
    color: Colors.muted,
    lineHeight: 20,
    textAlign: 'center',
  },
  heroTitle: {
    ...TextStyles.h2Bold,
    color: Colors.primaryBorder,
    marginBottom: 8,
    textAlign: 'center',
  },
  list: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    backgroundColor: Colors.white,
    flex: 1,
    justifyContent: 'center',
  },
  loadingText: {
    ...TextStyles.body,
    color: Colors.muted,
    marginTop: 16,
    textAlign: 'center',
  },
});

export default GestionNotificationsScreen;
