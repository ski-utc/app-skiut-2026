import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { Colors, TextStyles } from '@/constants/GraphSettings';
import { X, Apple, CupSoda, Candy, Sandwich, Milk, Croissant, Drumstick, Carrot, Fish, Wheat, Package, Shield } from 'lucide-react-native';
import { apiPost } from '@/constants/api/apiCalls';
import Toast from 'react-native-toast-message';
import Checkbox from 'expo-checkbox';

interface CreateArticleModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

type ArticleType = 'fruit' | 'veggie' | 'drink' | 'sweet' | 'snack' | 'dairy' | 'bread' | 'meat' | 'fish' | 'grain' | 'other';

const foodTypes: { value: ArticleType; label: string; icon: any }[] = [
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

export default function CreateArticleModal({ onClose, onSuccess }: CreateArticleModalProps) {
    const [product, setProduct] = useState('');
    const [quantity, setQuantity] = useState('');
    const [type, setType] = useState<ArticleType>('other');
    const [loading, setLoading] = useState(false);
    const [isChecked, setChecked] = useState(false);

    const handleCheckboxPress = () => {
        setChecked(!isChecked);
        Keyboard.dismiss();
    };

    const handleSubmit = async () => {
        if (!product.trim()) {
            Toast.show({
                type: 'error',
                text1: 'Champ requis',
                text2: 'Veuillez entrer le nom de l\'article.',
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
            const response = await apiPost('createArticle', {
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
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Erreur',
                    text2: response.message || 'Impossible de créer l\'article.',
                });
            }
        } catch (error: any) {
            Toast.show({
                type: 'error',
                text1: 'Erreur',
                text2: error.message || 'Une erreur est survenue.',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <View style={styles.modal}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Proposer un article</Text>
                        <TouchableOpacity style={styles.closeButton} onPress={onClose} disabled={loading}>
                            <X size={24} color={Colors.primaryBorder} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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
                            <Text style={styles.hint}>Sélectionnez la catégorie correspondante</Text>
                            <View style={styles.typesGrid}>
                                {foodTypes.map((foodType) => {
                                    const IconComponent = foodType.icon;
                                    const isSelected = type === foodType.value;

                                    return (
                                        <TouchableOpacity
                                            key={foodType.value}
                                            style={[styles.typeButton, isSelected && styles.typeButtonSelected]}
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
                                            <Text style={[styles.typeLabel, isSelected && styles.typeLabelSelected]}>
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
                                            Je garantis que l'article a été conservé dans des conditions correctes.
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </ScrollView>

                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={[styles.cancelButton, loading && styles.buttonDisabled]}
                            onPress={onClose}
                            disabled={loading}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.cancelButtonText}>Annuler</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.submitButton, loading && styles.buttonDisabled, { opacity: loading || !isChecked ? 0.5 : 1 }]}
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
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    keyboardView: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    modal: {
        backgroundColor: Colors.white,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '90%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 12,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: Colors.lightMuted,
    },
    title: {
        ...TextStyles.h2Bold,
        color: Colors.primaryBorder,
    },
    closeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.lightMuted,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        paddingHorizontal: 20,
        paddingVertical: 20,
    },
    formGroup: {
        marginBottom: 24,
    },
    label: {
        ...TextStyles.bodyBold,
        color: Colors.primaryBorder,
        marginBottom: 8,
    },
    hint: {
        ...TextStyles.small,
        color: Colors.muted,
        marginBottom: 12,
    },
    input: {
        ...TextStyles.body,
        color: Colors.primaryBorder,
        backgroundColor: Colors.white,
        borderWidth: 1,
        borderColor: Colors.lightMuted,
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    typesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    typeButton: {
        width: '30%',
        aspectRatio: 1,
        backgroundColor: Colors.white,
        borderWidth: 2,
        borderColor: Colors.lightMuted,
        borderRadius: 12,
        padding: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    typeButtonSelected: {
        borderColor: Colors.primary,
        backgroundColor: `${Colors.primary}08`,
    },
    typeIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: `${Colors.primary}15`,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    typeIconContainerSelected: {
        backgroundColor: Colors.primary,
    },
    typeLabel: {
        ...TextStyles.small,
        color: Colors.primaryBorder,
        textAlign: 'center',
        fontWeight: '600',
    },
    typeLabelSelected: {
        color: Colors.primary,
    },
    termsSection: {
        marginVertical: 10,
    },
    termsRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
    },
    checkbox: {
        width: 24,
        height: 24,
        marginTop: 2,
    },
    termsTextContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
    },
    termsText: {
        ...TextStyles.small,
        color: Colors.primaryBorder,
        lineHeight: 18,
        flex: 1,
    },
    footer: {
        flexDirection: 'row',
        gap: 12,
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: Colors.lightMuted,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: Colors.primaryBorder,
        alignItems: 'center',
    },
    cancelButtonText: {
        ...TextStyles.bodyBold,
        color: Colors.primaryBorder,
    },
    submitButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 8,
        backgroundColor: Colors.accent,
        alignItems: 'center',
    },
    submitButtonText: {
        ...TextStyles.bodyBold,
        color: Colors.white,
    },
    buttonDisabled: {
        opacity: 0.5,
    },
});

