import { useEffect, useState, useRef, useCallback } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, Animated, TouchableOpacity, SafeAreaView } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import { Check, X, HelpCircle, MessageSquare, AlertTriangle } from 'lucide-react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

import { useUser } from '@/contexts/UserContext';
import BoutonRetour from '@/components/divers/boutonRetour';
import { apiGet, apiPut } from '@/constants/api/apiCalls';
import ErrorScreen from '@/components/pages/errorPage';
import { Colors, TextStyles } from '@/constants/GraphSettings';

import Header from '../../components/header';

type ValideAnecdotesRapideStackParamList = {
    valideAnecdotesRapide: undefined;
}

type Anecdote = {
    id: number;
    text: string;
    nbLikes: number;
    nbWarns: number;
    user: {
        id: number;
        firstName: string;
        lastName: string;
    };
    room: {
        id: number;
        name: string;
        roomNumber: string;
    };
    valid: boolean;
}

export default function ValideAnecdotesRapide() {
    const [error, setError] = useState('');
    const [noAnecdotes, setNoAnecdotes] = useState(false);
    const [anecdote, setAnecdote] = useState<Anecdote | null>(null);
    const [loading, setLoading] = useState(false);
    const [processing, setProcessing] = useState(false);

    const { setUser } = useUser();
    const navigation = useNavigation<NavigationProp<ValideAnecdotesRapideStackParamList>>();

    const translateX = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(0)).current;
    const cardOpacity = useRef(new Animated.Value(1)).current;
    const validOpacity = useRef(new Animated.Value(0)).current;
    const rejectOpacity = useRef(new Animated.Value(0)).current;

    const activeOpacity = 1;
    const inactiveOpacity = 0.4;

    const handleGesture = Animated.event(
        [{ nativeEvent: { translationX: translateX } }],
        { useNativeDriver: false }
    );

    const handleGestureEnd = ({ nativeEvent }: { nativeEvent: any }) => {
        translateY.setValue(0);

        if (nativeEvent.translationX > 120) {
            Animated.timing(validOpacity, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start(() => {
                setTimeout(() => {
                    Animated.timing(validOpacity, {
                        toValue: 0,
                        duration: 300,
                        useNativeDriver: true,
                    }).start();
                }, 500);
            });

            handleValidate();
            animateCard(600);
        } else if (nativeEvent.translationX < -120) {
            Animated.timing(rejectOpacity, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start(() => {
                setTimeout(() => {
                    Animated.timing(rejectOpacity, {
                        toValue: 0,
                        duration: 300,
                        useNativeDriver: true,
                    }).start();
                }, 500);
            });

            handleReject();
            animateCard(-600);
        } else {
            resetPosition();
        }
    };

    const animateCard = (toValue: number) => {
        Animated.parallel([
            Animated.timing(translateX, {
                toValue,
                duration: 300,
                useNativeDriver: false,
            }),
            Animated.timing(translateY, {
                toValue: 20,
                duration: 300,
                useNativeDriver: false,
            }),
            Animated.timing(cardOpacity, {
                toValue: 0,
                duration: 300,
                useNativeDriver: false,
            }),
        ]).start(() => {
            resetPosition();
        });
    };

    const resetPosition = useCallback(() => {
        Animated.parallel([
            Animated.timing(translateX, {
                toValue: 0,
                duration: 200,
                useNativeDriver: false,
            }),
            Animated.timing(translateY, {
                toValue: 0,
                duration: 200,
                useNativeDriver: false,
            }),
            Animated.timing(cardOpacity, {
                toValue: 1,
                duration: 200,
                useNativeDriver: false,
            }),
        ]).start();
    }, [translateX, translateY, cardOpacity]);

    const fetchNextAnecdote = useCallback(async () => {
        setLoading(true);
        setNoAnecdotes(false);

        try {
            const response = await apiGet('admin/anecdotes');
            if (response.success) {
                const pendingAnecdotes = response.data.filter((a: any) => !a.valid && !a.alert);

                if (pendingAnecdotes.length > 0) {
                    setAnecdote(pendingAnecdotes[0]);
                } else {
                    setNoAnecdotes(true);
                }
            } else {
                setError('Erreur lors de la récupération des anecdotes');
            }
        } catch (error: any) {
            if (error.message === 'NoRefreshTokenError' || error.JWT_ERROR) {
                setUser(null);
            } else {
                setError(error.message);
            }
        } finally {
            setLoading(false);
            resetPosition();
        }
    }, [setUser, resetPosition]);

    const handleValidate = async () => {
        if (!anecdote || processing) return;
        setProcessing(true);

        try {
            const response = await apiPut(`admin/anecdotes/${anecdote.id}/status`, {
                is_valid: true,
                is_alert: false
            });

            if (response.success) {
                Toast.show({
                    type: 'success',
                    text1: 'Anecdote validée !',
                    text2: `${anecdote.user.firstName} ${anecdote.user.lastName}`,
                });
                fetchNextAnecdote();
            } else if (response.pending) {
                Toast.show({
                    type: 'info',
                    text1: 'Requête sauvegardée',
                    text2: response.message,
                });
                fetchNextAnecdote();
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Erreur',
                    text2: response.message,
                });
            }
        } catch (error: any) {
            if (error.message === 'NoRefreshTokenError' || error.JWT_ERROR) {
                setUser(null);
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Erreur',
                    text2: error.message,
                });
            }
        } finally {
            setProcessing(false);
        }
    };

    const handleReject = async () => {
        if (!anecdote || processing) return;
        setProcessing(true);

        try {
            const response = await apiPut(`admin/anecdotes/${anecdote.id}/status`, {
                is_valid: false,
                is_alert: true
            });

            if (response.success) {
                Toast.show({
                    type: 'success',
                    text1: 'Anecdote refusée',
                    text2: `${anecdote.user.firstName} ${anecdote.user.lastName}`,
                });
                fetchNextAnecdote();
            } else if (response.pending) {
                Toast.show({
                    type: 'info',
                    text1: 'Requête sauvegardée',
                    text2: response.message,
                });
                fetchNextAnecdote();
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Erreur',
                    text2: response.message,
                });
            }
        } catch (error: any) {
            if (error.message === 'NoRefreshTokenError' || error.JWT_ERROR) {
                setUser(null);
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Erreur',
                    text2: error.message,
                });
            }
        } finally {
            setProcessing(false);
        }
    };

    const handleSkip = () => {
        animateCard(600);
        setTimeout(() => {
            fetchNextAnecdote();
        }, 300);
    };

    const handleValidateButton = async () => {
        Animated.timing(validOpacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            setTimeout(() => {
                Animated.timing(validOpacity, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }).start();
            }, 500);
        });

        await handleValidate();
        animateCard(600);
    };

    const handleRejectButton = async () => {
        Animated.timing(rejectOpacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            setTimeout(() => {
                Animated.timing(rejectOpacity, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }).start();
            }, 500);
        });

        await handleReject();
        animateCard(-600);
    };

    useEffect(() => {
        fetchNextAnecdote();
    }, [fetchNextAnecdote]);

    if (error) {
        return <ErrorScreen error={error} />;
    }

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <Header refreshFunction={null} disableRefresh={true} />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                    <Text style={styles.loadingText}>Chargement des anecdotes...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <Header refreshFunction={fetchNextAnecdote} disableRefresh={false} />
            <View style={styles.headerContainer}>
                <BoutonRetour title="Validation rapide" />
            </View>

            <View style={styles.content}>
                {!noAnecdotes && anecdote ? (
                    <>
                        <View style={styles.titleSection}>
                            <MessageSquare size={24} color={Colors.primary} />
                            <Text style={styles.challengeTitle}>Validation anecdotes</Text>
                        </View>

                        <View style={styles.cardContainer}>
                            <PanGestureHandler onGestureEvent={handleGesture} onEnded={handleGestureEnd}>
                                <Animated.View style={[styles.card, {
                                    transform: [
                                        { translateX },
                                        {
                                            translateY: translateX.interpolate({
                                                inputRange: [-300, -150, 0, 150, 300],
                                                outputRange: [20, 5, 0, 5, 20],
                                                extrapolate: 'clamp'
                                            })
                                        },
                                        {
                                            rotate: translateX.interpolate({
                                                inputRange: [-300, 0, 300],
                                                outputRange: ['-10deg', '0deg', '10deg'],
                                                extrapolate: 'clamp'
                                            })
                                        },
                                    ],
                                    opacity: cardOpacity,
                                }]}>
                                    <View style={styles.textContainer}>
                                        <Text style={styles.anecdoteText}>{anecdote.text}</Text>
                                    </View>

                                    <View style={styles.infoSection}>
                                        <View style={styles.userInfo}>
                                            <Text style={styles.userLabel}>Auteur</Text>
                                            <Text style={styles.userName}>
                                                {anecdote.user.firstName} {anecdote.user.lastName}
                                            </Text>
                                        </View>
                                        <View style={styles.roomInfo}>
                                            <Text style={styles.userLabel}>Chambre</Text>
                                            <Text style={styles.userName}>
                                                {anecdote.room.name || anecdote.room.roomNumber}
                                            </Text>
                                        </View>
                                    </View>

                                    <View style={styles.statsSection}>
                                        <View style={styles.statItem}>
                                            <Text style={styles.statLabel}>❤️ J'aimes</Text>
                                            <Text style={styles.statValue}>{anecdote.nbLikes}</Text>
                                        </View>
                                        <View style={styles.statItem}>
                                            <Text style={styles.statLabel}><AlertTriangle size={16} /> Signalements</Text>
                                            <Text style={styles.statValue}>{anecdote.nbWarns}</Text>
                                        </View>
                                    </View>
                                </Animated.View>
                            </PanGestureHandler>
                        </View>

                        <View style={styles.actionButtonsContainer}>
                            <TouchableOpacity
                                onPress={handleRejectButton}
                                disabled={processing}
                                style={[styles.actionButton, styles.rejectButton, { opacity: processing ? inactiveOpacity : activeOpacity }]}
                            >
                                <X size={32} color={Colors.white} />
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={handleSkip}
                                disabled={processing}
                                style={[styles.actionButton, styles.skipButton, { opacity: processing ? inactiveOpacity : activeOpacity }]}
                            >
                                <HelpCircle size={32} color={Colors.white} />
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={handleValidateButton}
                                disabled={processing}
                                style={[styles.actionButton, styles.validateButton, { opacity: processing ? inactiveOpacity : activeOpacity }]}
                            >
                                <Check size={32} color={Colors.white} />
                            </TouchableOpacity>
                        </View>

                        <Animated.View style={[styles.validAnimation, { opacity: validOpacity, transform: [{ scale: validOpacity }] }]}>
                            <Check size={100} color="#22c55e" strokeWidth={3} />
                        </Animated.View>
                        <Animated.View style={[styles.rejectAnimation, { opacity: rejectOpacity, transform: [{ scale: rejectOpacity }] }]}>
                            <X size={100} color={Colors.error} strokeWidth={3} />
                        </Animated.View>
                    </>
                ) : (
                    <View style={styles.emptyStateContainer}>
                        <View style={styles.emptyIcon}>
                            <MessageSquare size={64} color={Colors.lightMuted} />
                        </View>
                        <Text style={styles.emptyStateTitle}>Plus d'anecdotes à valider !</Text>
                        <Text style={styles.emptyStateText}>
                            Toutes les anecdotes en attente ont été traitées. Revenez plus tard !
                        </Text>
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            style={styles.backButton}
                        >
                            <Text style={styles.backButtonText}>Retour</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    actionButton: {
        alignItems: 'center',
        borderRadius: 36,
        elevation: 8,
        height: 72,
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        width: 72,
    },
    actionButtonsContainer: {
        alignItems: 'center',
        bottom: 20,
        flexDirection: 'row',
        gap: 20,
        justifyContent: 'center',
        left: 0,
        paddingHorizontal: 20,
        position: 'absolute',
        right: 0,
    },
    anecdoteText: {
        ...TextStyles.body,
        color: Colors.primaryBorder,
        fontSize: 16,
        lineHeight: 24,
    },
    backButton: {
        backgroundColor: Colors.primary,
        borderRadius: 12,
        paddingHorizontal: 32,
        paddingVertical: 14,
    },
    backButtonText: {
        ...TextStyles.bodyBold,
        color: Colors.white,
    },
    card: {
        backgroundColor: Colors.white,
        borderRadius: 20,
        elevation: 8,
        height: '100%',
        justifyContent: 'space-between',
        overflow: 'hidden',
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        width: '100%',
    },
    cardContainer: {
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center',
        marginBottom: 100,
    },
    challengeTitle: {
        ...TextStyles.h3Bold,
        color: Colors.primaryBorder,
        flex: 1,
        textAlign: 'center',
    },
    container: {
        backgroundColor: Colors.white,
        flex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    emptyIcon: {
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.03)',
        borderRadius: 60,
        height: 120,
        justifyContent: 'center',
        marginBottom: 24,
        width: 120,
    },
    emptyStateContainer: {
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 40,
    },
    emptyStateText: {
        ...TextStyles.body,
        color: Colors.muted,
        lineHeight: 22,
        marginBottom: 32,
        textAlign: 'center',
    },
    emptyStateTitle: {
        ...TextStyles.h2Bold,
        color: Colors.primaryBorder,
        marginBottom: 12,
        textAlign: 'center',
    },
    headerContainer: {
        paddingBottom: 8,
        paddingHorizontal: 20,
        width: '100%',
    },
    infoSection: {
        borderBottomColor: Colors.lightMuted,
        borderBottomWidth: 1,
        gap: 12,
        marginBottom: 20,
        paddingBottom: 20,
    },
    loadingContainer: {
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    loadingText: {
        ...TextStyles.body,
        color: Colors.muted,
        marginTop: 16,
        textAlign: 'center',
    },
    rejectAnimation: {
        left: '38%',
        position: 'absolute',
        top: '45%',
        zIndex: 1000,
    },
    rejectButton: {
        backgroundColor: Colors.error,
    },
    roomInfo: {
        gap: 4,
    },
    skipButton: {
        backgroundColor: Colors.muted,
        borderRadius: 32,
        height: 64,
        width: 64,
    },
    statItem: {
        alignItems: 'center',
        backgroundColor: Colors.lightMuted,
        borderRadius: 12,
        flex: 1,
        padding: 12,
    },
    statLabel: {
        ...TextStyles.small,
        color: Colors.muted,
        marginBottom: 4,
    },
    statValue: {
        ...TextStyles.h3Bold,
        color: Colors.primaryBorder,
    },
    statsSection: {
        flexDirection: 'row',
        gap: 16,
    },
    textContainer: {
        flex: 1,
        justifyContent: 'center',
        marginBottom: 20,
    },
    titleSection: {
        alignItems: 'center',
        backgroundColor: Colors.lightMuted,
        borderRadius: 16,
        flexDirection: 'row',
        gap: 12,
        justifyContent: 'center',
        marginBottom: 16,
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    userInfo: {
        gap: 4,
    },
    userLabel: {
        ...TextStyles.small,
        color: Colors.muted,
        fontWeight: '600',
    },
    userName: {
        ...TextStyles.bodyBold,
        color: Colors.primaryBorder,
    },
    validAnimation: {
        left: '38%',
        position: 'absolute',
        top: '45%',
        zIndex: 1000,
    },
    validateButton: {
        backgroundColor: '#22c55e',
    },
});

