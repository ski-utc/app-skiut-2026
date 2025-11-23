import { useEffect, useState, useRef, useCallback } from 'react';
import { StyleSheet, View, Image, Text, ActivityIndicator, Animated, TouchableOpacity, ScrollView } from 'react-native';
import { HandlerStateChangeEvent, PanGestureHandler, PanGestureHandlerEventPayload, State } from 'react-native-gesture-handler';
import { Heart, X, User, MessageCircle, Settings } from 'lucide-react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';

import { Colors, TextStyles } from '@/constants/GraphSettings';
import { useUser } from '@/contexts/UserContext';
import BoutonRetour from '@/components/divers/boutonRetour';
import { apiGet, apiPost, isSuccessResponse, handleApiErrorToast, handleApiErrorScreen, AppError } from '@/constants/api/apiCalls';
import ErrorScreen from '@/components/pages/errorPage';

import Header from '../../components/header';

type SkinderDiscoverStackParamList = {
    skinderDiscover: undefined;
    skinderProfil: undefined;
    matchScreen: {
        myImage: string;
        roomImage: string;
        roomNumber: string;
        roomResp?: string;
    };
    skinderMyMatches: undefined;
}

type Profile = {
    id: number;
    name: string;
    description: string;
    passions: string[];
    image: string;
}

type LikeResponse = {
    match: boolean;
    myRoomImage: string;
    otherRoomImage: string;
    otherRoomNumber: string;
    otherRoomResp: string;
}

