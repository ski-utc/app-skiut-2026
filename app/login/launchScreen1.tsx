import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors, TextStyles } from '@/constants/GraphSettings';
import { ChevronRight, Sparkles } from 'lucide-react-native';

export default function LaunchScreen1() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.backgroundDecoration} />

      <View style={styles.logoContainer}>
        <View style={styles.logoWrapper}>
          <Image
            source={require('../../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <View style={styles.logoGlow} />
        </View>
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.progressContainer}>
          <View style={styles.dotsContainer}>
            <View style={[styles.dot, styles.dotActive]} />
            <View style={[styles.dot, styles.dotInactive]} />
            <View style={[styles.dot, styles.dotInactive]} />
          </View>
          <Text style={styles.progressText}>1 / 3</Text>
        </View>

        <View style={styles.titleContainer}>
          <Sparkles size={28} color={Colors.primary} />
          <Text style={styles.title}>Bienvenue sur SkiUTC</Text>
        </View>

        <Text style={styles.description}>
          Découvrez votre compagnon indispensable pour vivre une semaine de ski inoubliable !
          Défis, planning, météo et bien plus encore.
        </Text>

        <TouchableOpacity
          onPress={() => (navigation as any).navigate("launchScreen2")}
          style={styles.nextButton}
          activeOpacity={0.8}
        >
          <Text style={styles.nextButtonText}>Commencer l'aventure</Text>
          <ChevronRight size={20} color={Colors.white} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => (navigation as any).navigate("loginScreen")}
          style={styles.skipButton}
        >
          <Text style={styles.skipButtonText}>Passer l'introduction</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
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
    width: '75%',
    height: '50%',
    backgroundColor: Colors.primary,
    opacity: 0.1,
    borderBottomLeftRadius: 100,
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  logoWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 180,
    height: 180,
    borderRadius: 100,
    zIndex: 2,
  },
  logoGlow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: Colors.primary,
    opacity: 0.2,
    zIndex: 1,
  },
  contentContainer: {
    paddingHorizontal: 32,
    paddingBottom: 20,
    gap: 24,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
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
    marginBottom: 8,
  },
  title: {
    ...TextStyles.h1Bold,
    color: Colors.primaryBorder,
    flex: 1,
  },
  description: {
    ...TextStyles.body,
    color: Colors.muted,
    lineHeight: 24,
    textAlign: 'left',
  },
  nextButton: {
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
    marginTop: 8,
  },
  nextButtonText: {
    ...TextStyles.button,
    color: Colors.white,
    fontWeight: '600',
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  skipButtonText: {
    ...TextStyles.body,
    color: Colors.muted,
    fontWeight: '500',
  },
});
