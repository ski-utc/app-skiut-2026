import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { Colors, TextStyles } from '@/constants/GraphSettings';
import Header from '@/components/header';
import BoutonRetour from '@/components/divers/boutonRetour';
import { ShoppingBasket, ShoppingBag, Clock, Package } from 'lucide-react-native';
import { apiGet, apiPost, apiPut } from '@/constants/api/apiCalls';
import Toast from 'react-native-toast-message';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import ArticleCard from '@/components/monoprut/articleCard';
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

export default function MyReservationsScreen() {
    const navigation = useNavigation<any>();
    const [articles, setArticles] = useState<Article[]>([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchArticles = async () => {
        try {
            const response = await apiGet('articles/received');
            if (response.success) {
                setArticles(response.data || []);
                console.log(response.data);
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Erreur',
                    text2: response.message || 'Impossible de récupérer vos réservations.',
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

    const handleMarkAsRetrieved = async (articleId: number) => {
        try {
            const response = await apiPut(`articles/${articleId}/retrieve`, {});
            if (response.success) {
                Toast.show({
                    type: 'success',
                    text1: 'Succès',
                    text2: 'Article marqué comme récupéré',
                });
                setArticles(articles.filter(a => a.id !== articleId));
            } else if (response.pending) {
                Toast.show({
                    type: 'info',
                    text1: 'Requête sauvegardée',
                    text2: response.message,
                });
                setArticles(articles.filter(a => a.id !== articleId));
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Erreur',
                    text2: response.message || 'Impossible de marquer l\'article comme récupéré',
                });
            }
        } catch (error: any) {
            Toast.show({
                type: 'error',
                text1: 'Erreur',
                text2: error.message || 'Une erreur est survenue',
            });
        }
    };

    const handleCancelReservation = async (articleId: number) => {
        try {
            const response = await apiPost(`articles/${articleId}/cancel-reservation`, {});
            if (response.success) {
                Toast.show({
                    type: 'success',
                    text1: 'Succès',
                    text2: 'Réservation annulée',
                });
                setArticles(articles.filter(a => a.id !== articleId));
            } else if (response.pending) {
                Toast.show({
                    type: 'info',
                    text1: 'Requête sauvegardée',
                    text2: response.message,
                });
                setArticles(articles.filter(a => a.id !== articleId));
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Erreur',
                    text2: response.message || 'Impossible d\'annuler la réservation',
                });
            }
        } catch (error: any) {
            Toast.show({
                type: 'error',
                text1: 'Erreur',
                text2: error.message || 'Une erreur est survenue',
            });
        }
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
                    <BoutonRetour previousRoute="MonoprutScreen" title="Mes réservations" />
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                    <Text style={styles.loadingText}>Chargement...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <Header refreshFunction={handleRefresh} disableRefresh={false} />
            <View style={styles.headerContainer}>
                <BoutonRetour previousRoute="MonoprutScreen" title="Mes réservations" />
            </View>

            <View style={styles.navigationBar}>
                <TouchableOpacity
                    style={styles.navButton}
                    onPress={() => navigation.navigate('MonoprutScreen')}
                    activeOpacity={0.7}
                >
                    <ShoppingBag size={18} color={Colors.primaryBorder} strokeWidth={2.5} />
                    <Text style={styles.navButtonText}>Disponibles</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.navButton, styles.navButtonActive]}
                    activeOpacity={0.7}
                >
                    <Clock size={18} color={Colors.white} strokeWidth={2.5} />
                    <Text style={[styles.navButtonText, styles.navButtonTextActive]}>
                        Réservations
                    </Text>
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
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                }
            >
                {articles.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <ShoppingBasket size={48} color={Colors.muted} />
                        <Text style={styles.emptyTitle}>Aucune réservation</Text>
                        <Text style={styles.emptyText}>
                            Vous n'avez pas encore réservé d'article.
                        </Text>
                    </View>
                ) : (
                    <View style={styles.articlesList}>
                        {articles.map((article) => (
                            <ArticleCard
                                key={article.id}
                                article={article}
                                onUpdate={fetchArticles}
                                showReserveButton={false}
                                isReservation={true}
                                onMarkAsRetrieved={handleMarkAsRetrieved}
                                onCancelReservation={handleCancelReservation}
                            />
                        ))}
                    </View>
                )}
            </ScrollView>
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
        paddingVertical: 12,
        marginBottom: 4,
        gap: 10,
    },
    navButton: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderRadius: 12,
        backgroundColor: Colors.white,
        borderWidth: 1,
        borderColor: Colors.lightMuted,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 3,
    },
    navButtonActive: {
        backgroundColor: Colors.success,
        borderColor: Colors.success,
        shadowColor: Colors.success,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
        elevation: 6,
    },
    navButtonText: {
        ...TextStyles.small,
        fontSize: 11,
        color: Colors.primaryBorder,
        fontWeight: '600',
        textAlign: 'center',
        lineHeight: 14,
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
        backgroundColor: `${Colors.success}15`,
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
        paddingBottom: 24,
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
});

