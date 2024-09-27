import * as Font from 'expo-font';

/* Supprimer une fois les components mis à jour */
const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  blue: '#75b2ae',
  softBlue: '#aad1cd',
  darkBlue: '#545A95',
  red: '#fa0019',
  softRed: '#fe715d',
  brown: '#550615',
  softBrown: '#d7beb8',
  white: '#f9fbec',
};

export const loadFonts = async () => {
  await Font.loadAsync({
    'DIN-Light': require('../assets/fonts/Titre/DIN-Light.ttf'),
    'DIN-Medium': require('../assets/fonts/Titre/DIN-Medium.ttf'),
    'DIN-Bold': require('../assets/fonts/Titre/DIN-Bold.ttf'),

    'AvenirLTStd-Light': require('../assets/fonts/Text/AvenirLTStd-Light.otf'),
    'AvenirLTStd-Medium': require('../assets/fonts/Text/AvenirLTStd-Medium.otf'),
    'AvenirLTStd-Bold': require('../assets/fonts/Text/AvenirLTStd-Heavy.otf'),
  });
};

export const Fonts = {
  Title: {
    Light: 'DIN-Light',
    Medium: 'DIN-Medium',
    Bold: 'DIN-Bold',
  },
  Text: {
    Light: 'AvenirLTStd-Light',
    Medium: 'AvenirLTStd-Medium',
    Bold: 'AvenirLTStd-Bold',
  },
};

