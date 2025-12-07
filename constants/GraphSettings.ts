import * as Font from 'expo-font';

import LibreBaskervilleRegular from '@/assets/fonts/Titre/LibreBaskerville-Regular.ttf';
import LibreBaskervilleBold from '@/assets/fonts/Titre/LibreBaskerville-Bold.ttf';
import LibreBaskervilleItalic from '@/assets/fonts/Titre/LibreBaskerville-Italic.ttf';
import ProximaNovaRegular from '@/assets/fonts/Text/proximanova_regular.ttf';
import ProximaNovaBold from '@/assets/fonts/Text/proximanova_bold.otf';
import ProximaNovaLight from '@/assets/fonts/Text/proximanova_light.otf';
import ProximaNovaExtraBold from '@/assets/fonts/Text/proximanova_extrabold.otf';
import ProximaNovaBlack from '@/assets/fonts/Text/proximanova_black.ttf';
import ProximaNovaBlackItalic from '@/assets/fonts/Text/proximanova_blackit.otf';
import ProximaNovaBoldItalic from '@/assets/fonts/Text/proximanova_boldit.otf';

export const Colors = {
  primary: '#79a8ce', // Fond bleu principal
  primaryBorder: '#35446d', // Bord bleu (foncé)
  secondary: '#e9c9d4', // Fond rose
  secondaryBorder: '#eaa4bb', // Bord rose (foncé)
  accent: '#fe734e', // Texte orange sur fond blanc
  error: '#b50043', // Rouge pour erreurs et indicateurs
  success: '#006259', // Vert
  muted: '#7F7D7D', // Gris foncé
  lightMuted: '#EBEBEB', // Gris clair
  white: '#FFFFFF', // Blanc
};

export const loadFonts = async () => {
  await Font.loadAsync({
    // Polices Libre Baskerville pour les titres
    'LibreBaskerville-Regular': LibreBaskervilleRegular,
    'LibreBaskerville-Bold': LibreBaskervilleBold,
    'LibreBaskerville-Italic': LibreBaskervilleItalic,

    // Polices Proxima Nova pour le texte
    'ProximaNova-Regular': ProximaNovaRegular,
    'ProximaNova-Bold': ProximaNovaBold,
    'ProximaNova-Light': ProximaNovaLight,
    'ProximaNova-ExtraBold': ProximaNovaExtraBold,
    'ProximaNova-Black': ProximaNovaBlack,
    'ProximaNova-BlackItalic': ProximaNovaBlackItalic,
    'ProximaNova-BoldItalic': ProximaNovaBoldItalic,
  });
};

export const Fonts = {
  // Nouvelles polices charte 2026
  title: {
    regular: 'LibreBaskerville-Regular',
    bold: 'LibreBaskerville-Bold',
    italic: 'LibreBaskerville-Italic',
  },
  text: {
    light: 'ProximaNova-Light',
    regular: 'ProximaNova-Regular',
    bold: 'ProximaNova-Bold',
    extraBold: 'ProximaNova-ExtraBold',
    black: 'ProximaNova-Black',
    blackItalic: 'ProximaNova-BlackItalic',
    boldItalic: 'ProximaNova-BoldItalic',
  },
};

// Tailles de polices standardisées
export const FontSizes = {
  // Titres
  h1: 28,
  h2: 24,
  h3: 20,
  h4: 18,

  // Texte
  large: 16,
  medium: 14,
  small: 12,
  tiny: 10,
};

// Styles de texte prédéfinis pour une utilisation cohérente
export const TextStyles = {
  // Titres
  h1: {
    fontFamily: 'LibreBaskerville-Regular',
    fontSize: FontSizes.h1,
    lineHeight: FontSizes.h1 * 1.2,
  },
  h1Bold: {
    fontFamily: 'LibreBaskerville-Bold',
    fontSize: FontSizes.h1,
    lineHeight: FontSizes.h1 * 1.2,
  },
  h2: {
    fontFamily: 'LibreBaskerville-Regular',
    fontSize: FontSizes.h2,
    lineHeight: FontSizes.h2 * 1.2,
  },
  h2Bold: {
    fontFamily: 'LibreBaskerville-Bold',
    fontSize: FontSizes.h2,
    lineHeight: FontSizes.h2 * 1.2,
  },
  h3: {
    fontFamily: 'LibreBaskerville-Regular',
    fontSize: FontSizes.h3,
    lineHeight: FontSizes.h3 * 1.2,
  },
  h3Bold: {
    fontFamily: 'LibreBaskerville-Bold',
    fontSize: FontSizes.h3,
    lineHeight: FontSizes.h3 * 1.2,
  },
  h4: {
    fontFamily: 'LibreBaskerville-Regular',
    fontSize: FontSizes.h4,
    lineHeight: FontSizes.h4 * 1.2,
  },
  h4Bold: {
    fontFamily: 'LibreBaskerville-Bold',
    fontSize: FontSizes.h4,
    lineHeight: FontSizes.h4 * 1.2,
  },

  // Texte de contenu
  bodyLarge: {
    fontFamily: 'ProximaNova-Regular',
    fontSize: FontSizes.large,
    lineHeight: FontSizes.large * 1.4,
  },
  body: {
    fontFamily: 'ProximaNova-Regular',
    fontSize: FontSizes.medium,
    lineHeight: FontSizes.medium * 1.4,
  },
  bodyBold: {
    fontFamily: 'ProximaNova-Bold',
    fontSize: FontSizes.medium,
    lineHeight: FontSizes.medium * 1.4,
  },
  small: {
    fontFamily: 'ProximaNova-Regular',
    fontSize: FontSizes.small,
    lineHeight: FontSizes.small * 1.3,
  },

  // Boutons
  button: {
    fontFamily: 'ProximaNova-Bold',
    fontSize: FontSizes.medium,
    lineHeight: FontSizes.medium * 1.2,
  },
  buttonLarge: {
    fontFamily: 'ProximaNova-Bold',
    fontSize: FontSizes.large,
    lineHeight: FontSizes.large * 1.2,
  },
};
