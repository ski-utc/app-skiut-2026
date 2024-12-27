import React from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { Colors, Fonts, loadFonts } from '@/constants/GraphSettings';
import Header from "../../components/header";
import Anecdote from '../../components/anecdotes/anecdote';
import BoutonRetour from '@/components/divers/boutonRetour';
import BoutonNavigation from '@/components/divers/boutonNavigation';
import { MessageCirclePlus } from 'lucide-react-native';
import { apiGet, apiPost } from '@/constants/api/apiCalls';
import { useEffect, useState } from 'react';

// @ts-ignore
export default function AnecdotesScreen() {
  const [anecdotes, setAnecdotes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAnecdotes = async () => {
      setLoading(true);
      try {
        const response = await apiGet('getAnecdotes');
        if (response.success) {
          setAnecdotes(response.data); 
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des anecdotes', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnecdotes();
  }, []);

  const handleLike = async (anecdoteId) => {
    try {
      const response = await apiPost('likeAnecdote', { anecdoteId });
      if (response.success) {
        setAnecdotes((prevAnecdotes) =>
          prevAnecdotes.map((anecdote) =>
            anecdote.id === anecdoteId
              ? { ...anecdote, nbLikes: anecdote.nbLikes + 1 } 
              : anecdote
          )
        );
      }
    } catch (error) {
      console.error('Erreur lors du like de l’anecdote', error);
    }
  };

  const handleWarning = async (anecdoteId) => {
    try {
      const response = await apiPost('warnAnecdote', { anecdoteId });
      if (response.success) {
        setAnecdotes((prevAnecdotes) =>
          prevAnecdotes.map((anecdote) =>
            anecdote.id === anecdoteId
              ? { ...anecdote, warn: anecdote.warn + 1 }
              : anecdote
          )
        );
      }
    } catch (error) {
      console.error('Erreur lors du warning de l’anecdote', error);
    }
  };

  return (
    <View
    style={{
      height: "100%",
      width: "100%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <Header/>
    <View style={{
      width: '100%',
      flex: 1,
      backgroundColor: Colors.white,
      paddingHorizontal: 20,
      paddingBottom: 16,
    }}>
      <BoutonRetour
        previousRoute={"homeNavigator"}
        title={"Anecdotes"}
      />
      <FlatList 
        data={anecdotes} 
        renderItem={({ item }) => (
          <Anecdote
            text={item.text}
            room={item.room}
            nbLikes={item.nbLikes}
            liked={item.liked}
            warned={item.warned}
            onLike={() => handleLike(item.id)}
            onWarning={() => handleWarning(item.id)}
          />
        )}
        keyExtractor={item => item.id.toString()}
        ItemSeparatorComponent={() => <View style={{ height: 36 }} />}
      />
      <BoutonNavigation
        nextRoute={"anecdotesForm"}
        title={"Rédiger un potin"}
        IconComponent={MessageCirclePlus}
      />
    </View>
  </View>
  );
};