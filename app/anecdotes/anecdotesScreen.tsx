import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, ActivityIndicator, Text } from 'react-native';
import { Colors, TextStyles, loadFonts } from '@/constants/GraphSettings';
import Header from '../../components/header';
import { useUser } from '@/contexts/UserContext';
import Anecdote from '../../components/anecdotes/anecdote';
import BoutonRetour from '@/components/divers/boutonRetour';
import BoutonNavigationLarge from '@/components/divers/boutonNavigationLarge';
import { MessageCirclePlus } from 'lucide-react-native';
import { apiPost } from '@/constants/api/apiCalls';
import ErrorScreen from '@/components/pages/errorPage';

interface AnecdoteType {
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
      const response = await apiPost('getAnecdotes', { 'quantity': requestedQuantity });
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
    const loadAsyncFonts = async () => {
      await loadFonts();
    };
    loadAsyncFonts();

    fetchAnecdotes(10, false);
  }, []);

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

  return (
    <View
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Header refreshFunction={refreshAnecdotes} disableRefresh={disableRefresh} />
      <View
        style={{
          width: '100%',
          flex: 1,
          backgroundColor: Colors.white,
          paddingHorizontal: 20,
        }}
      >
        <BoutonRetour previousRoute={'homeNavigator'} title={'Anecdotes'} />
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
          ItemSeparatorComponent={() => <View style={{ height: 36 }} />}
          onEndReached={handleLoadMore}
          ListFooterComponent={() =>
            loadingMore ? <ActivityIndicator size="large" color={Colors.primaryBorder} /> : <View style={{ height: 90 }} />
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
