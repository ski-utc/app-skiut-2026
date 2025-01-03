import React, {useState, useEffect} from 'react';
import { View, Text, Image, TouchableOpacity, Dimensions, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors, loadFonts, Fonts } from '@/constants/GraphSettings';

export default function LaunchScreen1() {
  const navigation = useNavigation();

  const screenHeight = Dimensions.get("window").height;
  const imageWidth = 0.4 * screenHeight;

  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function load() {
      await loadFonts();
      setFontsLoaded(true);
    }
    load();
  }, []);

  if (!fontsLoaded) {
    return <ActivityIndicator size="large" color={Colors.orange} />;
  }

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
            <View style={styles.dotActive} />
            <View style={styles.dotInactive} />
            <View style={styles.dotInactive} />
          </View>
          <Text style={styles.title}>
            Bienvenue sur l’application SkiUTC
          </Text>
          <Text style={styles.description}>
            Ton indispensable pour passer une semaine de folie !!
          </Text>
          <TouchableOpacity
            onPress={() => { navigation.navigate("launchScreen2"); }}
            style={styles.nextButton}
          >
            <Text style={styles.nextButtonText}>
              Suivant
            </Text>
          </TouchableOpacity>
          <View style = {{height: 55}}></View>
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
  dotActive: {
    width: 37.47,
    height: 13,
    backgroundColor: '#E64034',
    borderRadius: 61,
  },
  dotInactive: {
    width: 13,
    height: 13,
    backgroundColor: 'rgba(230, 64, 52, 0.20)',
    borderRadius: 61,
  },
  title: {
    fontFamily: Fonts.Text.Bold, // was Fonts.Title.Bold
    fontSize: 32, 
    fontWeight: '500',
    color: 'black',
    marginBottom: 16,
  },
  description: {
    fontFamily: Fonts.Text.Medium,
    fontSize: 16,
    fontWeight: '400',
    color: '#737373',
    lineHeight: 24,
    marginBottom: 40,
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
});
