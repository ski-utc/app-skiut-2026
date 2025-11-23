import { useEffect, useState, useCallback } from 'react';
import { View, FlatList, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { MessageCirclePlus } from 'lucide-react-native';

import { Colors, TextStyles } from '@/constants/GraphSettings';
import { useUser } from '@/contexts/UserContext';
import BoutonRetour from '@/components/divers/boutonRetour';
import BoutonNavigationLarge from '@/components/divers/boutonNavigationLarge';
import { apiGet, isSuccessResponse, handleApiErrorScreen, handleApiErrorToast } from '@/constants/api/apiCalls';
import ErrorScreen from '@/components/pages/errorPage';

import AnecdoteComponent from '../../components/anecdotes/anecdote';
import Header from '../../components/header';

type Anecdote = {
  id: string;
  text: string;
  room: string;
  nbLikes: number;
  liked: boolean;
  warned: boolean;
  authorId: string;
}

export default function AnecdotesScreen() {
  const [anecdotes, setAnecdotes] = useState<Anecdote[]>([]);
  const [error, setError] = useState('');

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [quantity, setQuantity] = useState(10);
  const [hasMoreData, setHasMoreData] = useState(true);

  const { setUser } = useUser();

  const fetchAnecdotes = useCallback(async (requestedQuantity: number, isIncremental: boolean) => {
    if (isIncremental) {
      setLoadingMore(true);
    } else {
      setLoading(true);
      setError('');
    }

    try {
      const response = await apiGet<Anecdote[]>(`anecdotes?quantity=${requestedQuantity}`);

      if (isSuccessResponse(response)) {
        const data = response.data || [];

        if (data.length < requestedQuantity) {
          setHasMoreData(false);
        }

        setAnecdotes(data);
      }
    } catch (err: unknown) {
      if (isIncremental) {
        handleApiErrorToast(err, setUser);
      } else {
        handleApiErrorScreen(err, setUser, setError);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [setUser]);

  useEffect(() => {
    fetchAnecdotes(10, false);
  }, [fetchAnecdotes]);

  const handleRefresh = useCallback(() => {
    setQuantity(10);
    setHasMoreData(true);
    fetchAnecdotes(10, false);
  }, [fetchAnecdotes]);

  const handleLoadMore = () => {
    if (hasMoreData && !loading && !loadingMore) {
      const newQuantity = quantity + 10;
      setQuantity(newQuantity);
      fetchAnecdotes(newQuantity, true);
    }
  };

  if (error) {
    return <ErrorScreen error={error} />;
  }

  if (loading && anecdotes.length === 0) {
    return (
      <View style={styles.container}>
        <Header refreshFunction={undefined} disableRefresh={true} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primaryBorder} />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header refreshFunction={handleRefresh} disableRefresh={loading} />

      <View style={styles.content}>
        <BoutonRetour title={'Anecdotes'} />

        <FlatList
          data={anecdotes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <AnecdoteComponent
              id={item.id}
              text={item.text}
              room={item.room}
              nbLikes={item.nbLikes}
              liked={item.liked}
              warned={item.warned}
              authorId={item.authorId}
              refresh={handleRefresh}
            />
          )}
          ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={() => (
            <View style={styles.footerContainer}>
              {loadingMore && <ActivityIndicator size="small" color={Colors.primaryBorder} />}
              <View style={styles.footerSeparator} />
            </View>
          )}
          showsVerticalScrollIndicator={false}
        />

        <BoutonNavigationLarge
          nextRoute={'anecdotesForm'}
          title={'Rédiger un potin'}
          IconComponent={MessageCirclePlus}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    flex: 1,
  },
  content: {
    backgroundColor: Colors.white,
    flex: 1,
    paddingHorizontal: 20,
    width: '100%',
  },
  footerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerSeparator: {
    height: 90
  },
  itemSeparator: {
    height: 36
  },
  loadingContainer: {
    alignItems: 'center',
    backgroundColor: Colors.white,
    flex: 1,
    justifyContent: 'center',
    width: '100%',
  },
  loadingText: {
    ...TextStyles.body,
    color: Colors.muted,
    marginTop: 16
  },
});