export default function SkinderDiscover() {
    const [error, setError] = useState('');
    const [noPhoto, setNoPhoto] = useState(false);
    const [tooMuch, setTooMuch] = useState(false);

    const [profile, setProfile] = useState<Profile | null>(null);
    const [imageProfil, setImageProfil] = useState("https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png");

    const [disableButton, setDisableButton] = useState(false);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const { setUser } = useUser();
    const navigation = useNavigation<NavigationProp<SkinderDiscoverStackParamList>>();

    const translateX = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(0)).current;
    const cardOpacity = useRef(new Animated.Value(1)).current;
    const likeOpacity = useRef(new Animated.Value(0)).current;
    const dislikeOpacity = useRef(new Animated.Value(0)).current;

    const activeOpacity = 1;
    const inactiveOpacity = 0.4;

    const resetPosition = useCallback(() => {
        Animated.parallel([
            Animated.timing(translateX, { toValue: 0, duration: 200, useNativeDriver: false }),
            Animated.timing(translateY, { toValue: 0, duration: 200, useNativeDriver: false }),
            Animated.timing(cardOpacity, { toValue: 1, duration: 200, useNativeDriver: false }),
        ]).start();
    }, [translateX, translateY, cardOpacity]);

    const fetchProfil = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);

        setNoPhoto(false);
        setTooMuch(false);
        setDisableButton(false);
        setError('');

        try {
            const response = await apiGet<Profile>('skinder/profiles');

            if (isSuccessResponse(response)) {
                let parsedPassions: string[] = [];
                if (typeof response.data.passions === 'string') {
                    try {
                        parsedPassions = JSON.parse(response.data.passions);
                    } catch {
                        parsedPassions = [];
                    }
                } else if (Array.isArray(response.data.passions)) {
                    parsedPassions = response.data.passions;
                }

                setProfile({
                    id: response.data.id,
                    name: response.data.name,
                    description: response.data.description,
                    passions: parsedPassions,
                    image: response.data.image,
                });
                setImageProfil(response.data.image);
            } else {
                if (response.message === "NoPhoto") setNoPhoto(true);
                else if (response.message === "TooMuch") setTooMuch(true);
                else setError(response.message || "Erreur inconnue");
            }
        } catch (err: unknown) {
            if (isRefresh) {
                handleApiErrorToast(err as AppError, setUser);
            } else {
                handleApiErrorScreen(err, setUser, setError);
            }
            setDisableButton(true);
        } finally {
            setLoading(false);
            setRefreshing(false);
            resetPosition();
        }
    }, [setUser, resetPosition]);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            fetchProfil(false);
        });
        return unsubscribe;
    }, [navigation, fetchProfil]);

    const handleLike = async () => {
        if (!profile) return;

        try {
            const response = await apiPost<LikeResponse>(`skinder/profiles/${profile.id}/like`, { 'roomLiked': profile.id });

            if (isSuccessResponse(response)) {
                if (response.data.match) {
                    navigation.navigate('matchScreen', {
                        myImage: response.data.myRoomImage,
                        roomImage: response.data.otherRoomImage,
                        roomNumber: response.data.otherRoomNumber,
                        roomResp: response.data.otherRoomResp
                    });
                } else {
                    fetchProfil();
                }
            } else {
                setDisableButton(true);
                setError(response.message || 'Erreur lors du like');
            }
        } catch (err: unknown) {
            setDisableButton(true);
            handleApiErrorToast(err as AppError, setUser);
        }
    };

    const handleGesture = Animated.event(
        [{ nativeEvent: { translationX: translateX } }],
        { useNativeDriver: false }
    );

    const handleGestureStateChange = (event: HandlerStateChangeEvent<PanGestureHandlerEventPayload>) => {
        if (event.nativeEvent.state === State.END) {
            const threshold = 120;
            const { translationX } = event.nativeEvent;

            if (translationX > threshold) {
                triggerAnimation(likeOpacity);
                handleLike();
                animateCardOut(600);
            } else if (translationX < -threshold) {
                triggerAnimation(dislikeOpacity);
                animateCardOut(-600);
            } else {
                resetPosition();
            }
        }
    };

    const triggerAnimation = (opacityRef: Animated.Value) => {
        Animated.sequence([
            Animated.timing(opacityRef, { toValue: 1, duration: 300, useNativeDriver: true }),
            Animated.delay(200),
            Animated.timing(opacityRef, { toValue: 0, duration: 300, useNativeDriver: true }),
        ]).start();
    };

    const animateCardOut = (toValue: number) => {
        Animated.parallel([
            Animated.timing(translateX, { toValue, duration: 300, useNativeDriver: false }),
            Animated.timing(translateY, { toValue: 20, duration: 300, useNativeDriver: false }),
            Animated.timing(cardOpacity, { toValue: 0, duration: 300, useNativeDriver: false }),
        ]).start(() => {
            if (toValue < 0) fetchProfil();
        });
    };

    const handleLikeButton = () => {
        triggerAnimation(likeOpacity);
        handleLike();
        animateCardOut(600);
    };

    const handleDislikeButton = () => {
        triggerAnimation(dislikeOpacity);
        animateCardOut(-600);
    };

    if (error) {
        return <ErrorScreen error={error} />;
    }

    if (loading) {
        return (
            <View style={styles.container}>
                <Header refreshFunction={undefined} disableRefresh={true} />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.primaryBorder} />
                    <Text style={styles.loadingText}>Chargement...</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Header refreshFunction={() => fetchProfil(true)} disableRefresh={refreshing} />

            <View style={styles.headerContainer}>
                <BoutonRetour title={'Skinder'} />
            </View>

            <View style={styles.content}>
                <View style={styles.navigationHeader}>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('skinderMyMatches')}
                        style={styles.navButton}
                    >
                        <MessageCircle size={20} color={Colors.primary} />
                        <Text style={styles.navButtonText}>Mes Matches</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => navigation.navigate('skinderProfil')}
                        style={styles.navButton}
                    >
                        <Settings size={20} color={Colors.primary} />
                        <Text style={styles.navButtonText}>Profil</Text>
                    </TouchableOpacity>
                </View>

                {!noPhoto ? (
                    !tooMuch && profile ? (
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
                                    <View style={styles.imageContainer}>
                                        <Image
                                            source={{ uri: imageProfil }}
                                            style={styles.profileImage}
                                            resizeMode="cover"
                                            onError={() => setImageProfil("https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png")}
                                        />
                                        <View style={styles.imageOverlay}>
                                            <Text style={styles.profileName}>{profile.name}</Text>
                                        </View>
                                    </View>

                                    <ScrollView style={styles.profileInfo} showsVerticalScrollIndicator={false}>
                                        {profile.description && (
                                            <View style={styles.descriptionSection}>
                                                <Text style={styles.sectionTitle}>À propos</Text>
                                                <Text style={styles.descriptionText}>{profile.description}</Text>
                                            </View>
                                        )}

                                        {profile.passions && profile.passions.length > 0 && (
                                            <View style={styles.passionsSection}>
                                                <Text style={styles.sectionTitle}>Passions</Text>
                                                <View style={styles.passionContainer}>
                                                    {profile.passions.map((passion, index) => (
                                                        <View key={index} style={styles.passionChip}>
                                                            <Text style={styles.passionText}>{passion}</Text>
                                                        </View>
                                                    ))}
                                                </View>
                                            </View>
                                        )}
                                    </ScrollView>
                                </Animated.View>
                            </PanGestureHandler>
                        </View>
                    ) : (
                        <View style={styles.emptyStateContainer}>
                            <User size={64} color={Colors.lightMuted} />
                            <Text style={styles.emptyStateTitle}>Plus de profils !</Text>
                            <Text style={styles.emptyStateText}>
                                Vous avez déjà vu tous les profils disponibles. Revenez plus tard !
                            </Text>
                        </View>
                    )
                ) : (
                    <View style={styles.emptyStateContainer}>
                        <User size={64} color={Colors.lightMuted} />
                        <Text style={styles.emptyStateTitle}>Photo requise</Text>
                        <Text style={styles.emptyStateText}>
                            Définissez les informations de votre chambre et ajoutez une photo de profil pour commencer à utiliser Skinder
                        </Text>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('skinderProfil')}
                            style={styles.actionButton}
                        >
                            <Text style={styles.actionButtonText}>Modifier mon profil</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            {!noPhoto && !tooMuch && profile && (
                <View style={styles.actionButtonsContainer}>
                    <TouchableOpacity
                        onPress={handleDislikeButton}
                        disabled={disableButton}
                        style={[styles.swipeButton, styles.dislikeButton, { opacity: disableButton ? inactiveOpacity : activeOpacity }]}
                    >
                        <X size={28} color={Colors.white} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={handleLikeButton}
                        disabled={disableButton}
                        style={[styles.swipeButton, styles.likeButton, { opacity: disableButton ? inactiveOpacity : activeOpacity }]}
                    >
                        <Heart size={28} color={Colors.white} />
                    </TouchableOpacity>
                </View>
            )}

            <Animated.View style={[styles.likeAnimation, { opacity: likeOpacity, transform: [{ scale: likeOpacity }] }]}>
                <Heart size={80} color={Colors.primary} fill={Colors.primary} />
            </Animated.View>
            <Animated.View style={[styles.dislikeAnimation, { opacity: dislikeOpacity, transform: [{ scale: dislikeOpacity }] }]}>
                <X size={80} color={Colors.accent} />
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    actionButton: {
        backgroundColor: Colors.primary,
        borderRadius: 12,
        paddingHorizontal: 24,
        paddingVertical: 12,
    },
    actionButtonText: {
        ...TextStyles.button,
        color: Colors.white,
        fontWeight: '600',
    },
    actionButtonsContainer: {
        bottom: 40,
        flexDirection: 'row',
        gap: 60,
        justifyContent: 'center',
        left: 0,
        position: 'absolute',
        right: 0,
    },
    card: {
        backgroundColor: Colors.white,
        borderRadius: 20,
        elevation: 8,
        height: '90%',
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        width: '95%',
    },
    cardContainer: {
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center',
    },
    container: {
        backgroundColor: Colors.white,
        flex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    descriptionSection: {
        marginBottom: 20,
    },
    descriptionText: {
        ...TextStyles.body,
        color: Colors.muted,
        lineHeight: 22,
    },
    dislikeAnimation: {
        left: '42%',
        position: 'absolute',
        top: '45%',
        zIndex: 1000,
    },
    dislikeButton: {
        backgroundColor: Colors.accent,
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
        marginBottom: 24,
        textAlign: 'center',
    },
    emptyStateTitle: {
        ...TextStyles.h2Bold,
        color: Colors.primaryBorder,
        marginBottom: 12,
        marginTop: 24,
        textAlign: 'center',
    },
    headerContainer: {
        paddingHorizontal: 20,
        width: '100%',
    },
    imageContainer: {
        height: '40%',
        position: 'relative',
    },
    imageOverlay: {
        backgroundColor: 'rgba(0,0,0,0.6)',
        bottom: 0,
        left: 0,
        paddingHorizontal: 20,
        paddingVertical: 16,
        position: 'absolute',
        right: 0,
    },
    likeAnimation: {
        left: '42%',
        position: 'absolute',
        top: '45%',
        zIndex: 1000,
    },
    likeButton: {
        backgroundColor: Colors.primary,
    },
    loadingContainer: {
        alignItems: 'center',
        backgroundColor: Colors.white,
        flex: 1,
        justifyContent: 'center',
    },
    loadingText: {
        ...TextStyles.body,
        color: Colors.muted,
        marginTop: 16,
        textAlign: 'center',
    },
    navButton: {
        alignItems: 'center',
        paddingHorizontal: 8,
    },
    navButtonText: {
        ...TextStyles.small,
        color: Colors.primary,
        fontWeight: '700',
        marginTop: 4,
    },
    navigationHeader: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    passionChip: {
        backgroundColor: Colors.lightMuted,
        borderColor: Colors.primary,
        borderRadius: 16,
        borderWidth: 1,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    passionContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    passionText: {
        ...TextStyles.body,
        color: Colors.primary,
        fontWeight: '600',
    },
    passionsSection: {
        marginBottom: 20,
    },
    profileImage: {
        height: '100%',
        width: '100%',
    },
    profileInfo: {
        flex: 1,
        padding: 20,
    },
    profileName: {
        ...TextStyles.h3Bold,
        color: Colors.white,
    },
    sectionTitle: {
        ...TextStyles.bodyBold,
        color: Colors.primaryBorder,
        marginBottom: 12,
    },
    swipeButton: {
        alignItems: 'center',
        borderRadius: 32,
        elevation: 8,
        height: 64,
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        width: 64,
    },
});
