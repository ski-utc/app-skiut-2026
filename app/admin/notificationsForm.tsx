import React, { useState } from 'react';
import { View, Text, TextInput, ActivityIndicator, Platform, KeyboardAvoidingView, Keyboard, Pressable, SafeAreaView, StyleSheet } from 'react-native';
import Checkbox from 'expo-checkbox';
import { Colors, TextStyles } from '@/constants/GraphSettings';
import Header from "../../components/header";
import { useNavigation } from '@react-navigation/native';
import { useUser } from '@/contexts/UserContext';
import BoutonRetour from '@/components/divers/boutonRetour';
import BoutonActiverLarge from '@/components/divers/boutonActiverLarge';
import { Send, PenTool, FileText, Shield } from 'lucide-react-native';
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
  if (error !== '') {
    return <ErrorScreen error={error} />;
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header refreshFunction={null} disableRefresh={true} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Envoi en cours...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Header refreshFunction={null} disableRefresh={true} />

        <View style={styles.headerContainer}>
          <BoutonRetour previousRoute={"gestionNotificationsScreen"} title={"Créer une notification"} />
        </View>

        <View style={styles.heroSection}>
          <View style={styles.heroIcon}>
            <PenTool size={24} color={Colors.primary} />
          </View>
          <Text style={styles.heroTitle}>Nouvelle notification</Text>
          <Text style={styles.heroSubtitle}>
            Rédigez une notification pour les utilisateurs
          </Text>
        </View>

        <View style={styles.content}>
          <View style={styles.inputSection}>
            <View style={styles.inputHeader}>
              <FileText size={16} color={Colors.primary} />
              <Text style={styles.inputLabel}>Titre de la notification</Text>
            </View>
            <TextInput
              style={styles.titleInput}
              placeholder="Titre de la notification"
              placeholderTextColor={Colors.muted}
              onChangeText={setTitle}
              value={title}
            />
          </View>

          <View style={styles.inputSection}>
            <View style={styles.inputHeader}>
              <FileText size={16} color={Colors.primary} />
              <Text style={styles.inputLabel}>Contenu du message</Text>
            </View>
            <Pressable onPress={() => Keyboard.dismiss()} style={styles.textAreaContainer}>
              <TextInput
                style={styles.textAreaInput}
                placeholder="Rédigez votre message..."
                placeholderTextColor={Colors.muted}
                multiline
                numberOfLines={8}
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
                <Shield size={16} color={Colors.primary} />
                <Text style={styles.termsText}>
                  En publiant cette notification, je certifie qu'elle respecte les autres participant.e.s du voyage
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <BoutonActiverLarge
            title="Envoyer la notification"
            IconComponent={Send}
            disabled={!isChecked || loading || title.trim().length === 0 || text.trim().length <= 5}
            onPress={handleSendNotification}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  keyboardView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  loadingText: {
    ...TextStyles.body,
    color: Colors.muted,
    marginTop: 16,
    textAlign: 'center',
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.lightMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    ...TextStyles.h2Bold,
    color: Colors.primaryBorder,
    marginBottom: 8,
    textAlign: 'center',
  },
  heroSubtitle: {
    ...TextStyles.body,
    color: Colors.muted,
    textAlign: 'center',
    lineHeight: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  inputSection: {
    marginBottom: 20,
  },
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputLabel: {
    ...TextStyles.body,
    color: Colors.primaryBorder,
    fontWeight: '600',
    marginLeft: 8,
  },
  titleInput: {
    ...TextStyles.body,
    color: Colors.primaryBorder,
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary,
    padding: 14,
    height: 50,
  },
  textAreaContainer: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary,
    minHeight: 180,
  },
  textAreaInput: {
    ...TextStyles.body,
    color: Colors.primaryBorder,
    padding: 14,
    flex: 1,
    textAlignVertical: 'top',
  },
  termsSection: {
    marginTop: 10,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    marginTop: 2,
  },
  termsTextContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  termsText: {
    ...TextStyles.small,
    color: Colors.primaryBorder,
    lineHeight: 18,
    flex: 1,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
});
