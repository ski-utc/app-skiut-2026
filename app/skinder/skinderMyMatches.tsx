import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ActivityIndicator, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, TextStyles, loadFonts } from '@/constants/GraphSettings';
import Header from '../../components/header';
import { useUser } from '@/contexts/UserContext';
import BoutonRetour from '@/components/divers/boutonRetour';
import { apiGet } from '@/constants/api/apiCalls';
import ErrorScreen from '@/components/pages/errorPage';
import { MessageCircle, Heart, User, Sparkles, Eye } from 'lucide-react-native';

export default function SkinderMyMatches() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [matchedRooms, setMatchedRooms] = useState([]);
  const { setUser } = useUser();

  useEffect(() => {
    const loadAsyncFonts = async () => {
      await loadFonts();
    };
    loadAsyncFonts();
  }, []);

  const fetchMatches = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiGet('getMySkinderMatches');
      if (response.success) {
        setMatchedRooms(response.data);
      } else {
        setError(response.message || 'Une erreur est survenue lors de la récupération des matchs.');
      }
    } catch (error: any) {
      if (error.message === 'NoRefreshTokenError' || error.JWT_ERROR) {
        setUser(null);
      } else {
        setError(error.message || 'Erreur réseau.');
      }
    } finally {
      setLoading(false);
    }
  }, [setUser]);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

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

  const renderMatchItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.matchCard}>
      <View style={styles.matchIconContainer}>
        <Heart size={24} color={Colors.primary} fill={Colors.primary} />
      </View>
      <View style={styles.matchContent}>
        <Text style={styles.matchRoomNumber}>Chambre {item.roomNumber}</Text>
        {item.respRoom && (
          <Text style={styles.matchRespName}>{item.respRoom}</Text>
        )}
        <Text style={styles.matchSubtitle}>
          Allez toquer pour vous rencontrer !
        </Text>
      </View>
      <View style={styles.matchAction}>
        <Eye size={20} color={Colors.primary} />
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <User size={64} color={Colors.lightMuted} />
      <Text style={styles.emptyStateTitle}>Aucun match pour le moment</Text>
      <Text style={styles.emptyStateText}>
        Continuez à découvrir des profils pour trouver vos premiers matches !
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header refreshFunction={fetchMatches} disableRefresh={loading} />
      <View style={styles.headerContainer}>
        <BoutonRetour previousRoute={'homeNavigator'} title={'Mes Matches'} />
      </View>

      <View style={styles.content}>
        {/* Header avec titre */}
        <View style={styles.titleContainer}>
          <Sparkles size={24} color={Colors.primary} />
          <Text style={styles.pageTitle}>Vos Matches</Text>
        </View>

        {/* Liste des matches */}
        <FlatList
          data={matchedRooms}
          renderItem={renderMatchItem}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
        />
      </View>
    </View>
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  pageTitle: {
    ...TextStyles.h3,
    color: Colors.primaryBorder,
    fontWeight: '700',
  },
  listContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  matchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 14,
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
  matchIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.lightMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  matchContent: {
    flex: 1,
  },
  matchRoomNumber: {
    ...TextStyles.bodyBold,
    color: Colors.primaryBorder,
    marginBottom: 4,
  },
  matchRespName: {
    ...TextStyles.body,
    color: Colors.primary,
    marginBottom: 4,
  },
  matchSubtitle: {
    ...TextStyles.small,
    color: Colors.muted,
  },
  matchAction: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.lightMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 60,
  },
  emptyStateTitle: {
    ...TextStyles.h2,
    color: Colors.primaryBorder,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 12,
  },
  emptyStateText: {
    ...TextStyles.body,
    color: Colors.muted,
    textAlign: 'center',
    lineHeight: 22,
  },
});
