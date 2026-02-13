import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ShoppingBasket,
  ShoppingBag,
  Clock,
  Package,
} from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import {
  useNavigation,
  useFocusEffect,
  NavigationProp,
} from '@react-navigation/native';

import { Colors, TextStyles } from '@/constants/GraphSettings';
import Header from '@/components/header';
import BoutonRetour from '@/components/divers/boutonRetour';
import {
  apiGet,
  apiPost,
  apiPut,
  isSuccessResponse,
  isPendingResponse,
  handleApiErrorToast,
  handleApiErrorScreen,
  AppError,
} from '@/constants/api/apiCalls';
import ArticleCard from '@/components/monoprut/articleCard';
import ErrorScreen from '@/components/pages/errorPage';
import { useUser } from '@/contexts/UserContext';

import { MonoprutStackParamList } from '../monoprutNavigator';

type RoomInfo = {
  roomNumber: string;
  name: string;
};

type PersonInfo = {
  responsible_name: string;
  room: string;
};

type Article = {
  id: number;
  product: string;
  quantity: string;
  type:
    | 'fruit'
    | 'veggie'
    | 'drink'
    | 'sweet'
    | 'snack'
    | 'dairy'
    | 'bread'
    | 'meat'
    | 'fish'
    | 'grain'
    | 'other';
  giver_room_id: number;
  receiver_room_id: number | null;
  giver_room?: RoomInfo;
  giver_info?: PersonInfo;
};

export default function MyReservationsScreen() {
  const navigation = useNavigation<NavigationProp<MonoprutStackParamList>>();
  const { setUser } = useUser();

  const [articles, setArticles] = useState<Article[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchArticles = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else setError('');

      try {
        const response = await apiGet<Article[]>('articles/received');

        if (isSuccessResponse(response)) {
          setArticles(response.data || []);
        }
      } catch (err: unknown) {
        if (isRefresh) {
          handleApiErrorToast(err, setUser);
        } else {
          handleApiErrorScreen(err, setUser, setError);
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [setUser],
  );

  useFocusEffect(
    useCallback(() => {
      if (articles.length === 0) setLoading(true);
      fetchArticles(false);
    }, [articles.length, fetchArticles]),
  );

  const handleRefresh = () => {
    fetchArticles(true);
  };

  const handleMarkAsRetrieved = async (articleId: number) => {
    try {
      const response = await apiPut(`articles/${articleId}/retrieve`, {});

      const handleSuccess = (isPending: boolean) => {
        Toast.show({
          type: isPending ? 'info' : 'success',
          text1: isPending ? 'Action sauvegardée' : 'Article récupéré !',
          text2: isPending ? 'Sera synchronisé plus tard' : 'Bon appétit !',
        });
        setArticles((prev) => prev.filter((a) => a.id !== articleId));
      };

      if (isSuccessResponse(response)) {
        handleSuccess(false);
      } else if (isPendingResponse(response)) {
        handleSuccess(true);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Erreur',
          text2: response.message || 'Action impossible',
        });
      }
    } catch (err: unknown) {
      handleApiErrorToast(err as AppError, setUser);
    }
  };

  const handleCancelReservation = async (articleId: number) => {
    try {
      const response = await apiPost(
        `articles/${articleId}/cancel-reservation`,
        {},
      );

      const handleSuccess = (isPending: boolean) => {
        Toast.show({
          type: isPending ? 'info' : 'success',
          text1: isPending ? 'Annulation sauvegardée' : 'Réservation annulée',
          text2: isPending
            ? 'Sera synchronisé plus tard'
            : "L'article est de nouveau disponible.",
        });
        setArticles((prev) => prev.filter((a) => a.id !== articleId));
      };

      if (isSuccessResponse(response)) {
        handleSuccess(false);
      } else if (isPendingResponse(response)) {
        handleSuccess(true);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Erreur',
          text2: response.message || 'Annulation impossible',
        });
      }
    } catch (err: unknown) {
      handleApiErrorToast(err as AppError, setUser);
    }
  };

  if (error) {
    return <ErrorScreen error={error} />;
  }

  if (loading && articles.length === 0) {
    return (
      <SafeAreaView
        style={styles.container}
        edges={['bottom', 'left', 'right']}
      >
        <Header refreshFunction={undefined} disableRefresh={true} />
        <View style={styles.headerContainer}>
          <BoutonRetour title="Mes réservations" />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <Header refreshFunction={handleRefresh} disableRefresh={refreshing} />
      <View style={styles.headerContainer}>
        <BoutonRetour title="Mes réservations" />
      </View>

      <View style={styles.navigationBar}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate('MonoprutScreen')}
          activeOpacity={0.7}
        >
          <ShoppingBag
            size={18}
            color={Colors.primaryBorder}
            strokeWidth={2.5}
          />
          <Text style={styles.navButtonText}>Disponibles</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navButton, styles.navButtonActive]}
          activeOpacity={0.7}
        >
          <Clock size={18} color={Colors.white} strokeWidth={2.5} />
          <Text style={[styles.navButtonText, styles.navButtonTextActive]}>
            Réservations
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate('MyOffersScreen')}
          activeOpacity={0.7}
        >
          <Package size={18} color={Colors.primaryBorder} strokeWidth={2.5} />
          <Text style={styles.navButtonText}>Propositions</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[Colors.success]}
            tintColor={Colors.success}
          />
        }
      >
        {articles.length === 0 ? (
          <View style={styles.emptyContainer}>
            <ShoppingBasket size={48} color={Colors.muted} />
            <Text style={styles.emptyTitle}>Aucune réservation</Text>
            <Text style={styles.emptyText}>
              Vous n'avez pas encore réservé d'article.
            </Text>
          </View>
        ) : (
          <View style={styles.articlesList}>
            {articles.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                onUpdate={() => fetchArticles(true)}
                showReserveButton={false}
                isReservation={true}
                onMarkAsRetrieved={handleMarkAsRetrieved}
                onCancelReservation={handleCancelReservation}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  articlesList: {
    gap: 12,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  container: {
    backgroundColor: Colors.white,
    flex: 1,
  },
  content: {
    flex: 1,
    paddingVertical: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyText: {
    ...TextStyles.body,
    color: Colors.muted,
    textAlign: 'center',
  },
  emptyTitle: {
    ...TextStyles.h3Bold,
    color: Colors.primaryBorder,
    marginBottom: 8,
    marginTop: 16,
  },
  headerContainer: {
    paddingBottom: 8,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    gap: 16,
    justifyContent: 'center',
  },
  loadingText: {
    ...TextStyles.body,
    color: Colors.muted,
  },
  navButton: {
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderColor: Colors.lightMuted,
    borderRadius: 12,
    borderWidth: 1,
    elevation: 3,
    flex: 1,
    flexDirection: 'column',
    gap: 6,
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  navButtonActive: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
    elevation: 6,
    shadowColor: Colors.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  navButtonText: {
    ...TextStyles.small,
    color: Colors.primaryBorder,
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 14,
    textAlign: 'center',
  },
  navButtonTextActive: {
    color: Colors.white,
  },
  navigationBar: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 4,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
});
