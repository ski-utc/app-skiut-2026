import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { MessageSquare, AlertTriangle, Clock, CheckCircle, Zap, ChevronRight } from 'lucide-react-native';

import BoutonRetour from '@/components/divers/boutonRetour';
import BoutonGestion from '@/components/admins/boutonGestion';
import { ApiError, apiGet, AppError, handleApiErrorScreen } from '@/constants/api/apiCalls';
import ErrorScreen from '@/components/pages/errorPage';
import { useUser } from '@/contexts/UserContext';
import { Colors, TextStyles } from '@/constants/GraphSettings';

import Header from '../../components/header';

import { AdminStackParamList } from './adminNavigator';

type FilterButtonProps = {
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onPress: () => void;
  count?: number;
}

type AnecdoteItem = {
  id: number;
  text: string;
  valid: boolean;
  alert: boolean;
  nbWarns: number;
  user?: {
    id: number;
    firstName: string;
    lastName: string;
  };
  room_id: number;
}

const FilterButton: React.FC<FilterButtonProps> = ({ label, icon, isActive, onPress, count }) => {
  return (
    <TouchableOpacity
      style={[styles.filterButton, isActive && styles.filterButtonActive]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.filterButtonContent}>
        {icon}
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
};

const GestionAnecdotesScreen = () => {
  const [anecdotes, setAnecdotes] = useState<AnecdoteItem[]>([]);
  const [filteredAnecdotes, setFilteredAnecdotes] = useState<AnecdoteItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [disableRefresh, setDisableRefresh] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  const { setUser } = useUser();
  const navigation = useNavigation<NavigationProp<AdminStackParamList>>();

  const fetchAdminAnecdotes = useCallback(async () => {
    setLoading(true);
    setDisableRefresh(true);

    try {
      const response = await apiGet<AnecdoteItem[]>('admin/anecdotes');
      if (response.success) {
        setAnecdotes(response.data);
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

  const handleFilter = useCallback((filter: string) => {
    setActiveFilter(filter);
    switch (filter) {
      case 'pending':
        setFilteredAnecdotes(anecdotes.filter((item) => !item.valid && !item.alert));
        break;
      case 'reported':
        setFilteredAnecdotes(anecdotes.filter((item) => item.nbWarns > 0));
        break;
      default:
        setFilteredAnecdotes(anecdotes);
        break;
    }
  }, [anecdotes]);

  const getFilterCounts = () => {
    const pending = anecdotes.filter((item) => !item.valid && !item.alert).length;
    const reported = anecdotes.filter((item) => item.nbWarns > 0).length;
    return { pending, reported, all: anecdotes.length };
  };

  useEffect(() => {
    fetchAdminAnecdotes();
    const unsubscribe = navigation.addListener('focus', () => {
      fetchAdminAnecdotes();
    });

    return unsubscribe;
  }, [navigation, fetchAdminAnecdotes]);

  useEffect(() => {
    handleFilter(activeFilter);
  }, [anecdotes, activeFilter, handleFilter]);

  if (error !== '') {
    return <ErrorScreen error={error} />;
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header refreshFunction={null} disableRefresh={true} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Chargement des anecdotes...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const counts = getFilterCounts();

  return (
    <SafeAreaView style={styles.container}>
      <Header refreshFunction={fetchAdminAnecdotes} disableRefresh={disableRefresh} />
      <View style={styles.headerContainer}>
        <BoutonRetour title="Gestion des anecdotes" />
      </View>

      <View style={styles.heroSection}>
        <View style={styles.heroIcon}>
          <MessageSquare size={24} color={Colors.primary} />
        </View>
        <Text style={styles.heroTitle}>Modération des anecdotes</Text>
        <Text style={styles.heroSubtitle}>
          Gérez et validez les anecdotes partagées par les utilisateurs
        </Text>
      </View>

      <View style={styles.createButtonContainer}>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => navigation.navigate('valideAnecdotesRapide')}
        >
          <View style={styles.createButtonIcon}>
            <Zap size={20} color={Colors.white} />
          </View>
          <Text style={styles.createButtonText}>Mode Rapide</Text>
          <ChevronRight size={16} color={Colors.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.filtersContainer}>
        <FilterButton
          label="Toutes"
          icon={<CheckCircle size={16} color={activeFilter === 'all' ? Colors.white : Colors.primary} />}
          isActive={activeFilter === 'all'}
          onPress={() => handleFilter('all')}
        // count={counts.all}
        />
        <FilterButton
          label="En attente"
          icon={<Clock size={16} color={activeFilter === 'pending' ? Colors.white : Colors.primary} />}
          isActive={activeFilter === 'pending'}
          onPress={() => handleFilter('pending')}
          count={counts.pending}
        />
        <FilterButton
          label="Signalées"
          icon={<AlertTriangle size={16} color={activeFilter === 'reported' ? Colors.white : Colors.error} />}
          isActive={activeFilter === 'reported'}
          onPress={() => handleFilter('reported')}
          count={counts.reported}
        />
      </View>

      <View style={styles.listContainer}>
        <FlatList
          data={filteredAnecdotes}
          renderItem={({ item }) => (
            <BoutonGestion
              title={`Anecdote #${item.id}`}
              subtitle={`Par ${item?.user?.firstName} ${item?.user?.lastName || 'Utilisateur inconnu'}`}
              subtitleStyle={undefined}
              nextRoute="valideAnecdotesScreen"
              id={item.id}
              valide={item.valid}
            />
          )}
          keyExtractor={(item) => item.id.toString()}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MessageSquare size={48} color={Colors.lightMuted} />
              <Text style={styles.emptyTitle}>Aucune anecdote</Text>
              <Text style={styles.emptyText}>
                Aucune anecdote ne correspond aux critères sélectionnés
              </Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
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
    paddingVertical: 60,
  },
  emptyText: {
    ...TextStyles.body,
    color: Colors.muted,
    lineHeight: 20,
    textAlign: 'center',
  },
  emptyTitle: {
    ...TextStyles.bodyBold,
    color: Colors.primaryBorder,
    marginBottom: 8,
    marginTop: 16,
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
  filtersContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 16,
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
    borderRadius: 28,
    height: 56,
    justifyContent: 'center',
    marginBottom: 12,
    width: 56,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 24,
    paddingHorizontal: 32,
  },
  heroSubtitle: {
    ...TextStyles.body,
    color: Colors.muted,
    lineHeight: 20,
    textAlign: 'center',
  },
  heroTitle: {
    ...TextStyles.h3Bold,
    color: Colors.primaryBorder,
    marginBottom: 6,
    textAlign: 'center',
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  listContent: {
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

export default GestionAnecdotesScreen;
