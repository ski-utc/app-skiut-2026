import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { Colors, Fonts } from '@/constants/GraphSettings';
import Header from '../../components/header';
import Banner from '@/components/divers/bannièreReponse';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '@/contexts/UserContext';
import Anecdote from '../../components/anecdotes/anecdote';
import BoutonRetour from '@/components/divers/boutonRetour';
import BoutonNavigation from '@/components/divers/boutonNavigation';
import { MessageCirclePlus } from 'lucide-react-native';
import { apiPost } from '@/constants/api/apiCalls';

export default function AnecdotesScreen() {
  const [anecdotes, setAnecdotes] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [quantity, setQuantity] = useState(10);
  const [hasMoreData, setHasMoreData] = useState(true); 
  const [responseMessage, setResponseMessage] = useState('');
  const [responseSuccess, setResponseSuccess] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  const navigation = useNavigation();
  const { setUser } = useUser();

  const fetchAnecdotes = async (incrementalLoad = false) => {
    if (!incrementalLoad) setLoading(true);
    else setLoadingMore(true);

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
      if (error.name === 'JWTError') {
        setUser(null);
      } else {
        setError(error.message);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchAnecdotes();
  }, []);

  const handleLoadMore = () => {
    if (hasMoreData && !loading && !loadingMore) {
      setQuantity(prev => prev + 10);
      fetchAnecdotes(true);
    }
  };

  if (error !== '') {
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
          <Text
            style={{
              color: Colors.black,
              fontSize: 32,
              fontFamily: Fonts.Inter.Basic,
              fontWeight: '800',
              padding: 10,
              textAlign: 'center',
            }}
          >
            Une erreur est survenue...
          </Text>
          <Text
            style={{
              color: Colors.black,
              fontSize: 20,
              fontFamily: Fonts.Inter.Basic,
              fontWeight: '400',
              padding: 10,
              paddingBottom: 32,
              textAlign: 'center',
            }}
          >
            {error}
          </Text>
          <Text
            style={{
              color: Colors.black,
              fontSize: 16,
              fontFamily: Fonts.Inter.Italic,
              fontWeight: '400',
              padding: 16,
              textAlign: 'center',
            }}
          >
            Merci de contacter Louise Caignaert ou Mathis Delmaere
          </Text>
        </View>
      </View>
    );
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
      <Banner message={responseMessage} success={responseSuccess} show={showBanner}/>
      <Header />
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
              setError={setError}
              setResponseMessage={setResponseMessage}
              setResponseSuccess={setResponseSuccess}
              setShowBanner={setShowBanner}
            />
          )}
          keyExtractor={item => item.id}
          ItemSeparatorComponent={() => <View style={{ height: 36 }} />}
          onEndReached={handleLoadMore} 
          ListFooterComponent={() =>
            loadingMore && <ActivityIndicator size="small" color={Colors.gray} />
          }
        />
        <View style={{height:20}}></View>
        <BoutonNavigation
          nextRoute={'anecdotesForm'}
          title={'Rédiger un potin'}
          IconComponent={MessageCirclePlus}
        />
      </View>
    </View>
  );
}
