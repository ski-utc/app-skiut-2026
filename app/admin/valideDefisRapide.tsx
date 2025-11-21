import React, { useEffect, useState, useRef, useCallback } from 'react';
import { StyleSheet, View, Image, Text, ActivityIndicator, Animated, TouchableOpacity, SafeAreaView } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import { Colors, TextStyles } from '@/constants/GraphSettings';
import Header from '../../components/header';
import { useUser } from '@/contexts/UserContext';
import BoutonRetour from '@/components/divers/boutonRetour';
import { Check, X, HelpCircle, Trophy } from 'lucide-react-native';
import { apiGet, apiPut } from '@/constants/api/apiCalls';
import ErrorScreen from '@/components/pages/errorPage';
import { useNavigation } from '@react-navigation/native';
import { Video, ResizeMode } from 'expo-av';
import Toast from 'react-native-toast-message';

interface Defi {
    id: number;
    challenge: {
        id: number;
        title: string;
        description: string;
    };
    user: {
        id: number;
        firstName: string;
        lastName: string;
    };
    room: {
        id: number;
        name: string;
    };
    proof_media: string | null;
    proof_media_type: 'image' | 'video' | null;
    valid: boolean;
}

export default function ValideDefisRapide() {
    const [error, setError] = useState('');
    const [noDefis, setNoDefis] = useState(false);
    const [defi, setDefi] = useState<Defi | null>(null);
    const [loading, setLoading] = useState(false);
    const [processing, setProcessing] = useState(false);

    const { setUser } = useUser();
    const navigation = useNavigation();

    const translateX = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(0)).current;
    const cardOpacity = useRef(new Animated.Value(1)).current;
    const validOpacity = useRef(new Animated.Value(0)).current;
    const rejectOpacity = useRef(new Animated.Value(0)).current;

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

    const fetchNextDefi = useCallback(async () => {
        setLoading(true);
        setNoDefis(false);

        try {
            const response = await apiGet('admin/challenges');
            if (response.success) {
                const pendingDefis = response.data.filter((d: any) => !d.valid && !d.delete);

                if (pendingDefis.length > 0) {
                    setDefi(pendingDefis[0]);
                } else {
                    setNoDefis(true);
                }
            } else {
                setError('Erreur lors de la récupération des défis');
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
        if (!defi || processing) return;
        setProcessing(true);

        try {
            const response = await apiPut(`admin/challenges/${defi.id}/status`, {
                is_valid: true,
                is_delete: false
            });

            if (response.success) {
                Toast.show({
                    type: 'success',
                    text1: 'Défi validé !',
                    text2: `${defi.user.firstName} ${defi.user.lastName}`,
                });
                fetchNextDefi();
            } else if (response.pending) {
                Toast.show({
                    type: 'info',
                    text1: 'Requête sauvegardée',
                    text2: response.message,
                });
                fetchNextDefi();
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
        if (!defi || processing) return;
        setProcessing(true);

        try {
            const response = await apiPut(`admin/challenges/${defi.id}/status`, {
                is_valid: false,
                is_delete: true
            });

            if (response.success) {
                Toast.show({
                    type: 'success',
                    text1: 'Défi refusé',
                    text2: `${defi.user.firstName} ${defi.user.lastName}`,
                });
                fetchNextDefi();
            } else if (response.pending) {
                Toast.show({
                    type: 'info',
                    text1: 'Requête sauvegardée',
                    text2: response.message,
                });
                fetchNextDefi();
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
            fetchNextDefi();
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
        fetchNextDefi();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (error) {
        return <ErrorScreen error={error} />;
    }

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <Header refreshFunction={null} disableRefresh={true} />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                    <Text style={styles.loadingText}>Chargement des défis...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <Header refreshFunction={fetchNextDefi} disableRefresh={false} />
            <View style={styles.headerContainer}>
                <BoutonRetour previousRoute="gestionDefisScreen" title="Validation rapide" />
            </View>

            <View style={styles.content}>
                {!noDefis && defi ? (
                    <>
                        <View style={styles.titleSection}>
                            <Trophy size={24} color={Colors.primary} />
                            <Text style={styles.challengeTitle}>{defi.challenge.title}</Text>
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
                                    <View style={styles.mediaContainer}>
                                        {defi.proof_media_type === 'video' ? (
                                            <Video
                                                source={{ uri: defi.proof_media! }}
                                                style={styles.media}
                                                useNativeControls
                                                resizeMode={ResizeMode.CONTAIN}
                                                isLooping
                                            />
                                        ) : defi.proof_media_type === 'image' ? (
                                            <Image
                                                source={{ uri: defi.proof_media! }}
                                                style={styles.media}
                                                resizeMode="contain"
                                            />
                                        ) : (
                                            <View style={styles.noMediaContainer}>
                                                <Trophy size={64} color={Colors.lightMuted} />
                                                <Text style={styles.noMediaText}>Pas de preuve fournie</Text>
                                            </View>
                                        )}
                                    </View>

                                    <View style={styles.infoSection}>
                                        <View style={styles.userInfo}>
                                            <Text style={styles.userLabel}>Participant</Text>
                                            <Text style={styles.userName}>
                                                {defi.room.name} - {defi.user.firstName} {defi.user.lastName}
                                            </Text>
                                        </View>
                                    </View>
                                </Animated.View>
                            </PanGestureHandler>
                        </View>

                        <View style={styles.actionButtonsContainer}>
                            <TouchableOpacity
                                onPress={handleRejectButton}
                                disabled={processing}
                                style={[styles.actionButton, styles.rejectButton, { opacity: processing ? 0.4 : 1 }]}
                            >
                                <X size={32} color={Colors.white} />
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={handleSkip}
                                disabled={processing}
                                style={[styles.actionButton, styles.skipButton, { opacity: processing ? 0.4 : 1 }]}
                            >
                                <HelpCircle size={32} color={Colors.white} />
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={handleValidateButton}
                                disabled={processing}
                                style={[styles.actionButton, styles.validateButton, { opacity: processing ? 0.4 : 1 }]}
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
                            <Trophy size={64} color={Colors.lightMuted} />
                        </View>
                        <Text style={styles.emptyStateTitle}>Plus de défis à valider !</Text>
                        <Text style={styles.emptyStateText}>
                            Tous les défis en attente ont été traités. Revenez plus tard !
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
    container: {
        flex: 1,
        backgroundColor: Colors.white,
    },
    headerContainer: {
        width: '100%',
        paddingHorizontal: 20,
        paddingBottom: 8,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    loadingText: {
        ...TextStyles.body,
        color: Colors.muted,
        marginTop: 16,
        textAlign: 'center',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    titleSection: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        paddingVertical: 16,
        paddingHorizontal: 20,
        backgroundColor: Colors.lightMuted,
        borderRadius: 16,
        marginBottom: 16,
    },
    challengeTitle: {
        ...TextStyles.h3Bold,
        color: Colors.primaryBorder,
        textAlign: 'center',
        flex: 1,
    },
    cardContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 100,
    },
    card: {
        width: '100%',
        height: '100%',
        backgroundColor: Colors.white,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 8,
        overflow: 'hidden',
    },
    mediaContainer: {
        flex: 1,
        backgroundColor: Colors.lightMuted,
        justifyContent: 'center',
        alignItems: 'center',
    },
    media: {
        width: '100%',
        height: '100%',
    },
    noMediaContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
    },
    noMediaText: {
        ...TextStyles.body,
        color: Colors.muted,
    },
    infoSection: {
        padding: 20,
        backgroundColor: Colors.white,
    },
    userInfo: {
        marginBottom: 16,
    },
    userLabel: {
        ...TextStyles.small,
        color: Colors.muted,
        marginBottom: 4,
    },
    userName: {
        ...TextStyles.bodyBold,
        color: Colors.primaryBorder,
    },
    descriptionContainer: {
        marginTop: 8,
    },
    descriptionLabel: {
        ...TextStyles.small,
        color: Colors.muted,
        marginBottom: 4,
    },
    descriptionText: {
        ...TextStyles.body,
        color: Colors.primaryBorder,
        lineHeight: 20,
    },
    actionButtonsContainer: {
        position: 'absolute',
        bottom: 20,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 20,
        paddingHorizontal: 20,
    },
    actionButton: {
        width: 72,
        height: 72,
        borderRadius: 36,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    rejectButton: {
        backgroundColor: Colors.error,
    },
    skipButton: {
        backgroundColor: Colors.muted,
        width: 64,
        height: 64,
        borderRadius: 32,
    },
    validateButton: {
        backgroundColor: '#22c55e',
    },
    validAnimation: {
        position: 'absolute',
        top: '45%',
        left: '38%',
        zIndex: 1000,
    },
    rejectAnimation: {
        position: 'absolute',
        top: '45%',
        left: '38%',
        zIndex: 1000,
    },
    emptyStateContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyIcon: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(0,0,0,0.03)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    emptyStateTitle: {
        ...TextStyles.h2Bold,
        color: Colors.primaryBorder,
        textAlign: 'center',
        marginBottom: 12,
    },
    emptyStateText: {
        ...TextStyles.body,
        color: Colors.muted,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 32,
    },
    backButton: {
        backgroundColor: Colors.primary,
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 12,
    },
    backButtonText: {
        ...TextStyles.bodyBold,
        color: Colors.white,
    },
});

