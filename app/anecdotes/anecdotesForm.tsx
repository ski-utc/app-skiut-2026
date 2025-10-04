import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator, Platform, KeyboardAvoidingView, Keyboard, Pressable } from 'react-native';
import Checkbox from 'expo-checkbox';
import { Colors, Fonts, TextStyles, loadFonts } from '@/constants/GraphSettings';
import Header from "../../components/header";
import { useNavigation } from '@react-navigation/native';
import { useUser } from '@/contexts/UserContext';
import BoutonRetour from '@/components/divers/boutonRetour';
import { Send } from 'lucide-react-native';
import { apiPost } from '@/constants/api/apiCalls';
import ErrorScreen from '@/components/pages/errorPage';
import Toast from 'react-native-toast-message';

// @ts-ignore
export default function AnecdotesForm() {
  const [text, setText] = useState('');
  const [isChecked, setChecked] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigation = useNavigation();
  const { setUser } = useUser();

  const handleSendAnecdote = async () => {
    setLoading(true);
    try {
      const response = await apiPost("sendAnecdote", {
        texte: text
      });
      if (response.success) {
        Toast.show({
          type: 'success',
          text1: 'Anecdote postée !',
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
    } catch (error : any) {
      if (error.message === 'NoRefreshTokenError' || error.JWT_ERROR) {
        setUser(null);
      } else {
        setError(error.message);
      }
    }
  };

  useEffect(() => {
    const loadAsyncFonts = async () => {
      await loadFonts();
    };
    loadAsyncFonts();
  }, []);

  const handleCheckboxPress = () => {
    setChecked(!isChecked);
    Keyboard.dismiss(); // Dismiss the keyboard when the checkbox is clicked
  };

  if (error !== '') {
    return (
      <ErrorScreen error={error} />
    );
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Header refreshFunction={null} disableRefresh={true} />
        <View style={{ width: '100%', flex: 1, backgroundColor: Colors.white, justifyContent: "center", alignItems: "center" }}>
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
        <Header refreshFunction={null} disableRefresh={true} />
        <View style={{ width: '100%', flex: 1, backgroundColor: Colors.white, paddingHorizontal: 20, paddingBottom: 16 }}>
          <BoutonRetour previousRoute={"anecdotesScreen"} title={"Raconte nous ta meilleure anecdote !"} />
          <Pressable
            onPress={() => Keyboard.dismiss()}
            style={{ padding: 16, marginBottom: 8, height: 268, backgroundColor: Colors.white, borderRadius: 12, borderWidth: 2, borderColor: Colors.primary, shadowColor: Colors.primaryBorder, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2 }}
          >
            <TextInput
              style={{ ...TextStyles.body, color: Colors.primaryBorder, width: '100%' }}
              placeholder="Aujourd'hui..."
              placeholderTextColor={Colors.gray}
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
              color={isChecked ? Colors.accent : undefined}
            />
            <Text style={{ ...TextStyles.small, color: Colors.primaryBorder, paddingRight: 20 }}>
              En postant cette anecdote, je certifie qu’il respecte les autres participant.e.s du voyage
            </Text>
          </View>
        </View>
        <View style={{ width: '100%', position: 'absolute', right: 0, bottom: 16, paddingHorizontal: 20 }}>
          <TouchableOpacity
            style={{ padding: 12, backgroundColor: Colors.accent, opacity: isChecked && text.trim().length > 5 ? 1 : 0.5, borderRadius: 10, justifyContent: 'center', alignItems: 'center', flexDirection: 'row', gap: 10, shadowColor: Colors.primaryBorder, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3, elevation: 3 }}
            disabled={!isChecked || loading || text.trim().length <= 5}
            onPress={handleSendAnecdote}
          >
            <Text style={{ ...TextStyles.button, color: Colors.white }}>Poster mon anecdote</Text>
            <Send size={20} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
