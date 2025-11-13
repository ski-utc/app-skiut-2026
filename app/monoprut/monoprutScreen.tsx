import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, RefreshControl, ActivityIndicator, Modal } from 'react-native';
import { Colors, TextStyles } from '@/constants/GraphSettings';
import Header from '@/components/header';
import BoutonRetour from '@/components/divers/boutonRetour';
import { UtensilsCrossed, Plus } from 'lucide-react-native';
import { apiGet } from '@/constants/api/apiCalls';
import Toast from 'react-native-toast-message';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import ArticleCard from '@/components/monoprut/articleCard';
import CreateArticleModal from '@/components/monoprut/createArticleModal';
import ErrorScreen from '@/components/pages/errorPage';

interface Article {
    id: number;
    product: string;
    quantity: string;
    type: 'fruit' | 'veggie' | 'drink' | 'sweet' | 'snack' | 'dairy' | 'bread' | 'meat' | 'fish' | 'grain' | 'other';
    giver_room_id: number;
    receiver_room_id: number | null;
    giver_room?: {
        roomNumber: string;
        name: string;
    };
    giver_info?: {
        responsible_name: string;
        room: string;
    };
}

export default function MonoprutScreen() {
    const navigation = useNavigation<any>();
    const [articles, setArticles] = useState<Article[]>([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);

    const fetchArticles = async () => {
        try {
            const response = await apiGet('articles');
            if (response.success) {
                setArticles(response.data || []);
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Erreur',
                    text2: response.message || 'Impossible de récupérer les articles.',
                });
            }
        } catch (error: any) {
            setError(error.message || 'Une erreur est survenue.');
            Toast.show({
                type: 'error',
                text1: 'Erreur',
                text2: error.message || 'Une erreur est survenue.',
            });
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            setLoading(true);
            fetchArticles();
        }, [])
    );

    const handleRefresh = () => {
        setRefreshing(true);
        fetchArticles();
    };

    const handleArticleCreated = () => {
        setShowCreateModal(false);
        fetchArticles();
    };

    if (error) {
        return (
            <ErrorScreen error={error} />
        );
    }

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <Header refreshFunction={handleRefresh} disableRefresh={false} />
                <View style={styles.headerContainer}>
                    <BoutonRetour previousRoute="homeNavigator" title="Monoprut" />
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                    <Text style={styles.loadingText}>Chargement des articles...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <Header refreshFunction={handleRefresh} disableRefresh={false} />
            <View style={styles.headerContainer}>
                <BoutonRetour previousRoute="homeNavigator" title="Monoprut" />
            </View>

            <View style={styles.navigationBar}>
                <TouchableOpacity
                    style={[styles.navButton, styles.navButtonActive]}
                    activeOpacity={0.7}
                >
                    <Text style={[styles.navButtonText, styles.navButtonTextActive]}>
                        Articles disponibles
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.navButton}
                    onPress={() => navigation.navigate('MyReservationsScreen')}
                    activeOpacity={0.7}
                >
                    <Text style={styles.navButtonText}>Mes réservations</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.navButton}
                    onPress={() => navigation.navigate('MyOffersScreen')}
                    activeOpacity={0.7}
                >
                    <Text style={styles.navButtonText}>Mes propositions</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
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
                                onUpdate={fetchArticles}
                                showReserveButton={true}
                            />
                        ))}
                    </View>
                )}
            </ScrollView>

            <TouchableOpacity
                style={styles.fab}
                onPress={() => setShowCreateModal(true)}
                activeOpacity={0.8}
            >
                <Plus size={28} color={Colors.white} />
            </TouchableOpacity>

            <Modal
                visible={showCreateModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowCreateModal(false)}
            >
                <CreateArticleModal
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={handleArticleCreated}
                />
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.white,
    },
    headerContainer: {
        paddingHorizontal: 20,
        paddingBottom: 8,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
    },
    loadingText: {
        ...TextStyles.body,
        color: Colors.muted,
    },
    navigationBar: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: Colors.lightMuted,
        gap: 8,
    },
    navButton: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 8,
        backgroundColor: Colors.white,
        borderWidth: 1,
        borderColor: Colors.lightMuted,
        alignItems: 'center',
    },
    navButtonActive: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primaryBorder,
    },
    navButtonText: {
        ...TextStyles.small,
        color: Colors.primaryBorder,
        fontWeight: '600',
        textAlign: 'center',
    },
    navButtonTextActive: {
        color: Colors.white,
    },
    content: {
        flex: 1,
        paddingVertical: 12,
    },
    headerSection: {
        alignItems: 'center',
        paddingVertical: 24,
        paddingHorizontal: 20,
    },
    iconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: `${Colors.primary}15`,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    title: {
        ...TextStyles.h2Bold,
        color: Colors.primaryBorder,
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        ...TextStyles.body,
        color: Colors.muted,
        textAlign: 'center',
        maxWidth: '85%',
    },
    articlesList: {
        paddingHorizontal: 20,
        paddingBottom: 80,
        gap: 12,
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 60,
        paddingHorizontal: 40,
    },
    emptyTitle: {
        ...TextStyles.h3Bold,
        color: Colors.primaryBorder,
        marginTop: 16,
        marginBottom: 8,
    },
    emptyText: {
        ...TextStyles.body,
        color: Colors.muted,
        textAlign: 'center',
    },
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: Colors.accent,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
});

