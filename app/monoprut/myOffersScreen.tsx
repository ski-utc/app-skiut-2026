import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, RefreshControl, ActivityIndicator, Modal } from 'react-native';
import { Package, Plus, ShoppingBag, Clock } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { useNavigation, useFocusEffect, NavigationProp } from '@react-navigation/native';

import { Colors, TextStyles } from '@/constants/GraphSettings';
import Header from '@/components/header';
import BoutonRetour from '@/components/divers/boutonRetour';
import { apiGet, isSuccessResponse, handleApiErrorToast, handleApiErrorScreen } from '@/constants/api/apiCalls';
import ArticleCard from '@/components/monoprut/articleCard';
import CreateArticleModal from '@/components/monoprut/createArticleModal';
import ErrorScreen from '@/components/pages/errorPage';
import { useUser } from '@/contexts/UserContext';

type MonoprutStackParamList = {
    MonoprutScreen: undefined;
    MyReservationsScreen: undefined;
    MyOffersScreen: undefined;
};

type RoomInfo = {
    roomNumber: string;
    name: string;
    id: number;
};

type PersonInfo = {
    responsible_name: string;
    room: string;
};

type Article = {
    id: number;
    product: string;
    quantity: string;
    type: 'fruit' | 'veggie' | 'drink' | 'sweet' | 'snack' | 'dairy' | 'bread' | 'meat' | 'fish' | 'grain' | 'other';
    giver_room_id: number;
    receiver_room_id: number | null;
    receiver_room?: RoomInfo;
    receiver_info?: PersonInfo;
    giver_info?: PersonInfo;
}

export default function MyOffersScreen() {
    const navigation = useNavigation<NavigationProp<MonoprutStackParamList>>();
    const { setUser } = useUser();

    const [articles, setArticles] = useState<Article[]>([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);

    const fetchArticles = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setError('');

        try {
            const response = await apiGet<Article[]>('articles/given');

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
    }, [setUser]);

    useFocusEffect(
        useCallback(() => {
            if (articles.length === 0) setLoading(true);
            fetchArticles(false);
        }, [articles.length, fetchArticles])
    );

    const handleRefresh = () => {
        fetchArticles(true);
    };

    const handleArticleCreated = () => {
        setShowCreateModal(false);
        Toast.show({
            type: 'success',
            text1: 'Article créé !',
            text2: 'Votre proposition est en ligne.'
        });
        fetchArticles(true);
    };

    if (error) {
        return <ErrorScreen error={error} />;
    }

    if (loading && articles.length === 0) {
        return (
            <SafeAreaView style={styles.container}>
                <Header refreshFunction={undefined} disableRefresh={true} />
                <View style={styles.headerContainer}>
                    <BoutonRetour title="Mes propositions" />
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
            <Header refreshFunction={handleRefresh} disableRefresh={refreshing} />
            <View style={styles.headerContainer}>
                <BoutonRetour title="Mes propositions" />
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
                    style={styles.navButton}
                    onPress={() => navigation.navigate('MyReservationsScreen')}
                    activeOpacity={0.7}
                >
                    <Clock size={18} color={Colors.primaryBorder} strokeWidth={2.5} />
                    <Text style={styles.navButtonText}>Réservations</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.navButton, styles.navButtonActive]}
                    activeOpacity={0.7}
                >
                    <Package size={18} color={Colors.white} strokeWidth={2.5} />
                    <Text style={[styles.navButtonText, styles.navButtonTextActive]}>
                        Propositions
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={[Colors.accent]}
                        tintColor={Colors.accent}
                    />
                }
            >
                {articles.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Package size={48} color={Colors.muted} />
                        <Text style={styles.emptyTitle}>Aucune proposition</Text>
                        <Text style={styles.emptyText}>
                            Proposez de la nourriture à partager avec les autres chambres !
                        </Text>
                        <TouchableOpacity
                            style={styles.addButton}
                            onPress={() => setShowCreateModal(true)}
                            activeOpacity={0.7}
                        >
                            <Plus size={20} color={Colors.white} />
                            <Text style={styles.addButtonText}>Proposer un article</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.articlesList}>
                        {articles.map((article) => (
                            <ArticleCard
                                key={article.id}
                                article={article}
                                onUpdate={() => fetchArticles(true)}
                                showReserveButton={false}
                                isMyOffer={true}
                            />
                        ))}
                    </View>
                )}
            </ScrollView>

            {articles.length > 0 && (
                <TouchableOpacity
                    style={styles.fab}
                    onPress={() => setShowCreateModal(true)}
                    activeOpacity={0.8}
                >
                    <Plus size={28} color={Colors.white} />
                </TouchableOpacity>
            )}

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
    addButton: {
        alignItems: 'center',
        backgroundColor: Colors.accent,
        borderRadius: 24,
        elevation: 4,
        flexDirection: 'row',
        gap: 8,
        paddingHorizontal: 24,
        paddingVertical: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    addButtonText: {
        ...TextStyles.bodyBold,
        color: Colors.white,
    },
    articlesList: {
        gap: 12,
        paddingBottom: 80,
        paddingHorizontal: 20,
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
        marginBottom: 24,
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
    headerContainer: {
        paddingBottom: 8,
        paddingHorizontal: 20,
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
        backgroundColor: Colors.accent,
        borderColor: Colors.accent,
        elevation: 6,
        shadowColor: Colors.accent,
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
});
