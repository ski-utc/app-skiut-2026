import React, { useEffect, useState } from 'react';
import { View, FlatList, ActivityIndicator } from 'react-native';
import { Colors, Fonts, loadFonts } from '@/constants/GraphSettings';
import Header from '../../components/header';
import { useUser } from '@/contexts/UserContext';
import Anecdote from '../../components/anecdotes/anecdote';
import BoutonRetour from '@/components/divers/boutonRetour';
import BoutonNavigation from '@/components/divers/boutonNavigation';
import { MessageCirclePlus } from 'lucide-react-native';
import { apiPost } from '@/constants/api/apiCalls';
import ErrorScreen from '@/components/pages/errorPage';

export default function AnecdotesScreen() {
  const [anecdotes, setAnecdotes] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [quantity, setQuantity] = useState(10);
  const [hasMoreData, setHasMoreData] = useState(true); 
  const [disableRefresh, setDisableRefresh] = useState(false);

  const { setUser } = useUser();

  const fetchAnecdotes = async (incrementalLoad = false) => {
    if (!incrementalLoad) setLoading(true);
    else setLoadingMore(true);
    setDisableRefresh(true);

    try {
      const response = await apiPost('getAnecdotes', { 'quantity': quantity });
      if (response.success) {
        if (response.data.length < quantity) {
          setHasMoreData(false); 
        }
        setAnecdotes(response.data); 
      } else {
        setError('Une erreur est survenue lors de la récupération des anecdotes');
      }
    } catch (error) {
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
  };

  useEffect(() => {
    const loadAsyncFonts = async () => {
      await loadFonts();
    };
    loadAsyncFonts();

    fetchAnecdotes();
  }, []);

  const handleLoadMore = () => {
    if (hasMoreData && !loading && !loadingMore) {
      setQuantity(prev => prev + 10);
      fetchAnecdotes(true);
    }
  };

  if (error != '') {
    return <ErrorScreen error={error} />;
  }

  if (loading) {
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
        <Header />
        <View
          style={{
            width: '100%',
            flex: 1,
            backgroundColor: Colors.white,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <ActivityIndicator size="large" color={Colors.gray} />
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
      <Header refreshFunction={fetchAnecdotes} disableRefresh={disableRefresh}/>
      <View
        style={{
          width: '100%',
          flex: 1,
          backgroundColor: Colors.white,
          paddingHorizontal: 20,
          paddingBottom: 16,
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
              refresh={fetchAnecdotes}
              setError={setError}
            />
          )}
          keyExtractor={item => item.id}
          ItemSeparatorComponent={() => <View style={{ height: 36 }} />}
          onEndReached={handleLoadMore} 
          ListFooterComponent={() =>
            loadingMore ? <ActivityIndicator size="large" color={Colors.gray} /> : <View style={{height:25}}/>
          }
        />
        <BoutonNavigation
          nextRoute={'anecdotesForm'}
          title={'Rédiger un potin'}
          IconComponent={MessageCirclePlus}
        />
      </View>
    </View>
  );
}
