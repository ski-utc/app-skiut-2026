import React, { useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, Dimensions, StyleSheet, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors, TextStyles, loadFonts } from '@/constants/GraphSettings';
import { ChevronLeft, Calendar, Map, LogIn, PartyPopper, Cookie } from 'lucide-react-native';

export default function LaunchScreen3() {
  const navigation = useNavigation();

  useEffect(() => {
    const loadAsyncFonts = async () => {
      await loadFonts();
    };
    loadAsyncFonts();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.backgroundDecoration} />

      <View style={styles.illustrationContainer}>
        <View style={styles.featureCard}>
          <View style={styles.featureIconContainer}>
            <Map size={32} color={Colors.primary} />
          </View>
          <Text style={styles.featureTitle}>Plans</Text>
          <Text style={styles.featureDescription}>Ne soyez pas paumé.e.s</Text>
        </View>

        <View style={[styles.featureCard, styles.featureCardSecondary]}>
          <View style={styles.featureIconContainer}>
            <PartyPopper size={32} color={Colors.primary} />
          </View>
          <Text style={styles.featureTitle}>Skinder</Text>
          <Text style={styles.featureDescription}>Rencontrez d'autres chambres</Text>
        </View>

        <View style={styles.featureCard}>
          <View style={styles.featureIconContainer}>
            <Cookie size={32} color={Colors.primary} />
          </View>
          <Text style={styles.featureTitle}>Monopr'ut</Text>
          <Text style={styles.featureDescription}>Limitez le gaspillage</Text>
        </View>
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.progressContainer}>
          <View style={styles.dotsContainer}>
            <View style={[styles.dot, styles.dotInactive]} />
            <View style={[styles.dot, styles.dotInactive]} />
            <View style={[styles.dot, styles.dotActive]} />
          </View>
          <Text style={styles.progressText}>3 / 3</Text>
        </View>

        <View style={styles.titleContainer}>
          <Calendar size={28} color={Colors.primary} />
          <Text style={styles.title}>Et bien plus encore !</Text>
        </View>

        <Text style={styles.description}>
          Consultez l'emploi du temps de la semaine, partagez vos meilleures anecdotes
          du voyage et téléchargez le plan des pistes pour ne rien manquer !
        </Text>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            onPress={() => (navigation as any).navigate("loginScreen")}
            style={styles.loginButton}
            activeOpacity={0.8}
          >
            <LogIn size={20} color={Colors.white} />
            <Text style={styles.loginButtonText}>Se connecter</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            activeOpacity={0.8}
          >
            <ChevronLeft size={20} color={Colors.primary} />
            <Text style={styles.backButtonText}>Retour</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView >
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  backgroundDecoration: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '50%',
    height: '45%',
    backgroundColor: Colors.primary,
    opacity: 0.1,
    borderBottomLeftRadius: 100,
  },
  illustrationContainer: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 40,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  featureCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    minWidth: 140,
  },
  featureCardSecondary: {
    backgroundColor: Colors.lightMuted,
    transform: [{ scale: 1.1 }],
  },
  featureIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.lightMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    ...TextStyles.bodyBold,
    color: Colors.primaryBorder,
    marginBottom: 6,
  },
  featureDescription: {
    ...TextStyles.small,
    color: Colors.muted,
    textAlign: 'center',
    lineHeight: 18,
  },
  contentContainer: {
    paddingHorizontal: 32,
    paddingBottom: 40,
    gap: 24,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    width: 32,
    backgroundColor: Colors.primary,
  },
  dotInactive: {
    width: 8,
    backgroundColor: Colors.lightMuted,
  },
  progressText: {
    ...TextStyles.small,
    color: Colors.primary,
    fontWeight: '600',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    ...TextStyles.h2Bold,
    color: Colors.primaryBorder,
    flex: 1,
  },
  description: {
    ...TextStyles.body,
    color: Colors.muted,
    lineHeight: 24,
    textAlign: 'left',
  },
  buttonsContainer: {
    gap: 12,
    marginTop: 8,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  loginButtonText: {
    ...TextStyles.button,
    color: Colors.white,
    fontWeight: '600',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.white,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  backButtonText: {
    ...TextStyles.button,
    color: Colors.primary,
    fontWeight: '600',
  },
  encouragementContainer: {
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    backgroundColor: Colors.lightMuted,
    borderRadius: 16,
    marginTop: 8,
  },
  encouragementText: {
    ...TextStyles.body,
    color: Colors.primary,
    fontWeight: '600',
    textAlign: 'center',
  },
});
