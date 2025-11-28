import { useEffect, useState, useRef, useCallback } from 'react';
import { StyleSheet, View, Image, Text, ActivityIndicator, Animated, TouchableOpacity, SafeAreaView } from 'react-native';
import { HandlerStateChangeEvent, PanGestureHandler, PanGestureHandlerEventPayload, State } from 'react-native-gesture-handler';
import { Check, X, HelpCircle, Trophy } from 'lucide-react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { Video, ResizeMode } from 'expo-av';
import Toast from 'react-native-toast-message';

import { useUser } from '@/contexts/UserContext';
import BoutonRetour from '@/components/divers/boutonRetour';
import { apiGet, apiPut, isSuccessResponse, isPendingResponse, handleApiErrorToast, AppError, ApiError, handleApiErrorScreen } from '@/constants/api/apiCalls';
import ErrorScreen from '@/components/pages/errorPage';
import { Colors, TextStyles } from '@/constants/GraphSettings';

import Header from '../../components/header';

import { AdminStackParamList } from './adminNavigator';

type Defi = {
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
    delete?: boolean;
}

export default function ValideDefisRapide() {
    const [error, setError] = useState('');
    const [noDefis, setNoDefis] = useState(false);
    const [defi, setDefi] = useState<Defi | null>(null);
    const [loading, setLoading] = useState(false);
    const [processing, setProcessing] = useState(false);

    const { setUser } = useUser();
    const navigation = useNavigation<NavigationProp<AdminStackParamList>>();

    const translateX = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(0)).current;
    const cardOpacity = useRef(new Animated.Value(1)).current;
    const validOpacity = useRef(new Animated.Value(0)).current;
    const rejectOpacity = useRef(new Animated.Value(0)).current;

    const activeOpacity = 1;
    const inactiveOpacity = 0.4;

    const resetPosition = useCallback(() => {
        Animated.parallel([
            Animated.timing(translateX, { toValue: 0, duration: 200, useNativeDriver: false }),
            Animated.timing(translateY, { toValue: 0, duration: 200, useNativeDriver: false }),
            Animated.timing(cardOpacity, { toValue: 1, duration: 200, useNativeDriver: false }),
        ]).start();
    }, [translateX, translateY, cardOpacity]);

    const fetchNextDefi = useCallback(async () => {
        setLoading(true);
        setNoDefis(false);
        setError('');

        try {
            const response = await apiGet<Defi[]>('admin/challenges', false);

            if (isSuccessResponse(response)) {
                const pendingDefis = (response.data || []).filter(d => !d.valid && !d.delete); // Might can delete this part

                if (pendingDefis.length > 0) {
                    setDefi(pendingDefis[0]);
                } else {
                    setNoDefis(true);
                    setDefi(null);
                }
            } else {
                handleApiErrorScreen(new ApiError(response.message), setUser, setError);
            }
        } catch (err: unknown) {
            handleApiErrorToast(err as AppError, setUser);
        } finally {
            setLoading(false);
            resetPosition();
        }
    }, [setUser, resetPosition]);

    const handleStatusUpdate = async (isValid: boolean) => {
        if (!defi || processing) return;
        setProcessing(true);

        try {
            const response = await apiPut(`admin/challenges/${defi.id}/status`, {
                is_valid: isValid,
                is_delete: !isValid
            });

            const handleSuccess = (isPending: boolean) => {
                Toast.show({
                    type: isPending ? 'info' : 'success',
                    text1: isPending ? 'Action sauvegardée' : (isValid ? 'Défi validé !' : 'Défi refusé'),
                    text2: isPending
                        ? 'Sera synchronisé plus tard'
                        : `${defi.user.firstName} ${defi.user.lastName}`
                });
                fetchNextDefi();
            };

            if (isSuccessResponse(response)) {
                handleSuccess(false);
            } else if (isPendingResponse(response)) {
                handleSuccess(true);
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Erreur',
                    text2: response.message || 'Action impossible'
                });
            }
        } catch (err: unknown) {
            handleApiErrorToast(err as AppError, setUser);
        } finally {
            setProcessing(false);
        }
    };

    const handleValidate = () => handleStatusUpdate(true);
    const handleReject = () => handleStatusUpdate(false);

    const handleGesture = Animated.event(
        [{ nativeEvent: { translationX: translateX } }],
        { useNativeDriver: false }
    );

    const handleGestureStateChange = (event: HandlerStateChangeEvent<PanGestureHandlerEventPayload>) => {
        if (event.nativeEvent.state === State.END) {
            const threshold = 120;
            const { translationX } = event.nativeEvent;

            if (translationX > threshold) {
                triggerAnimation(validOpacity);
                handleValidate();
                animateCardOut(600);
            } else if (translationX < -threshold) {
                triggerAnimation(rejectOpacity);
                handleReject();
                animateCardOut(-600);
            } else {
                resetPosition();
            }
        }
    };

    const triggerAnimation = (opacityVal: Animated.Value) => {
        Animated.sequence([
            Animated.timing(opacityVal, { toValue: 1, duration: 300, useNativeDriver: true }),
            Animated.delay(200),
            Animated.timing(opacityVal, { toValue: 0, duration: 300, useNativeDriver: true })
        ]).start();
    };

    const animateCardOut = (toValue: number) => {
        Animated.parallel([
            Animated.timing(translateX, { toValue, duration: 300, useNativeDriver: false }),
            Animated.timing(translateY, { toValue: 20, duration: 300, useNativeDriver: false }),
            Animated.timing(cardOpacity, { toValue: 0, duration: 300, useNativeDriver: false }),
        ]).start(() => {
            resetPosition();
        });
    };

    const handleSkip = () => {
        animateCardOut(600);
        setTimeout(() => fetchNextDefi(), 300);
    };

    const handleValidateButton = async () => {
        triggerAnimation(validOpacity);
        await handleValidate();
        animateCardOut(600);
    };

    const handleRejectButton = async () => {
        triggerAnimation(rejectOpacity);
        await handleReject();
        animateCardOut(-600);
    };

    useEffect(() => {
        fetchNextDefi();
    }, [fetchNextDefi]);

    if (error) {
        return <ErrorScreen error={error} />;
    }

    if (loading && !defi && !noDefis) {
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
                <BoutonRetour title="Validation rapide" />
            </View>

            <View style={styles.content}>
                {!noDefis && defi ? (
                    <>
                        <View style={styles.titleSection}>
                            <Trophy size={24} color={Colors.primary} />
                            <Text style={styles.challengeTitle}>{defi.challenge.title}</Text>
                        </View>

                        <View style={styles.cardContainer}>
                            <PanGestureHandler onGestureEvent={handleGesture} onHandlerStateChange={handleGestureStateChange}>
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
                                        {defi.proof_media_type === 'video' && defi.proof_media ? (
                                            <Video
                                                source={{ uri: defi.proof_media }}
                                                style={styles.media}
                                                useNativeControls
                                                resizeMode={ResizeMode.CONTAIN}
                                                isLooping
                                            />
                                        ) : defi.proof_media_type === 'image' && defi.proof_media ? (
                                            <Image
                                                source={{ uri: defi.proof_media }}
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

                        <Animated.View
                            pointerEvents="none"
                            style={[styles.validAnimation, { opacity: validOpacity, transform: [{ scale: validOpacity }] }]}
                        >
                            <Check size={100} color="#22c55e" strokeWidth={3} />
                        </Animated.View>
                        <Animated.View
                            pointerEvents="none"
                            style={[styles.rejectAnimation, { opacity: rejectOpacity, transform: [{ scale: rejectOpacity }] }]}
                        >
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
        overflow: 'hidden',
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
        backgroundColor: Colors.white,
        padding: 20,
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
    media: {
        height: '100%',
        width: '100%',
    },
    mediaContainer: {
        alignItems: 'center',
        backgroundColor: Colors.lightMuted,
        flex: 1,
        justifyContent: 'center',
    },
    noMediaContainer: {
        alignItems: 'center',
        flex: 1,
        gap: 16,
        justifyContent: 'center',
    },
    noMediaText: {
        ...TextStyles.body,
        color: Colors.muted,
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
    skipButton: {
        backgroundColor: Colors.muted,
        borderRadius: 32,
        height: 64,
        width: 64,
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
