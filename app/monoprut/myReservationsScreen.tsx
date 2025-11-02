import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { Colors, TextStyles } from '@/constants/GraphSettings';
import Header from '@/components/header';
import BoutonRetour from '@/components/divers/boutonRetour';
import { ShoppingBasket } from 'lucide-react-native';
import { apiGet, apiPost } from '@/constants/api/apiCalls';
import Toast from 'react-native-toast-message';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import ArticleCard from '@/components/monoprut/articleCard';

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
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchArticles = async () => {
        try {
            const response = await apiGet('myReceivedArticles');
            if (response.success) {
                setArticles(response.data || []);
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Erreur',
                    text2: response.message || 'Impossible de récupérer vos réservations.',
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
            const response = await apiPost('markAsRetrieved', { articleId });
            if (response.success) {
                Toast.show({
                    type: 'success',
                    text1: 'Succès',
                    text2: 'Article marqué comme récupéré',
                });
                // Retirer l'article de la liste
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
            const response = await apiPost('cancelReservation', { articleId });
            if (response.success) {
                Toast.show({
                    type: 'success',
                    text1: 'Succès',
                    text2: 'Réservation annulée',
                });
                // Retirer l'article de la liste
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
                    <Text style={styles.navButtonText}>Articles disponibles</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.navButton, styles.navButtonActive]}
                    activeOpacity={0.7}
                >
                    <Text style={[styles.navButtonText, styles.navButtonTextActive]}>
                        Mes réservations
                    </Text>
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
                {/* <View style={styles.headerSection}>
                    <View style={styles.iconCircle}>
                        <ShoppingBasket size={28} color={Colors.success} />
                    </View>
                    <Text style={styles.title}>Mes réservations</Text>
                    <Text style={styles.subtitle}>
                        Articles que vous avez réservés auprès d'autres chambres
                    </Text>
                </View> */}

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
        backgroundColor: Colors.success,
        borderColor: Colors.success,
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

