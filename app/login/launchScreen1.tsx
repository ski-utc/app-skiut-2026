import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { Sparkles } from 'lucide-react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import { Colors, TextStyles } from '@/constants/GraphSettings';
import logoImage from '@/assets/images/logo.png';

import { LoginStackParamList } from '../loginNavigator';

export default function LaunchScreen1() {
  const navigation = useNavigation<NavigationProp<LoginStackParamList>>();

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .runOnJS(true)
    .onEnd((e) => {
      if (e.velocityX < -350) {
        navigation.navigate("launchScreen2");
      }
    });

  return (
    <GestureDetector gesture={panGesture}>
      <SafeAreaView style={styles.container}>
        <View style={styles.backgroundDecoration} />

        <View style={styles.logoContainer}>
          <View style={styles.logoWrapper}>
            <Image
              source={logoImage}
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
            <Text style={styles.title}>Bienvenue sur Ski'UTC</Text>
          </View>

          <Text style={styles.description}>
            Découvrez votre compagnon indispensable pour vivre une semaine de ski inoubliable !
            Défis, planning, météo et bien plus encore.
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
    borderBottomLeftRadius: 100,
    height: '60%',
    opacity: 0.1,
    position: 'absolute',
    right: 0,
    top: 0,
    width: '80%',
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
  logo: {
    borderRadius: 100,
    height: 180,
    width: 180,
    zIndex: 2,
  },
  logoContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingTop: 60,
  },
  logoGlow: {
    backgroundColor: Colors.primary,
    borderRadius: 100,
    height: 200,
    opacity: 0.2,
    position: 'absolute',
    width: 200,
    zIndex: 1,
  },
  logoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  progressContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
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
    ...TextStyles.h1Bold,
    color: Colors.primaryBorder,
    flex: 1,
  },
  titleContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
});
