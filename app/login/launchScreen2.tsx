import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { Trophy, MessageCircle, Calendar } from 'lucide-react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import { Colors, TextStyles } from '@/constants/GraphSettings';

import { LoginStackParamList } from '../loginNavigator';

export default function LaunchScreen2() {
  const navigation = useNavigation<NavigationProp<LoginStackParamList>>();

  const panGesture = Gesture.Pan()
    .runOnJS(true)
    .onEnd((e) => {
      if (e.velocityX < -500) {
        navigation.navigate("launchScreen3");
      } else if (e.velocityX > 500) {
        navigation.goBack();
      }
    });

  return (
    <GestureDetector gesture={panGesture}>
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
            onPress={() => navigation.navigate("loginScreen")}
            style={styles.skipButton}
          >
            <Text style={styles.skipButtonText}>Passer l'introduction</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  backgroundDecoration: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 80,
    height: '40%',
    left: 0,
    opacity: 0.1,
    position: 'absolute',
    top: 0,
    width: '60%',
  },
  container: {
    backgroundColor: Colors.white,
    flex: 1,
  },
  contentContainer: {
    gap: 24,
    paddingBottom: 20,
    paddingHorizontal: 32,
  },
  description: {
    ...TextStyles.body,
    color: Colors.muted,
    lineHeight: 24,
    textAlign: 'left',
  },
  dot: {
    borderRadius: 4,
    height: 8,
  },
  dotActive: {
    backgroundColor: Colors.primary,
    width: 32,
  },
  dotInactive: {
    backgroundColor: Colors.lightMuted,
    width: 8,
  },
  dotsContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  featureCard: {
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderColor: 'rgba(0,0,0,0.05)',
    borderRadius: 16,
    borderWidth: 1,
    elevation: 4,
    minWidth: 140,
    padding: 10,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  featureCardSecondary: {
    backgroundColor: Colors.lightMuted,
    transform: [{ scale: 1.1 }],
  },
  featureDescription: {
    ...TextStyles.small,
    color: Colors.muted,
    lineHeight: 18,
    textAlign: 'center',
  },
  featureIconContainer: {
    alignItems: 'center',
    backgroundColor: Colors.lightMuted,
    borderRadius: 28,
    height: 56,
    justifyContent: 'center',
    marginBottom: 12,
    width: 56,
  },
  featureTitle: {
    ...TextStyles.bodyBold,
    color: Colors.primaryBorder,
    marginBottom: 6,
  },
  illustrationContainer: {
    alignItems: 'center',
    flex: 1,
    gap: 16,
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingTop: 40,
  },
  progressContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressText: {
    ...TextStyles.small,
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
  title: {
    ...TextStyles.h2Bold,
    color: Colors.primaryBorder,
    flex: 1,
  },
  titleContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
});
