import { useEffect, useState, useCallback } from 'react';
import { View, FlatList, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { MessageCirclePlus } from 'lucide-react-native';

import { Colors, TextStyles } from '@/constants/GraphSettings';
import { useUser } from '@/contexts/UserContext';
import BoutonRetour from '@/components/divers/boutonRetour';
import BoutonNavigationLarge from '@/components/divers/boutonNavigationLarge';
import { apiGet } from '@/constants/api/apiCalls';
import ErrorScreen from '@/components/pages/errorPage';

import Anecdote from '../../components/anecdotes/anecdote';
import Header from '../../components/header';

type AnecdoteType = {
  id: string;
  text: string;
  room: string;
  nbLikes: number;
  liked: boolean;
  warned: boolean;
  authorId: string;
}

export default function AnecdotesScreen() {
  const [anecdotes, setAnecdotes] = useState<AnecdoteType[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [quantity, setQuantity] = useState(10);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [disableRefresh, setDisableRefresh] = useState(false);

  const { setUser } = useUser();

  const fetchAnecdotes = useCallback(async (requestedQuantity = 10, incrementalLoad = false) => {
    if (!incrementalLoad) setLoading(true);
    else setLoadingMore(true);
    setDisableRefresh(true);

    try {
      const response = await apiGet(`anecdotes?quantity=${requestedQuantity}`);
      if (response.success) {
        if (response.data.length < requestedQuantity) {
          setHasMoreData(false);
        }
        setAnecdotes(response.data);
      } else {
        setError('Une erreur est survenue lors de la récupération des anecdotes');
      }
    } catch (error: any) {
      if (error.message === 'NoRefreshTokenError' || error.JWT_ERROR) {
        setUser(null);
      } else {
        setError(error.message);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setTimeout(() => {
        setDisableRefresh(false);
      }, 5000);
    }
  }, [setUser]);

  const refreshAnecdotes = useCallback(() => {
    fetchAnecdotes(quantity, false);
  }, [fetchAnecdotes, quantity]);

  useEffect(() => {
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
    return (
      <ErrorScreen error={error} />
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <Header refreshFunction={undefined} disableRefresh={true} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primaryBorder} />
          <Text style={styles.loadingText}>
            Chargement...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View
      style={styles.container}
    >
      <Header refreshFunction={refreshAnecdotes} disableRefresh={disableRefresh} />
      <View style={styles.content} >
        <BoutonRetour title={'Anecdotes'} />
        <FlatList
          data={anecdotes}
          renderItem={({ item }) => (
            <Anecdote
              id={item.id}
              text={item.text}
              room={item.room}
              nbLikes={item.nbLikes}
              liked={item.liked}
              warned={item.warned}
              authorId={item.authorId}
              refresh={refreshAnecdotes}
              setError={setError}
            />
          )}
          keyExtractor={item => item.id}
          ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
          onEndReached={handleLoadMore}
          ListFooterComponent={() =>
            loadingMore ? <ActivityIndicator size="large" color={Colors.primaryBorder} /> : <View style={styles.footerSeparator} />
          }
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
