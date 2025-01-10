import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator, Platform, KeyboardAvoidingView, Keyboard, Pressable } from 'react-native';
import Checkbox from 'expo-checkbox';
import { Colors, Fonts, loadFonts } from '@/constants/GraphSettings';
import Header from "../../components/header";
import { useNavigation } from '@react-navigation/native';
import { useUser } from '@/contexts/UserContext';
import BoutonRetour from '@/components/divers/boutonRetour';
import { Send } from 'lucide-react-native';
import { apiPost } from '@/constants/api/apiCalls';
import ErrorScreen from '@/components/pages/errorPage';
import Toast from 'react-native-toast-message';

// @ts-ignore
export default function NotificationsForm() {
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [isChecked, setChecked] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigation = useNavigation();
  const { setUser } = useUser();

  const handleSendNotification = async () => {
    setLoading(true);
    try {
      const response = await apiPost("sendNotification", {
        titre: title,
        texte: text,
      });
      if (response.success) {
        Toast.show({
          type: 'success',
          text1: 'Notification envoyée !',
          text2: response.message,
        });
        navigation.goBack();
      } else {
        Toast.show({
          type: 'error',
          text1: 'Une erreur est survenue...',
          text2: response.message,
        });
      }
    } catch (error) {
      if (error.message === 'NoRefreshTokenError' || error.JWT_ERROR) {
        setUser(null);
      } else {
        setError(error.message);
      }
    }
  };

  const handleCheckboxPress = () => {
    setChecked(!isChecked);
    Keyboard.dismiss(); // Dismiss the keyboard when the checkbox is clicked
  };

  useEffect(() => {
    const loadAsyncFonts = async () => {
      await loadFonts();
    };
    loadAsyncFonts();
  }, []);

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
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Header />
        <View style={{ width: '100%', flex: 1, backgroundColor: Colors.white, paddingHorizontal: 20, paddingBottom: 16 }}>
          <BoutonRetour previousRoute={"gestionNotificationsScreen"} title={"Ecris la notification à publier"} />
          <TextInput
            style={{
              padding: 14,
              marginBottom: 8,
              height: 50,
              backgroundColor: '#F8F8F8',
              borderRadius: 12,
              borderWidth: 1,
              borderColor: '#EAEAEA',
              color: Colors.black,
              fontFamily: Fonts.Inter.Basic,
              fontWeight: '500',
              fontSize: 14,
            }}
            placeholder="Titre de la notification"
            placeholderTextColor={'#969696'}
            onChangeText={setTitle}
            value={title}
          />
          <Pressable
            onPress={() => Keyboard.dismiss()}
            style={{ padding: 14, marginBottom: 8, height: 268, backgroundColor: '#F8F8F8', borderRadius: 12, borderWidth: 1, borderColor: '#EAEAEA' }}
          >
            <TextInput
              style={{ color: Colors.black, fontFamily: Fonts.Inter.Basic, fontWeight: '500', width: '100%', fontSize: 14 }}
              placeholder="Aujourd'hui..."
              placeholderTextColor={'#969696'}
              multiline
              numberOfLines={15}
              onChangeText={setText}
              value={text}
            />
          </Pressable>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 11 }}>
            <Checkbox
              style={{ width: 24, height: 24 }}
              value={isChecked}
              onValueChange={handleCheckboxPress}
              color={isChecked ? Colors.orange : undefined}
            />
            <Text style={{ color: Colors.black, fontSize: 12, fontFamily: Fonts.Inter.Basic, fontWeight: '500', paddingRight: 20 }}>
              En publiant cette notification, je certifie qu’il respecte les autres participant.e.s du voyage
            </Text>
          </View>
        </View>
        <View style={{ width: '100%', position: 'absolute', right: 0, bottom: 16, paddingHorizontal: 20 }}>
          <TouchableOpacity
            style={{
              padding: 10,
              backgroundColor: '#E64034',
              opacity: isChecked && title.trim().length > 0 && text.trim().length > 5 ? 1 : 0.5,
              borderRadius: 8,
              justifyContent: 'center',
              alignItems: 'center',
              flexDirection: 'row',
              gap: 10,
            }}
            disabled={!isChecked || loading || title.trim().length === 0 || text.trim().length <= 5}
            onPress={handleSendNotification}
          >
            <Text style={{ color: 'white', fontSize: 14, fontFamily: Fonts.Inter.Basic, fontWeight: '600' }}>Poster la notification</Text>
            <Send size={20} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
