import React, {useState, useEffect} from 'react';
import { apiGetPublic } from '@/constants/api/apiCalls';
import { View, FlatList, Text, ActivityIndicator } from 'react-native';
import { Colors, Fonts } from '@/constants/GraphSettings';
import Header from "../../components/header";
import Anecdote from '../../components/anecdotes/anecdote';
import BoutonRetour from '@/components/divers/boutonRetour';
import BoutonNavigation from '@/components/divers/boutonNavigation';
import { MessageCirclePlus } from 'lucide-react-native';

// @ts-ignore
export default function AnecdotesScreen() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [anecdotes, setAnecdotes] = useState<{ message: string } | null>(null);
  
    useEffect(() => {
      const fetchData = async () => {
        try {
          setLoading(true);
          const response = await apiGetPublic("getAnecdotes");
          setAnecdotes(response);
        } catch (err) {
          setError(err as Error);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    
      const interval = setInterval(() => {
        fetchData().catch((err) => setError(err));
      }, 300000);
    
      return () => clearInterval(interval);
    }, []);
    
    console.log(anecdotes);

  /* - - - - - - - - - - - - - Page en cas d'erreur - - - - - - - - - - - - - */
  if (error) {
    return (
      <View
        style={{
          width: '100%',
          flex: 1,
          backgroundColor: Colors.white,
          paddingHorizontal: 20,
          paddingBottom: 16,
        }}
      >
        <Header />
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
          <Text 
            style={{ 
              fontSize: 32,
              textAlign: "center",
              maxWidth: "90%",
              color: Colors.black,
              fontFamily: Fonts.Title.Bold,            
            }}>
              Erreur: 
          </Text>
          <Text 
            style={{ 
              fontSize: 20,
              textAlign: "center",
              maxWidth: "90%",
              color: Colors.black,
              fontFamily: Fonts.Text.Medium,            
            }}>
              {error?.message || "Une erreur est survenue"}
          </Text>
        </View>
      </View>
    );
  }

  /* - - - - - - - - - - - - - Page de chargement - - - - - - - - - - - - - */
  if (loading) {
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
        <Header />
        <View
          style={{
            width: '100%',
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: Colors.white,
            paddingHorizontal: 20,
            paddingBottom: 16,
          }}
        >
          <ActivityIndicator
            size="large"
            color={Colors.black}
          />
        </View>
      </View>
    );
  }

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
            like={item.like} 
            nbLikes={item.nbLikes} 
            warn={item.warn} 
          />
        )}
        keyExtractor={item => item.id.toString()}
        ItemSeparatorComponent={() => <View style={{ height: 36 }} />}
        style={{marginBottom: 8}}
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