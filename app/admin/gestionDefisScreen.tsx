import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { Trophy, Clock, CheckCircle, Zap, ChevronRight } from 'lucide-react-native';

import BoutonRetour from '@/components/divers/boutonRetour';
import BoutonGestion from '@/components/admins/boutonGestion';
import { apiGet } from '@/constants/api/apiCalls';
import ErrorScreen from '@/components/pages/errorPage';
import { Colors, TextStyles } from '@/constants/GraphSettings';
import { useUser } from '@/contexts/UserContext';

import Header from '../../components/header';

type GestionDefisStackParamList = {
  gestionDefisScreen: undefined;
  valideDefisScreen: undefined;
  valideDefisRapide: undefined;
}

type FilterButtonProps = {
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onPress: () => void;
  count?: number;
}

type DefiItem = {
  id: number;
  valid: boolean;
  delete: boolean;
  challenge: {
    id: number;
    title: string;
  };
  user?: {
    id: number;
    firstName: string;
    lastName: string;
  };
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

const GestionDefisScreen = () => {
  const [defis, setDefis] = useState<DefiItem[]>([]);
  const [filteredDefis, setFilteredDefis] = useState<DefiItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [disableRefresh, setDisableRefresh] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'valid'>('all');

  const { setUser } = useUser();
  const navigation = useNavigation<NavigationProp<GestionDefisStackParamList>>();

  const fetchAdminDefis = useCallback(async () => {
    setLoading(true);
    setDisableRefresh(true);
    try {
      const response = await apiGet('admin/challenges');
      if (response.success) {
        setDefis(response.data);
        setFilteredDefis(response.data);
      } else {
        setError('Erreur lors de la récupération des défis');
      }
    } catch (error: unknown) {
      if (error instanceof Error && (error.message === 'NoRefreshTokenError' || 'JWT_ERROR' in error)) {
        setUser(null);
      } else if (error instanceof Error) {
        setError(error.message || 'Une erreur est survenue.');
      }
    } finally {
      setLoading(false);
      setTimeout(() => {
        setDisableRefresh(false);
      }, 5000);
    }
  }, [setUser]);

  const handleFilter = useCallback((filter: 'all' | 'pending' | 'valid') => {
    setActiveFilter(filter);
    switch (filter) {
      case 'pending':
        setFilteredDefis(defis.filter((item) => !item.valid && !item.delete));
        break;
      case 'valid':
        setFilteredDefis(defis.filter((item) => !item.delete && item.valid));
        break;
      default:
        setFilteredDefis(defis.filter((item) => !item.delete));
        break;
    }
  }, [defis]);

  const getFilterCounts = () => {
    return {
      all: defis.filter((item) => !item.delete).length,
      pending: defis.filter((item) => !item.valid && !item.delete).length,
      valid: defis.filter((item) => !item.delete && item.valid).length,
    };
  };

  useEffect(() => {
    fetchAdminDefis();
    const unsubscribe = navigation.addListener('focus', () => {
      fetchAdminDefis();
      handleFilter(activeFilter);
    });

    return unsubscribe;
  }, [navigation, fetchAdminDefis, activeFilter, handleFilter]);

  if (error !== '') {
    return <ErrorScreen error={error} />;
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header refreshFunction={null} disableRefresh={true} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Chargement des défis...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header refreshFunction={fetchAdminDefis} disableRefresh={disableRefresh} />
      <View style={styles.headerContainer}>
        <BoutonRetour title="Gestion des défis" />
      </View>

      <View style={styles.heroSection}>
        <View style={styles.heroIcon}>
          <Trophy size={24} color={Colors.primary} />
        </View>
        <Text style={styles.heroTitle}>Gestion des défis</Text>
        <Text style={styles.heroSubtitle}>
          Créez et gérez les défis pour les participants
        </Text>
      </View>

      <View style={styles.createButtonContainer}>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => navigation.navigate('valideDefisRapide')}
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
          label="Tous"
          icon={<CheckCircle size={16} color={activeFilter === 'all' ? Colors.white : Colors.primary} />}
          isActive={activeFilter === 'all'}
          onPress={() => handleFilter('all')}
        // count={getFilterCounts().all}
        />
        <FilterButton
          label="En attente"
          icon={<Clock size={16} color={activeFilter === 'pending' ? Colors.white : Colors.primary} />}
          isActive={activeFilter === 'pending'}
          onPress={() => handleFilter('pending')}
          count={getFilterCounts().pending}
        />
        <FilterButton
          label="Validés"
          icon={<Trophy size={16} color={activeFilter === 'valid' ? Colors.white : Colors.primary} />}
          isActive={activeFilter === 'valid'}
          onPress={() => handleFilter('valid')}
          count={getFilterCounts().valid}
        />
      </View>

      <View style={styles.list}>
        <FlatList
          data={filteredDefis}
          renderItem={({ item }) => (
            <BoutonGestion
              title={`Défi ${item.id} : ${item.challenge.title}`}
              subtitle={`Auteur : ${item?.user?.firstName} ${item?.user?.lastName || 'Nom inconnu'}`}
              subtitleStyle={undefined}
              nextRoute="valideDefisScreen"
              id={item.id}
              valide={item.valid}
            />
          )}
          keyExtractor={(item) => item.id.toString()}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIcon}>
                <Trophy size={48} color={Colors.lightMuted} />
              </View>
              <Text style={styles.emptyTitle}>Aucun défi trouvé</Text>
              <Text style={styles.emptyText}>
                {activeFilter === 'pending'
                  ? 'Aucun défi en attente de validation'
                  : activeFilter === 'valid'
                    ? 'Aucun défi validé pour le moment'
                    : 'Aucun défi disponible'}
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

export default GestionDefisScreen;
