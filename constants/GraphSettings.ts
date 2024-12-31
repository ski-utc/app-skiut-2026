import * as Font from 'expo-font';

export const Colors = {
  white: '#FFFFFF',
  customWhite: '#F0F0F0',
  customGray: '#EBEBEB',
  gray: '#7F7D7D',
  black: '#000000',
  customBlack: '#262323',
  orange: '#E64034',
  lightOrange: '#FE8076',
};

export const loadFonts = async () => {
  await Font.loadAsync({
    'Inter': require('../assets/fonts/Inter/Inter.ttf'),
    'Inter-Italic': require('../assets/fonts/Inter/Inter-Italic.ttf'),
    
    'DIN-Light': require('../assets/fonts/Titre/DIN-Light.ttf'),
    'DIN-Medium': require('../assets/fonts/Titre/DIN-Medium.ttf'),
    'DIN-Bold': require('../assets/fonts/Titre/DIN-Bold.otf'),

    
    'AvenirLTStd-Light': require('../assets/fonts/Text/AvenirLTStd-Light.otf'),
    'AvenirLTStd-Medium': require('../assets/fonts/Text/AvenirLTStd-Medium.otf'),
    'AvenirLTStd-Bold': require('../assets/fonts/Text/AvenirLTStd-Heavy.otf'),
  });
};

export const Fonts = {
  Inter: {
    Basic: 'Inter',
    Italic: 'Inter-Italic',
  },

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

