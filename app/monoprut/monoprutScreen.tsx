import { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Modal,
  TextInput,
  Keyboard,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  UtensilsCrossed,
  Plus,
  ShoppingBag,
  Clock,
  Package,
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
  LucideProps,
} from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import {
  useNavigation,
  useFocusEffect,
  NavigationProp,
} from '@react-navigation/native';
import { Checkbox } from 'expo-checkbox';

import { Colors, TextStyles } from '@/constants/GraphSettings';
import Header from '@/components/header';
import BoutonRetour from '@/components/divers/boutonRetour';
import {
  apiGet,
  apiPost,
  isSuccessResponse,
  handleApiErrorToast,
  handleApiErrorScreen,
} from '@/constants/api/apiCalls';
import ArticleCard from '@/components/monoprut/articleCard';
import ErrorScreen from '@/components/pages/errorPage';
import { useUser } from '@/contexts/UserContext';

import { MonoprutStackParamList } from '../monoprutNavigator';

type RoomInfo = {
  roomNumber: string;
  name: string;
};

type GiverInfo = {
  responsible_name: string;
  room: string;
};

type Article = {
  id: number;
  product: string;
  quantity: string;
  type:
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
  giver_room_id: number;
  receiver_room_id: number | null;
  giver_room?: RoomInfo;
  giver_info?: GiverInfo;
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

export default function MonoprutScreen() {
  const navigation = useNavigation<NavigationProp<MonoprutStackParamList>>();
  const { setUser } = useUser();

  const [articles, setArticles] = useState<Article[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [formProduct, setFormProduct] = useState('');
  const [formQuantity, setFormQuantity] = useState('');
  const [formType, setFormType] = useState<ArticleType>('other');
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formIsChecked, setFormIsChecked] = useState(false);

  const slideAnim = useRef(new Animated.Value(1000)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const fetchArticles = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setError('');
      }

      try {
        const response = await apiGet<Article[]>('articles');

        if (isSuccessResponse(response)) {
          setArticles(response.data || []);
        }
      } catch (err: unknown) {
        if (isRefresh) {
          handleApiErrorToast(err, setUser);
        } else {
          handleApiErrorScreen(err, setUser, setError);
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [setUser],
  );

  useFocusEffect(
    useCallback(() => {
      if (articles.length === 0) setLoading(true);
      fetchArticles(false);
    }, [articles.length, fetchArticles]),
  );

  const handleRefresh = () => {
    fetchArticles(true);
  };

  const openCreateModal = () => {
    setShowCreateModal(true);
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
  };

  const closeCreateModal = () => {
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
    ]).start(() => {
      setShowCreateModal(false);
      resetForm();
    });
  };

  const resetForm = () => {
    setFormProduct('');
    setFormQuantity('');
    setFormType('other');
    setFormIsChecked(false);
  };

  const handleCheckboxPress = () => {
    setFormIsChecked(!formIsChecked);
    Keyboard.dismiss();
  };

  const handleSubmit = async () => {
    if (!formProduct.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Champ requis',
        text2: "Veuillez entrer le nom de l'article.",
      });
      return;
    }

    if (!formQuantity.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Champ requis',
        text2: 'Veuillez entrer la quantité.',
      });
      return;
    }

    setFormSubmitting(true);
    try {
      const response = await apiPost('articles', {
        product: formProduct.trim(),
        quantity: formQuantity.trim(),
        type: formType,
      });

      if (response.success) {
        Toast.show({
          type: 'success',
          text1: 'Article créé',
          text2: 'Votre article a été ajouté avec succès.',
        });
        resetForm();
        setShowCreateModal(false);
        fetchArticles(true);
      } else if (response.pending) {
        Toast.show({
          type: 'info',
          text1: 'Requête sauvegardée',
          text2: response.message,
        });
        resetForm();
        setShowCreateModal(false);
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
      setFormSubmitting(false);
    }
  };

  if (error) {
    return <ErrorScreen error={error} />;
  }

  if (loading && articles.length === 0) {
    return (
      <SafeAreaView
        style={styles.container}
        edges={['bottom', 'left', 'right']}
      >
        <Header refreshFunction={undefined} disableRefresh={true} />
        <View style={styles.headerContainer}>
          <BoutonRetour title="Monoprut" />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Chargement des articles...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <Header refreshFunction={handleRefresh} disableRefresh={refreshing} />
      <View style={styles.headerContainer}>
        <BoutonRetour title="Monoprut" />
      </View>

      <View style={styles.navigationBar}>
        <TouchableOpacity
          style={[styles.navButton, styles.navButtonActive]}
          activeOpacity={0.7}
        >
          <ShoppingBag size={18} color={Colors.white} strokeWidth={2.5} />
          <Text style={[styles.navButtonText, styles.navButtonTextActive]}>
            Disponibles
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate('MyReservationsScreen')}
          activeOpacity={0.7}
        >
          <Clock size={18} color={Colors.primaryBorder} strokeWidth={2.5} />
          <Text style={styles.navButtonText}>Réservations</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.navigate('MyOffersScreen')}
          activeOpacity={0.7}
        >
          <Package size={18} color={Colors.primaryBorder} strokeWidth={2.5} />
          <Text style={styles.navButtonText}>Propositions</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
      >
        {articles.length === 0 ? (
          <View style={styles.emptyContainer}>
            <UtensilsCrossed size={48} color={Colors.muted} />
            <Text style={styles.emptyTitle}>Aucun article disponible</Text>
            <Text style={styles.emptyText}>
              Soyez le premier à proposer de la nourriture !
            </Text>
          </View>
        ) : (
          <View style={styles.articlesList}>
            {articles.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                onUpdate={() => fetchArticles(true)}
                showReserveButton={true}
              />
            ))}
          </View>
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={openCreateModal}
        activeOpacity={0.8}
      >
        <Plus size={28} color={Colors.white} />
      </TouchableOpacity>

      <Modal
        visible={showCreateModal}
        animationType="none"
        transparent={true}
        statusBarTranslucent={true}
        onRequestClose={closeCreateModal}
      >
        <Animated.View style={[styles.modalOverlay, { opacity: fadeAnim }]}>
          <TouchableOpacity
            style={styles.container}
            activeOpacity={1}
            onPress={closeCreateModal}
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.modalAnimatedContainer,
            { transform: [{ translateY: slideAnim }] },
          ]}
          pointerEvents="box-none"
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
            style={styles.modalContainer}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Proposer un article</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={closeCreateModal}
                disabled={formSubmitting}
              >
                <X size={24} color={Colors.primaryBorder} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalContentScroll}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.formGroup}>
                <Text style={styles.label}>Nom de l'article *</Text>
                <TextInput
                  style={styles.input}
                  value={formProduct}
                  onChangeText={setFormProduct}
                  placeholder="Ex: Pommes, Pain, Pâtes..."
                  placeholderTextColor={Colors.muted}
                  editable={!formSubmitting}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Quantité *</Text>
                <TextInput
                  style={styles.input}
                  value={formQuantity}
                  onChangeText={setFormQuantity}
                  placeholder="Ex: 3 pommes, 1 baguette, 500g..."
                  placeholderTextColor={Colors.muted}
                  editable={!formSubmitting}
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
                    const isSelected = formType === foodType.value;

                    return (
                      <TouchableOpacity
                        key={foodType.value}
                        style={[
                          styles.typeButton,
                          isSelected && styles.typeButtonSelected,
                        ]}
                        onPress={() => setFormType(foodType.value)}
                        disabled={formSubmitting}
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
                      value={formIsChecked}
                      onValueChange={handleCheckboxPress}
                      color={formIsChecked ? Colors.primary : undefined}
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
                  formSubmitting && styles.buttonDisabled,
                ]}
                onPress={closeCreateModal}
                disabled={formSubmitting}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  formSubmitting && styles.buttonDisabled,
                  (!formIsChecked || formSubmitting) && styles.buttonDisabled,
                ]}
                onPress={handleSubmit}
                disabled={formSubmitting || !formIsChecked}
              >
                {formSubmitting ? (
                  <ActivityIndicator size="small" color={Colors.white} />
                ) : (
                  <Text style={styles.submitButtonText}>Publier</Text>
                )}
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  articlesList: {
    gap: 12,
    paddingBottom: 80,
    paddingHorizontal: 20,
  },
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
    backgroundColor: Colors.white,
    flex: 1,
  },
  content: {
    flex: 1,
    paddingVertical: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyText: {
    ...TextStyles.body,
    color: Colors.muted,
    textAlign: 'center',
  },
  emptyTitle: {
    ...TextStyles.h3Bold,
    color: Colors.primaryBorder,
    marginBottom: 8,
    marginTop: 16,
  },
  fab: {
    alignItems: 'center',
    backgroundColor: Colors.accent,
    borderRadius: 28,
    bottom: 24,
    elevation: 8,
    height: 56,
    justifyContent: 'center',
    position: 'absolute',
    right: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    width: 56,
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
  headerContainer: {
    paddingBottom: 8,
    paddingHorizontal: 20,
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
  label: {
    ...TextStyles.bodyBold,
    color: Colors.primaryBorder,
    marginBottom: 8,
  },
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    gap: 16,
    justifyContent: 'center',
  },
  loadingText: {
    ...TextStyles.body,
    color: Colors.muted,
  },
  modalAnimatedContainer: {
    bottom: 0,
    justifyContent: 'flex-end',
    left: 0,
    position: 'absolute',
    right: 0,
  },
  modalContainer: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    elevation: 12,
    maxHeight: '70%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  modalContentScroll: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  modalHeader: {
    alignItems: 'center',
    borderBottomColor: Colors.lightMuted,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  modalOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  modalTitle: {
    ...TextStyles.h2Bold,
    color: Colors.primaryBorder,
  },
  navButton: {
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderColor: Colors.lightMuted,
    borderRadius: 12,
    borderWidth: 1,
    elevation: 3,
    flex: 1,
    flexDirection: 'column',
    gap: 6,
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  navButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    elevation: 6,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  navButtonText: {
    ...TextStyles.small,
    color: Colors.primaryBorder,
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 14,
    textAlign: 'center',
  },
  navButtonTextActive: {
    color: Colors.white,
  },
  navigationBar: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 4,
    paddingHorizontal: 20,
    paddingVertical: 12,
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
