import React from 'react';
import { View, Text, Image, TouchableOpacity, Dimensions, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Fonts, Colors, TextStyles } from '@/constants/GraphSettings';

export default function LaunchScreen3() {
  const navigation = useNavigation();

  const screenHeight = Dimensions.get("window").height;
  const imageWidth = 0.4 * screenHeight;

  return (
    <View style={styles.container}>
      {/* Image */}
      <Image
        source={require('../../assets/images/OursCabine.png')}
        style={[styles.image, { width: imageWidth }]}
      />
      <View style={styles.innerContainer}>
        <View style={styles.spacer} />
        <View style={styles.contentContainer}>
          <View style={styles.dotsContainer}>
            <View style={styles.dotInactive} />
            <View style={styles.dotInactive} />
            <View style={styles.dotActive} />
          </View>
          <Text style={styles.title}>
            L'emploi du temps et + encore
          </Text>
          <Text style={styles.description}>
            Retrouve l’emplois du temps de la semaine, partage tes meilleures anecdotes du voyage et télécharge le plan des pistes !  
          </Text>
          <TouchableOpacity
            onPress={() => { navigation.navigate("loginScreen") }}
            style={styles.nextButton}
          >
            <Text style={styles.nextButtonText}>
              Se connecter
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => { navigation.goBack(); }}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>
              Retour
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  image: {
    height: '40%',
    position: 'absolute',
    right: 0,
    top: 0,
  },
  innerContainer: {
    height: '100%',
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  spacer: {
    height: '50%',
  },
  contentContainer: {
    paddingHorizontal: 24,
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  dotInactive: {
    width: 13,
    height: 13,
    backgroundColor: Colors.accent + '33', // 20% opacity
    borderRadius: 61,
  },
  dotActive: {
    width: 37.47,
    height: 13,
    backgroundColor: Colors.accent,
    borderRadius: 61,
  },
  title: {
    ...TextStyles.h1,
    fontSize: 32,
    color: Colors.primaryBorder,
    marginBottom: 8,
  },
  description: {
    ...TextStyles.bodyLarge,
    color: Colors.gray,
    lineHeight: 24,
    marginBottom: 12,
  },
  nextButton: {
    alignSelf: 'stretch',
    backgroundColor: Colors.accent,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: Colors.primaryBorder,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  nextButtonText: {
    ...TextStyles.buttonLarge,
    color: Colors.white,
  },
  backButton: {
    alignSelf: 'stretch',
    backgroundColor: Colors.customGray,
    opacity: 0.8,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  backButtonText: {
    ...TextStyles.buttonLarge,
    color: Colors.primaryBorder,
  },
});
