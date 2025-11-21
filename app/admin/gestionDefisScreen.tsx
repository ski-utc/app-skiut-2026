import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import BoutonRetour from '@/components/divers/boutonRetour';
import Header from '../../components/header';
import BoutonGestion from '@/components/admins/boutonGestion';
import { apiGet } from '@/constants/api/apiCalls';
import ErrorScreen from '@/components/pages/errorPage';
import { Colors, TextStyles } from '@/constants/GraphSettings';
import { useUser } from '@/contexts/UserContext';
import { useNavigation } from '@react-navigation/native';
import { Trophy, Clock, CheckCircle, Zap, ChevronRight } from 'lucide-react-native';

interface FilterButtonProps {
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onPress: () => void;
  count?: number;
}

interface DefiItem {
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
  const navigation = useNavigation();

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
        <BoutonRetour previousRoute="adminScreen" title="Gestion des défis" />
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
          onPress={() => (navigation as any).navigate('valideDefisRapide')}
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

export default GestionDefisScreen;
