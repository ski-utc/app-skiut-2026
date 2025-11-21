import { useState } from 'react';
import { View, Text, TextInput, ActivityIndicator, Platform, KeyboardAvoidingView, Keyboard, Pressable, StyleSheet } from 'react-native';
import { Checkbox } from 'expo-checkbox';
import { useNavigation } from '@react-navigation/native';
import { Send, PenTool } from 'lucide-react-native';
import Toast from 'react-native-toast-message';

import { useUser } from '@/contexts/UserContext';
import BoutonRetour from '@/components/divers/boutonRetour';
import BoutonActiverLarge from '@/components/divers/boutonActiverLarge';
import { apiPost } from '@/constants/api/apiCalls';
import ErrorScreen from '@/components/pages/errorPage';
import { Colors, TextStyles } from '@/constants/GraphSettings';

import Header from "../../components/header";

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
      const response = await apiPost("anecdotes", {
        texte: text
      });
      if (response.success) {
        Toast.show({
          type: 'success',
          text1: 'Anecdote postée !',
          text2: response.message,
        });
        navigation.goBack();
      } else if (response.pending) {
        Toast.show({
          type: 'info',
          text1: 'Requête sauvegardée',
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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.content}>
        <Header refreshFunction={null} disableRefresh={true} />

        <View style={styles.headerContainer}>
          <BoutonRetour title={"Rédiger un potin"} />
        </View>

        <View style={styles.heroSection}>
          <View style={styles.heroIcon}>
            <PenTool size={24} color={Colors.primary} />
          </View>
          <Text style={styles.heroTitle}>Partage ton anecdote</Text>
          <Text style={styles.heroSubtitle}>
            Raconte-nous ce qui t'a marqué aujourd'hui !
          </Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputSection}>
            <Pressable
              onPress={() => Keyboard.dismiss()}
              style={styles.textAreaContainer}
            >
              <TextInput
                style={styles.textAreaInput}
                placeholder="Aujourd'hui..."
                placeholderTextColor={Colors.muted}
                multiline
                numberOfLines={12}
                onChangeText={setText}
                value={text}
                textAlignVertical="top"
              />
            </Pressable>
          </View>

          <View style={styles.termsSection}>
            <View style={styles.termsRow}>
              <Checkbox
                style={styles.checkbox}
                value={isChecked}
                onValueChange={handleCheckboxPress}
                color={isChecked ? Colors.primary : undefined}
              />
              <View style={styles.termsTextContainer}>
                <Text style={styles.termsText}>
                  En postant cette anecdote, je certifie qu'elle respecte les autres participant.e.s du voyage
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <BoutonActiverLarge
            title="Poster mon anecdote"
            IconComponent={Send}
            disabled={!isChecked || loading || text.trim().length <= 5}
            onPress={handleSendAnecdote}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    bottom: 20,
    left: 20,
    position: 'absolute',
    right: 20,
  },
  checkbox: {
    height: 24,
    marginTop: 2,
    width: 24,
  },
  container: {
    backgroundColor: Colors.white,
    flex: 1,
  },
  content: {
    flex: 1,
  },
  formContainer: {
    flex: 1,
    paddingBottom: 100,
    paddingHorizontal: 20,
  },
  headerContainer: {
    paddingBottom: 8,
    paddingHorizontal: 20,
  },
  heroIcon: {
    alignItems: 'center',
    backgroundColor: Colors.lightMuted,
    borderRadius: 32,
    height: 64,
    justifyContent: 'center',
    marginBottom: 16,
    width: 64,
  },
  heroSection: {
    alignItems: 'center',
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  heroSubtitle: {
    ...TextStyles.body,
    color: Colors.muted,
    lineHeight: 20,
    textAlign: 'center',
  },
  heroTitle: {
    ...TextStyles.h2Bold,
    color: Colors.primaryBorder,
    marginBottom: 8,
    textAlign: 'center',
  },
  inputSection: {
    marginBottom: 20,
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
  termsRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
  },
  termsSection: {
    marginTop: 10,
  },
  termsText: {
    ...TextStyles.small,
    color: Colors.primaryBorder,
    flex: 1,
    lineHeight: 18,
  },
  termsTextContainer: {
    alignItems: 'flex-start',
    flex: 1,
    flexDirection: 'row',
    gap: 8,
  },
  textAreaContainer: {
    backgroundColor: Colors.white,
    borderColor: Colors.primary,
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 200,
  },
  textAreaInput: {
    ...TextStyles.bodyLarge,
    color: Colors.primaryBorder,
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
    padding: 16,
    textAlignVertical: 'top',
  },
});
