import React from 'react';
import { View, Text, Image, TouchableOpacity, Dimensions, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors, Fonts } from '@/constants/GraphSettings';

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
    backgroundColor: 'white',
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
    backgroundColor: 'rgba(230, 64, 52, 0.20)',
    borderRadius: 61,
  },
  dotActive: {
    width: 37.47,
    height: 13,
    backgroundColor: '#E64034',
    borderRadius: 61,
  },
  title: {
    fontFamily: Fonts.Text.Bold,  // was Fonts.Title.Bold
    fontSize: 32,
    fontWeight: '500',
    color: 'black',
    marginBottom: 8,
  },
  description: {
    fontFamily: Fonts.Text.Medium,
    fontSize: 16,
    fontWeight: '400',
    color: '#737373',
    lineHeight: 24,
    marginBottom: 12,
  },
  nextButton: {
    alignSelf: 'stretch',
    backgroundColor: '#E64034',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  backButton: {
    alignSelf: 'stretch',
    backgroundColor: '#F2F2F2',
    opacity: 0.6,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'black',
  },
});
