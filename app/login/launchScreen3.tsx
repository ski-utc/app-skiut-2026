import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { LogIn, Bell, Trophy, Gauge, Brush } from 'lucide-react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import { Colors, TextStyles } from '@/constants/GraphSettings';

import { LoginStackParamList } from '../loginNavigator';

export default function LaunchScreen3() {
  const navigation = useNavigation<NavigationProp<LoginStackParamList>>();

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .runOnJS(true)
    .onEnd((e) => {
      if (e.velocityX > 350) {
        navigation.goBack();
      }
    });

  return (
    <GestureDetector gesture={panGesture}>
      <SafeAreaView
        style={styles.container}
        edges={['bottom', 'left', 'right']}
      >
        <View style={styles.backgroundDecoration} />

        <View style={styles.illustrationContainer}>
          <View style={styles.featureCard}>
            <View style={styles.featureIconContainer}>
              <Bell size={32} color={Colors.primary} />
            </View>
            <Text style={styles.featureTitle}>Notifications</Text>
            <Text style={styles.featureDescription}>Normalement ça marche</Text>
          </View>

          <View style={[styles.featureCard, styles.featureCardSecondary]}>
            <View style={styles.featureIconContainer}>
              <Trophy size={32} color={Colors.primary} />
            </View>
            <Text style={styles.featureTitle}>Défis vidéos</Text>
            <Text style={styles.featureDescription}>
              Envoyez nous vos défis vidéos !
            </Text>
          </View>

          <View style={styles.featureCard}>
            <View style={styles.featureIconContainer}>
              <Gauge size={32} color={Colors.primary} />
            </View>
            <Text style={styles.featureTitle}>Vitese de glisse</Text>
            <Text style={styles.featureDescription}>
              Avec le téléphone éteint !
            </Text>
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
            <Brush size={28} color={Colors.primary} />
            <Text style={styles.title}>Et des améliorations !</Text>
          </View>

          <Text style={styles.description}>
            Recevez des notifications du bureau, soyez prévenu sur la page
            d'acceuil lors de la tournée des chambres, mesurez votre vitesse de
            glisse, et profitez d'une appli sans trop de bugs !
          </Text>

          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              onPress={() => navigation.navigate('loginScreen')}
              style={styles.loginButton}
              activeOpacity={0.8}
            >
              <LogIn size={20} color={Colors.white} />
              <Text style={styles.loginButtonText}>Se connecter</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  backgroundDecoration: {
    backgroundColor: Colors.primary,
    borderBottomLeftRadius: 100,
    height: '45%',
    opacity: 0.1,
    position: 'absolute',
    right: 0,
    top: 0,
    width: '50%',
  },
  buttonsContainer: {
    gap: 12,
    marginTop: 8,
  },
  container: {
    backgroundColor: Colors.white,
    flex: 1,
  },
  contentContainer: {
    gap: 24,
    paddingBottom: 40,
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
    gap: 24,
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingTop: 40,
  },
  loginButton: {
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 16,
    elevation: 6,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 18,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  loginButtonText: {
    ...TextStyles.button,
    color: Colors.white,
    fontWeight: '600',
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
