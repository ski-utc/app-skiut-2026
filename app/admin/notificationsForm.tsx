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
    } catch (error: any) {
      if (error.message === 'NoRefreshTokenError' || error.JWT_ERROR) {
        setUser(null);
      } else {
        setError(error.message);
      }
    }
  };

  const handleCheckboxPress = () => {
    setChecked(!isChecked);
    Keyboard.dismiss();
  };

  useEffect(() => {
    const loadAsyncFonts = async () => {
      await loadFonts();
    };
    loadAsyncFonts();
  }, []);

  if (error !== '') {
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
        <Header refreshFunction={null} disableRefresh={true} />
        <View
          style={{
            width: '100%',
            flex: 1,
            backgroundColor: Colors.white,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <ActivityIndicator size="large" color={Colors.muted} />
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
          <BoutonRetour previousRoute={"gestionNotificationsScreen"} title={"Ecris la notification à publier"} />
          <TextInput
            style={{
              padding: 14,
              marginBottom: 8,
              height: 50,
              backgroundColor: Colors.white,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: Colors.primary,
              color: Colors.primaryBorder,
              ...TextStyles.bodyLarge,
              fontWeight: '500',
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
              style={{ color: '#000000', ...TextStyles.bodyLarge, fontWeight: '500', width: '100%' }}
              placeholder="Aujourd'hui..."
              placeholderTextColor={Colors.muted}
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
            <Text style={{ color: '#000000', ...TextStyles.small, fontWeight: '500', paddingRight: 20 }}>
              En publiant cette notification, je certifie qu’il respecte les autres participant.e.s du voyage
            </Text>
          </View>
        </View>
        <View style={{ width: '100%', position: 'absolute', right: 0, bottom: 16, paddingHorizontal: 20 }}>
          <TouchableOpacity
            style={{
              padding: 10,
              backgroundColor: Colors.accent,
              opacity: isChecked && title.trim().length > 0 && text.trim().length > 5 ? 1 : 0.5,
              borderRadius: 10,
              justifyContent: 'center',
              alignItems: 'center',
              flexDirection: 'row',
              gap: 10,
            }}
            disabled={!isChecked || loading || title.trim().length === 0 || text.trim().length <= 5}
            onPress={handleSendNotification}
          >
            <Text style={{ ...TextStyles.button, color: Colors.white }}>Poster la notification</Text>
            <Send size={20} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
