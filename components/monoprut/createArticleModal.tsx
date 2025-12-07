import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  X,
  Apple,
  CupSoda,
  Candy,
  Sandwich,
  Milk,
  Croissant,
  Drumstick,
  Carrot,
  Fish,
  Wheat,
  Package,
  LucideProps,
} from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { Checkbox } from 'expo-checkbox';

import { useUser } from '@/contexts/UserContext';
import { apiPost, handleApiErrorToast } from '@/constants/api/apiCalls';
import { Colors, TextStyles } from '@/constants/GraphSettings';

type CreateArticleModalProps = {
  onClose: () => void;
  onSuccess: () => void;
};

type ArticleType =
  | 'fruit'
  | 'veggie'
  | 'drink'
  | 'sweet'
  | 'snack'
  | 'dairy'
  | 'bread'
  | 'meat'
  | 'fish'
  | 'grain'
  | 'other';

const foodTypes: {
  value: ArticleType;
  label: string;
  icon: React.FC<LucideProps>;
}[] = [
  { value: 'fruit', label: 'Fruit', icon: Apple },
  { value: 'veggie', label: 'Légume', icon: Carrot },
  { value: 'drink', label: 'Boisson', icon: CupSoda },
  { value: 'sweet', label: 'Sucrerie', icon: Candy },
  { value: 'snack', label: 'Snack', icon: Sandwich },
  { value: 'dairy', label: 'Produit laitier', icon: Milk },
  { value: 'bread', label: 'Pain', icon: Croissant },
  { value: 'meat', label: 'Viande', icon: Drumstick },
  { value: 'fish', label: 'Poisson', icon: Fish },
  { value: 'grain', label: 'Céréale', icon: Wheat },
  { value: 'other', label: 'Autre', icon: Package },
];

