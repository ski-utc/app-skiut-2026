import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import BoutonRetour from '@/components/divers/boutonRetour';
import Header from '../../components/header';
import BoutonGestion from '@/components/admins/boutonGestion';
import { apiGet } from '@/constants/api/apiCalls';
import ErrorScreen from '@/components/pages/errorPage';
import { useUser } from '@/contexts/UserContext';
import { Colors, TextStyles } from '@/constants/GraphSettings';
import { useNavigation } from '@react-navigation/native';
import { MessageSquare, AlertTriangle, Clock, CheckCircle } from 'lucide-react-native';

interface FilterButtonProps {
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onPress: () => void;
  count?: number;
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
  const [anecdotes, setAnecdotes] = useState([]);
  const [filteredAnecdotes, setFilteredAnecdotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [disableRefresh, setDisableRefresh] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  const { setUser } = useUser();
  const navigation = useNavigation();

  const fetchAdminAnecdotes = useCallback(async () => {
    setLoading(true);
    setDisableRefresh(true);

    try {
      const response = await apiGet('getAdminAnecdotes');
      if (response.success) {
        setAnecdotes(response.data);
        setFilteredAnecdotes(response.data);
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
      setTimeout(() => {
        setDisableRefresh(false);
      }, 5000);
    }
  }, [setUser]);

  const handleFilter = (filter: string) => {
    setActiveFilter(filter);
    switch (filter) {
      case 'pending':
        setFilteredAnecdotes(anecdotes.filter((item: any) => !item.valid && !item.alert));
        break;
      case 'reported':
        setFilteredAnecdotes(anecdotes.filter((item: any) => item.nbWarns > 0));
        break;
      default:
        setFilteredAnecdotes(anecdotes);
        break;
    }
  };

  const getFilterCounts = () => {
    const pending = anecdotes.filter((item: any) => !item.valid && !item.alert).length;
    const reported = anecdotes.filter((item: any) => item.nbWarns > 0).length;
    return { pending, reported, all: anecdotes.length };
  };

  useEffect(() => {
fetchAdminAnecdotes();
    const unsubscribe = navigation.addListener('focus', () => {
      fetchAdminAnecdotes();
    });

    return unsubscribe;
  }, [navigation, fetchAdminAnecdotes]);

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
        <BoutonRetour previousRoute="adminScreen" title="Gestion des anecdotes" />
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
          keyExtractor={(item: any) => item.id.toString()}
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
    paddingBottom: 24,
    marginBottom: 16,
  },
  heroIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.lightMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  heroTitle: {
    ...TextStyles.h3Bold,
    color: Colors.primaryBorder,
    textAlign: 'center',
    marginBottom: 6,
  },
  heroSubtitle: {
    ...TextStyles.body,
    color: Colors.muted,
    textAlign: 'center',
    lineHeight: 20,
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
  listContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    ...TextStyles.bodyBold,
    color: Colors.primaryBorder,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    ...TextStyles.body,
    color: Colors.muted,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default GestionAnecdotesScreen;