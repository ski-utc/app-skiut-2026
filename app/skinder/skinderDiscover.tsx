import React, { useEffect, useState, useRef, useCallback } from 'react';
import { StyleSheet, View, Image, Text, ActivityIndicator, Animated, TouchableOpacity, ScrollView } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import { Colors, TextStyles, loadFonts } from '@/constants/GraphSettings';
import Header from '../../components/header';
import { useUser } from '@/contexts/UserContext';
import BoutonRetour from '@/components/divers/boutonRetour';
import { Heart, X, HeartCrack, User, MessageCircle, Settings, Sparkles } from 'lucide-react-native';
import { apiPost, apiGet } from '@/constants/api/apiCalls';
import ErrorScreen from '@/components/pages/errorPage';
import { useNavigation } from '@react-navigation/native';

export default function SkinderDiscover() {
    const [error, setError] = useState('');
    const [noPhoto, setNoPhoto] = useState(false);
    const [tooMuch, setTooMuch] = useState(false);
    const [profile, setProfile] = useState({ id: null, nom: '', description: '', passions: [] });
    const [imageProfil, setImageProfil] = useState("https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png");
    const [disableButton, setDisableButton] = useState(false);
    const [disableRefresh, setDisableRefresh] = useState(false);
    const [loading, setLoading] = useState(false);

    const { setUser } = useUser();
    const navigation = useNavigation();

    const translateX = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(0)).current;
    const cardOpacity = useRef(new Animated.Value(1)).current;
    const likeOpacity = useRef(new Animated.Value(0)).current;
    const dislikeOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const loadAsyncFonts = async () => {
            await loadFonts();
        };
        loadAsyncFonts();
    }, []);

    const handleGesture = Animated.event(
        [{ nativeEvent: { translationX: translateX } }],
        { useNativeDriver: false }
    );

    const handleGestureEnd = ({ nativeEvent }: { nativeEvent: any }) => {
        translateY.setValue(0);

        if (nativeEvent.translationX > 120) {
            Animated.timing(likeOpacity, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start(() => {
                setTimeout(() => {
                    Animated.timing(likeOpacity, {
                        toValue: 0,
                        duration: 300,
                        useNativeDriver: true,
                    }).start();
                }, 500);
            });

            handleLike();
            animateCard(600);
        } else if (nativeEvent.translationX < -120) {
            Animated.timing(dislikeOpacity, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start(() => {
                setTimeout(() => {
                    Animated.timing(dislikeOpacity, {
                        toValue: 0,
                        duration: 300,
                        useNativeDriver: true,
                    }).start();
                }, 500);
            });

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
            fetchProfil();
        });
    };

    const handleDislikeButton = async () => {
        Animated.timing(dislikeOpacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            setTimeout(() => {
                Animated.timing(dislikeOpacity, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }).start();
            }, 500);
        });

        animateCard(-600);
    };

    const handleLikeButton = async () => {
        Animated.timing(likeOpacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            setTimeout(() => {
                Animated.timing(likeOpacity, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }).start();
            }, 500);
        });

        handleLike();
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

    const fetchProfil = useCallback(async () => {
        setDisableRefresh(true);
        setLoading(true);

        try {
            const response = await apiGet('getProfilSkinder');
            if (response.success) {
                setProfile({
                    id: response.data.id,
                    nom: response.data.name,
                    description: response.data.description,
                    passions: Array.isArray(response.data.passions) ? response.data.passions : JSON.parse(response.data.passions || "[]")
                });
                setImageProfil(response.data.image);
            } else {
                //setDisableButton(true);
                if (response.message === "NoPhoto") {
                    setNoPhoto(true);
                } else if (response.message === "TooMuch") {
                    setTooMuch(true);
                } else {
                    setError(response.message || "Une erreur est survenue lors de la récupération du profil");
                }
            }
        } catch (error: any) {
            if (error.message === 'NoRefreshTokenError' || error.JWT_ERROR) {
                setUser(null);
            } else {
                setDisableButton(true);
                setError(error.message);
            }
        } finally {
            setLoading(false);
            resetPosition();
            setTimeout(() => {
                setDisableRefresh(false);
            }, 5000);
        }
    }, [setUser, resetPosition]);


    const handleLike = async () => {
        try {
            const response = await apiPost('likeSkinder', { 'roomLiked': profile.id });
            if (response.success) {
                if (response.match) {
                    (navigation as any).navigate('matchScreen', {
                        myImage: response.myRoomImage,
                        roomImage: response.otherRoomImage,
                        roomNumber: response.otherRoomNumber,
                        roomResp: response.otherRoomResp
                    });

                } else {
                    fetchProfil();
                }
            } else {
                setDisableButton(true);
                setError(response.message || 'Une erreur est survenue lors de la récupération du like');
            }
        } catch (error: any) {
            if (error.message === 'NoRefreshTokenError' || error.JWT_ERROR) {
                setUser(null);
            } else {
                setDisableButton(true);
                setError(error.message);
            }
        }
    };

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            fetchProfil();
        });

        return unsubscribe;
    }, [navigation, fetchProfil]);

    if (error) {
        return (
            <ErrorScreen error={error} />
        );
    }

    if (loading) {
        return (
            <View style={{
                flex: 1,
                backgroundColor: Colors.white,
            }}>
                <Header refreshFunction={undefined} disableRefresh={true} />
                <View style={{
                    width: '100%',
                    flex: 1,
                    backgroundColor: Colors.white,
                    justifyContent: 'center',
                    alignItems: 'center',
                }}>
                    <ActivityIndicator size="large" color={Colors.primaryBorder} />
                    <Text style={[TextStyles.body, { color: Colors.muted, marginTop: 16 }]}>
                        Chargement...
                    </Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Header refreshFunction={fetchProfil} disableRefresh={disableRefresh} />
            <View style={styles.headerContainer}>
                <BoutonRetour previousRoute={'homeNavigator'} title={'Skinder'} />
            </View>

            <View style={styles.content}>
                <View style={styles.navigationHeader}>
                    <TouchableOpacity
                        onPress={() => (navigation as any).navigate('skinderMyMatches')}
                        style={styles.navButton}
                    >
                        <MessageCircle size={20} color={Colors.primary} />
                        <Text style={styles.navButtonText}>Mes Matches</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => (navigation as any).navigate('skinderProfil')}
                        style={styles.navButton}
                    >
                        <Settings size={20} color={Colors.primary} />
                        <Text style={styles.navButtonText}>Profil</Text>
                    </TouchableOpacity>
                </View>

                {!noPhoto ? (
                    !tooMuch ? (
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
                                    <View style={styles.imageContainer}>
                                        <Image
                                            source={{ uri: imageProfil }}
                                            style={styles.profileImage}
                                            resizeMode="cover"
                                            onError={() => setImageProfil("https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png")}
                                        />
                                        <View style={styles.imageOverlay}>
                                            <Text style={styles.profileName}>{profile.nom}</Text>
                                        </View>
                                    </View>

                                    <ScrollView style={styles.profileInfo} showsVerticalScrollIndicator={false}>
                                        {profile.description && (
                                            <View style={styles.descriptionSection}>
                                                <Text style={styles.sectionTitle}>À propos</Text>
                                                <Text style={styles.descriptionText}>{profile.description}</Text>
                                            </View>
                                        )}

                                        {profile.passions.length > 0 && (
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
                            Ajoutez une photo de profil pour commencer à utiliser Skinder
                        </Text>
                        <TouchableOpacity
                            onPress={() => (navigation as any).navigate('skinderProfil')}
                            style={styles.actionButton}
                        >
                            <Text style={styles.actionButtonText}>Ajouter une photo</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            {!noPhoto && !tooMuch && (
                <View style={styles.actionButtonsContainer}>
                    <TouchableOpacity
                        onPress={handleDislikeButton}
                        disabled={disableButton}
                        style={[styles.swipeButton, styles.dislikeButton, { opacity: disableButton ? 0.4 : 1 }]}
                    >
                        <X size={28} color={Colors.white} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={handleLikeButton}
                        disabled={disableButton}
                        style={[styles.swipeButton, styles.likeButton, { opacity: disableButton ? 0.4 : 1 }]}
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
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.white,
    },
    headerContainer: {
        width: '100%',
        paddingHorizontal: 20,
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
    navigationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
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
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    cardContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        width: '90%',
        height: '90%',
        backgroundColor: Colors.white,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 8,
        overflow: 'hidden',
    },
    imageContainer: {
        position: 'relative',
        height: '40%',
    },
    profileImage: {
        width: '100%',
        height: '100%',
    },
    imageOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingVertical: 16,
        paddingHorizontal: 20,
    },
    profileName: {
        ...TextStyles.h2Bold,
        color: Colors.white,
    },
    profileInfo: {
        flex: 1,
        padding: 20,
    },
    descriptionSection: {
        marginBottom: 20,
    },
    passionsSection: {
        marginBottom: 20,
    },
    sectionTitle: {
        ...TextStyles.bodyBold,
        color: Colors.primaryBorder,
        marginBottom: 12,
    },
    descriptionText: {
        ...TextStyles.body,
        color: Colors.muted,
        lineHeight: 22,
    },
    passionContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    passionChip: {
        backgroundColor: Colors.lightMuted,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: Colors.primary,
    },
    passionText: {
        ...TextStyles.body,
        color: Colors.primary,
        fontWeight: '600',
    },
    emptyStateContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyStateTitle: {
        ...TextStyles.h2Bold,
        color: Colors.primaryBorder,
        textAlign: 'center',
        marginTop: 24,
        marginBottom: 12,
    },
    emptyStateText: {
        ...TextStyles.body,
        color: Colors.muted,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 24,
    },
    actionButton: {
        backgroundColor: Colors.primary,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 12,
    },
    actionButtonText: {
        ...TextStyles.button,
        color: Colors.white,
        fontWeight: '600',
    },
    actionButtonsContainer: {
        position: 'absolute',
        bottom: 40,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 60,
    },
    swipeButton: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    dislikeButton: {
        backgroundColor: Colors.accent,
    },
    likeButton: {
        backgroundColor: Colors.primary,
    },
    likeAnimation: {
        position: 'absolute',
        top: '45%',
        left: '42%',
        zIndex: 1000,
    },
    dislikeAnimation: {
        position: 'absolute',
        top: '45%',
        left: '42%',
        zIndex: 1000,
    },
});
