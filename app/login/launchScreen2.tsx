import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors, TextStyles } from '@/constants/GraphSettings';
import { ChevronRight, ChevronLeft, Trophy, MessageCircle, Calendar } from 'lucide-react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';

export default function LaunchScreen2() {
  const navigation = useNavigation();

  const handleGestureEvent = ({ nativeEvent }: any) => {
    if (nativeEvent.state === State.END) {
      if (nativeEvent.velocityX < -500) {
        (navigation as any).navigate("launchScreen3");
      }
      else if (nativeEvent.velocityX > 500) {
        navigation.goBack();
      }
    }
  };

  return (
    <PanGestureHandler onHandlerStateChange={handleGestureEvent}>
      <SafeAreaView style={styles.container}>
        <View style={styles.backgroundDecoration} />

        <View style={styles.illustrationContainer}>
          <View style={styles.featureCard}>
            <View style={styles.featureIconContainer}>
              <Calendar size={32} color={Colors.primary} />
            </View>
            <Text style={styles.featureTitle}>Planning</Text>
            <Text style={styles.featureDescription}>Emploi du temps de la semaine</Text>
          </View>

          <View style={[styles.featureCard, styles.featureCardSecondary]}>
            <View style={styles.featureIconContainer}>
              <Trophy size={32} color={Colors.primary} />
            </View>
            <Text style={styles.featureTitle}>Défis</Text>
            <Text style={styles.featureDescription}>Relevez des défis avec votre chambre</Text>
          </View>

          <View style={styles.featureCard}>
            <View style={styles.featureIconContainer}>
              <MessageCircle size={32} color={Colors.primary} />
            </View>
            <Text style={styles.featureTitle}>Anecdotes</Text>
            <Text style={styles.featureDescription}>Partagez vos meilleurs souvenirs</Text>
          </View>
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.progressContainer}>
            <View style={styles.dotsContainer}>
              <View style={[styles.dot, styles.dotInactive]} />
              <View style={[styles.dot, styles.dotActive]} />
              <View style={[styles.dot, styles.dotInactive]} />
            </View>
            <Text style={styles.progressText}>2 / 3</Text>
          </View>

          <View style={styles.titleContainer}>
            <Trophy size={28} color={Colors.primary} />
            <Text style={styles.title}>Relevez tous les défis</Text>
          </View>

          <Text style={styles.description}>
            Participez à des défis passionnants avec les membres de votre chambre et
            partagez vos réussites avec tous les participants du voyage.
          </Text>

          <TouchableOpacity
            onPress={() => (navigation as any).navigate("loginScreen")}
            style={styles.skipButton}
          >
            <Text style={styles.skipButtonText}>Passer l'introduction</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </PanGestureHandler>
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
    left: 0,
    width: '60%',
    height: '40%',
    backgroundColor: Colors.primary,
    opacity: 0.1,
    borderBottomRightRadius: 80,
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
    paddingBottom: 20,
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
  },
  nextButtonText: {
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
  skipButton: {
    alignItems: 'center',
    marginTop: 20,
  },
  skipButtonText: {
    ...TextStyles.body,
    color: Colors.muted,
    fontWeight: '500',
  },
});
