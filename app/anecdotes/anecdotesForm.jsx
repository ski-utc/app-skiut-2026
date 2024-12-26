import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import Checkbox from 'expo-checkbox';
import { Colors, Fonts, loadFonts } from '@/constants/GraphSettings';
import Header from "../../components/header";
import { useNavigation } from '@react-navigation/native';
import { useUser } from '@/contexts/UserContext';
import BoutonRetour from '@/components/divers/boutonRetour';
import { Send } from 'lucide-react-native';
import { apiPost } from '@/constants/api/apiCalls';
import Banner from '@/components/divers/bannièreReponse';

// @ts-ignore
export default function AnecdotesForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [text, setText] = useState('');
  const [isChecked, setChecked] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');
  const [showBanner, setShowBanner] = useState(false);

  const navigation = useNavigation();
  const { setUser } = useUser();

  const sendAnecdotes = async () => {
    setLoading(true);
    try {
      let response = await apiPost("sendAnecdote", {
        texte: text
      });
      if (response.success === true) {
        setResponseMessage(response.message);
        setShowBanner(true);
        setTimeout(() => setShowBanner(false), 5000);
        navigation.navigate("anecdotesScreen");
      } else {
        setLoading(false);
        setResponseMessage(response.message);
        setShowBanner(true);
        setTimeout(() => setShowBanner(false), 5000);
      }
    } catch (err) {
      if (err.name === "JWTError") {
        setUser(null);
      } else {
        setError(err.message);
      }
    }
  };

  if(error!='') {
    return(
      <View>
        <Text>Erreur:</Text>
        <Text>{error}</Text>
      </View>
    )
  }

  if(loading) {
    return(
      <View>
        <ActivityIndicator size="large"/>
      </View>
    )
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
    <Banner message={responseMessage} show={showBanner}/>
    <Header/>
    <View style={{
      width: '100%',
      flex: 1,
      backgroundColor: Colors.white,
      paddingHorizontal: 20,
      paddingBottom: 16,
    }}>
      <BoutonRetour
        previousRoute={"anecdotesScreen"}
        title={"Raconte nous ta meilleure anecdote !"}
      />
      <View
        style={{
          padding: 14,
          marginBottom: 8,
          height: 268,
          backgroundColor: '#F8F8F8',
          borderRadius: 12, 
          borderWidth: 1,
          borderColor: '#EAEAEA',
          flexDirection: 'column', 
          justifyContent: 'flex-start', 
          alignItems: 'flex-start', 
          gap: 8, 
        }}
      >
        <TextInput
          style={{
            color: Colors.black,
            fontFamily: Fonts.Inter.Basic,
            fontWeight: '500',
            width: '100%',
            fontSize: 14
          }}
          placeholder="Aujourd'hui..."
          placeholderTextColor={'#969696'}
          multiline={true}
          numberOfLines={15}
          onChangeText={(value) => setText(String(value))}
          value={text}
        />
      </View>
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start', 
        alignItems: 'center', 
        gap: 11, 
        display: 'row',
      }}>
        <Checkbox
          style={{ width: 24, height: 24 }}
          value={isChecked}
          onValueChange={setChecked}
          color={isChecked ? Colors.orange : undefined}
        />
        <Text style={{
          color: Colors.black,
          fontSize: 12,
          fontFamily: Fonts.Inter.Basic,
          fontWeight: '500',
          paddingRight: 20,
        }}>
          En postant ce potin, je certifie qu’il respecte les autres participant.e.s du voyage
        </Text>
      </View>
    </View>
    <View
        style={{
          width:'100%',
          position: 'absolute',
          right: 0,
          bottom: 16,
          paddingHorizontal: 20,
        }}>
        <TouchableOpacity
          style={{
            padding: 10,
            backgroundColor: '#E64034',
            opacity: isChecked && (text.trim().length > 10) !== '' ? 1 : 0.5,
            borderRadius: 8,
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'row',
            gap: 10,
          }}
          disabled={!isChecked || loading || !(text.trim().length > 10)}
          onPress={()=>sendAnecdotes()}
        >
          <Text
            style={{
              color: 'white',
              fontSize: 14,
              fontFamily: Fonts.Inter.Basic,
              fontWeight: '600',
            }}
          >
            Poster mon potin
          </Text>

          <Send
            size={20}
            color={Colors.white}
          />
        </TouchableOpacity>
      </View>
  </View>
  );
};