export default function CreateArticleModal({
  onClose,
  onSuccess,
}: CreateArticleModalProps) {
  const [product, setProduct] = useState('');
  const [quantity, setQuantity] = useState('');
  const [type, setType] = useState<ArticleType>('other');
  const [loading, setLoading] = useState(false);
  const [isChecked, setChecked] = useState(false);

  const { setUser } = useUser();

  // Animations for modal
  const slideAnim = useRef(new Animated.Value(1000)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Trigger animation on mount
  useEffect(() => {
    slideAnim.setValue(1000);
    fadeAnim.setValue(0);
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  }, [slideAnim, fadeAnim]);

  const animateClose = (callback: () => void) => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 1000,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => callback());
  };

  const activeOpacity = 1;
  const inactiveOpacity = 0.4;

  const handleCheckboxPress = () => {
    setChecked(!isChecked);
    Keyboard.dismiss();
  };

  const handleSubmit = async () => {
    if (!product.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Champ requis',
        text2: "Veuillez entrer le nom de l'article.",
      });
      return;
    }

    if (!quantity.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Champ requis',
        text2: 'Veuillez entrer la quantité.',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await apiPost('articles', {
        product: product.trim(),
        quantity: quantity.trim(),
        type,
      });

      if (response.success) {
        Toast.show({
          type: 'success',
          text1: 'Article créé',
          text2: 'Votre article a été ajouté avec succès.',
        });
        onSuccess();
      } else if (response.pending) {
        Toast.show({
          type: 'info',
          text1: 'Requête sauvegardée',
          text2: response.message,
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Erreur',
          text2: response.message || "Impossible de créer l'article.",
        });
      }
    } catch (error: unknown) {
      handleApiErrorToast(error, setUser);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <TouchableOpacity
          style={{ flex: 1 }}
          activeOpacity={1}
          onPress={() => animateClose(onClose)}
        />
      </Animated.View>

      <Animated.View
        style={[
          styles.modalWrapper,
          { transform: [{ translateY: slideAnim }] },
        ]}
      >
        <SafeAreaView style={styles.safeArea}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardView}
          >
            <View style={styles.modal}>
              <View style={styles.header}>
                <Text style={styles.title}>Proposer un article</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => animateClose(onClose)}
                  disabled={loading}
                >
                  <X size={24} color={Colors.primaryBorder} />
                </TouchableOpacity>
              </View>

              <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Nom de l'article *</Text>
                  <TextInput
                    style={styles.input}
                    value={product}
                    onChangeText={setProduct}
                    placeholder="Ex: Pommes, Pain, Pâtes..."
                    placeholderTextColor={Colors.muted}
                    editable={!loading}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Quantité *</Text>
                  <TextInput
                    style={styles.input}
                    value={quantity}
                    onChangeText={setQuantity}
                    placeholder="Ex: 3 pommes, 1 baguette, 500g..."
                    placeholderTextColor={Colors.muted}
                    editable={!loading}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Type d'aliment *</Text>
                  <Text style={styles.hint}>
                    Sélectionnez la catégorie correspondante
                  </Text>
                  <View style={styles.typesGrid}>
                    {foodTypes.map((foodType) => {
                      const IconComponent = foodType.icon;
                      const isSelected = type === foodType.value;

                      return (
                        <TouchableOpacity
                          key={foodType.value}
                          style={[
                            styles.typeButton,
                            isSelected && styles.typeButtonSelected,
                          ]}
                          onPress={() => setType(foodType.value)}
                          disabled={loading}
                          activeOpacity={0.7}
                        >
                          <View
                            style={[
                              styles.typeIconContainer,
                              isSelected && styles.typeIconContainerSelected,
                            ]}
                          >
                            <IconComponent
                              size={24}
                              color={isSelected ? Colors.white : Colors.primary}
                            />
                          </View>
                          <Text
                            style={[
                              styles.typeLabel,
                              isSelected && styles.typeLabelSelected,
                            ]}
                          >
                            {foodType.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                  <View style={styles.termsSection}>
                    <View style={styles.termsRow}>
                      <Checkbox
                        style={styles.checkbox}
                        value={isChecked}
                        onValueChange={handleCheckboxPress}
                        color={isChecked ? Colors.primary : undefined}
                      />
                      <View style={styles.termsTextContainer}>
                        <Text style={styles.termsText}>
                          Je garantis que l'article a été conservé dans des
                          conditions correctes.
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </ScrollView>

              <View style={styles.footer}>
                <TouchableOpacity
                  style={[
                    styles.cancelButton,
                    loading && styles.buttonDisabled,
                  ]}
                  onPress={onClose}
                  disabled={loading}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelButtonText}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    loading && styles.buttonDisabled,
                    {
                      opacity:
                        loading || !isChecked ? inactiveOpacity : activeOpacity,
                    },
                  ]}
                  onPress={handleSubmit}
                  disabled={loading || !isChecked}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color={Colors.white} />
                  ) : (
                    <Text style={styles.submitButtonText}>Publier</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonDisabled: {
    opacity: 0.5,
  },
  cancelButton: {
    alignItems: 'center',
    borderColor: Colors.primaryBorder,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    paddingVertical: 14,
  },
  cancelButtonText: {
    ...TextStyles.bodyBold,
    color: Colors.primaryBorder,
  },
  checkbox: {
    height: 24,
    marginTop: 2,
    width: 24,
  },
  closeButton: {
    alignItems: 'center',
    backgroundColor: Colors.lightMuted,
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  footer: {
    borderTopColor: Colors.lightMuted,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  formGroup: {
    marginBottom: 24,
  },
  header: {
    alignItems: 'center',
    borderBottomColor: Colors.lightMuted,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  hint: {
    ...TextStyles.small,
    color: Colors.muted,
    marginBottom: 12,
  },
  input: {
    ...TextStyles.body,
    backgroundColor: Colors.white,
    borderColor: Colors.lightMuted,
    borderRadius: 8,
    borderWidth: 1,
    color: Colors.primaryBorder,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  label: {
    ...TextStyles.bodyBold,
    color: Colors.primaryBorder,
    marginBottom: 8,
  },
  modal: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    elevation: 12,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  modalWrapper: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  safeArea: {
    maxHeight: '90%',
  },
  submitButton: {
    alignItems: 'center',
    backgroundColor: Colors.accent,
    borderRadius: 8,
    flex: 1,
    paddingVertical: 14,
  },
  submitButtonText: {
    ...TextStyles.bodyBold,
    color: Colors.white,
  },
  termsRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
  },
  termsSection: {
    marginVertical: 10,
  },
  termsText: {
    ...TextStyles.small,
    color: Colors.primaryBorder,
    flex: 1,
    lineHeight: 18,
  },
  termsTextContainer: {
    alignItems: 'flex-start',
    flex: 1,
    flexDirection: 'row',
    gap: 8,
  },
  title: {
    ...TextStyles.h2Bold,
    color: Colors.primaryBorder,
  },
  typeButton: {
    alignItems: 'center',
    aspectRatio: 1,
    backgroundColor: Colors.white,
    borderColor: Colors.lightMuted,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    padding: 12,
    width: '30%',
  },
  typeButtonSelected: {
    backgroundColor: `${Colors.primary}08`,
    borderColor: Colors.primary,
  },
  typeIconContainer: {
    alignItems: 'center',
    backgroundColor: `${Colors.primary}15`,
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    marginBottom: 8,
    width: 48,
  },
  typeIconContainerSelected: {
    backgroundColor: Colors.primary,
  },
  typeLabel: {
    ...TextStyles.small,
    color: Colors.primaryBorder,
    fontWeight: '600',
    textAlign: 'center',
  },
  typeLabelSelected: {
    color: Colors.primary,
  },
  typesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
});
