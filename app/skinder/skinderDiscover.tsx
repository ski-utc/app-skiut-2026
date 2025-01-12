import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, Image, Text, ActivityIndicator, Animated, TouchableOpacity } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import { Colors, Fonts } from '@/constants/GraphSettings';
import Header from '../../components/header';
import { useUser } from '@/contexts/UserContext';
import BoutonRetour from '@/components/divers/boutonRetour';
import { Heart, X, HeartCrack } from 'lucide-react-native';
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

    const handleGesture = Animated.event(
        [{ nativeEvent: { translationX: translateX } }],
        { useNativeDriver: false }
    );

    const handleGestureEnd = ({ nativeEvent }) => {
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

    const animateCard = (toValue) => {
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

    const resetPosition = () => {
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
    };

    const fetchProfil = async () => {
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
                if (response.message == "NoPhoto") {
                    setNoPhoto(true);
                } else if (response.message == "TooMuch") {
                    setTooMuch(true);
                } else {
                    setError(response.message || "Une erreur est survenue lors de la récupération du profil");
                }
            }
        } catch (error) {
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
                setDisableRefresh(false); // Re-enable refresh after 5 seconds
            }, 5000);
        }
    };


    const handleLike = async () => {
        try {
            const response = await apiPost('likeSkinder', { 'roomLiked': profile.id });
            if (response.success) {
                if (response.match) {
                    navigation.navigate('matchScreen', {
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
        } catch (error) {
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
    }, [navigation]);

    if (error !== '') {
        return <ErrorScreen error={error} />;
    }

    if (loading) {
        return (
            <View
                style={{
                    height: '100%',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Header />
                <View
                    style={{
                        width: '100%',
                        flex: 1,
                        backgroundColor: Colors.white,
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <ActivityIndicator size="large" color={Colors.gray} />
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Header refreshFunction={fetchProfil} disableRefresh={disableRefresh} />
            <View style={styles.contentContainer}>
                <View style={styles.header}>
                    <View style={styles.backButtonContainer}>
                        <BoutonRetour previousRoute={'profilNavigator'} title={'Skinder'} />
                    </View>
                    <View style={styles.buttonsContainer}>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('skinderMyMatches')}
                            style={styles.matchesButton}
                        >
                            <Text style={styles.buttonText}>Mes Matches</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('skinderProfil')}
                            style={styles.profileButton}
                        >
                            <Text style={styles.profileButtonText}>Modifier mon profil</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                {!noPhoto ? (
                    !tooMuch ? (
                        <PanGestureHandler onGestureEvent={handleGesture} onEnded={handleGestureEnd}>
                            <Animated.View style={[styles.card, {
                                transform: [
                                    { translateX },
                                    { translateY: translateX.interpolate({ inputRange: [-300, -150, 0, 150, 300], outputRange: [20, 5, 0, 5, 20], extrapolate: 'clamp' }) },
                                    { rotate: translateX.interpolate({ inputRange: [-300, 0, 300], outputRange: ['-10deg', '0deg', '10deg'], extrapolate: 'clamp' }) },
                                ],
                                opacity: cardOpacity,
                                backgroundColor: translateX.interpolate({ inputRange: [-300, 0, 300], outputRange: ['#ffcccc', Colors.white, '#ccffcc'], extrapolate: 'clamp' })
                            }]}>
                                <Image
                                    source={{ uri: imageProfil }}
                                    style={styles.profileImage}
                                    resizeMode="cover"
                                    onError={() => setImageProfil("https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png")}
                                />
                                <Text style={styles.profileName}>{profile.nom}</Text>
                                <View style={styles.descriptionContainer}>
                                    <Text style={styles.descriptionText}>{profile.description}</Text>
                                </View>
                                <Text style={styles.sectionTitle}>Passions</Text>
                                <View style={styles.passionContainer}>
                                    {profile.passions.map((passion, index) => (
                                        <View key={index} style={styles.passionItem}>
                                            <Text style={styles.passionText}>{passion}</Text>
                                        </View>
                                    ))}
                                </View>
                            </Animated.View>
                        </PanGestureHandler>
                    ) : (
                        <View style={styles.noMoreProfilesContainer}>
                            <Text style={styles.noMoreProfilesText}>Vous avez déjà liké tous les profils disponibles</Text>
                        </View>
                    )
                ) : (
                    <View style={styles.noProfileContainer}>
                        <Text style={styles.noProfileText}>
                            Veuillez d'abord choisir une photo de profil en cliquant sur "Modifier mon profil" pour pouvoir utiliser Skinder
                        </Text>
                    </View>
                )}
            </View>

            {/* Conditionally render the like and dislike buttons based on noPhoto */}
            {!noPhoto && (
                <View style={styles.buttonActionsContainer}>
                    <TouchableOpacity
                        onPress={handleDislikeButton}
                        disabled={disableButton}
                        style={[styles.actionButton, { opacity: disableButton ? 0.4 : 1 }]}
                    >
                        <X size={30} color={Colors.orange} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={handleLikeButton }
                        disabled={disableButton}
                        style={[styles.actionButton, { backgroundColor: Colors.orange, opacity: disableButton ? 0.4 : 1 }]}
                    >
                        <Heart size={30} color={Colors.white} />
                    </TouchableOpacity>
                </View>
            )}

            <Animated.View style={[styles.likeIcon, { opacity: likeOpacity, transform: [{ scale: likeOpacity }] }]}>
                <Heart size={75} color="red" fill="red" />
            </Animated.View>
            <Animated.View style={[styles.dislikeIcon, { opacity: dislikeOpacity, transform: [{ scale: dislikeOpacity }] }]}>
                <HeartCrack size={75} color="red" />
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    },
    contentContainer: {
        width: '100%',
        backgroundColor: Colors.white,
        flex: 1,
        paddingHorizontal: 20,
        paddingBottom: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    backButtonContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 8,
    },
    buttonsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 4,
    },
    matchesButton: {
        paddingHorizontal: 10,
        paddingVertical: 8,
        backgroundColor: Colors.customGray,
        borderColor: Colors.gray,
        borderWidth: 1,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileButton: {
        paddingHorizontal: 10,
        paddingVertical: 8,
        backgroundColor: Colors.orange,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        color: Colors.black,
        fontSize: 14,
        fontFamily: Fonts.Inter.Basic,
        fontWeight: '600',
    },
    profileButtonText: {
        color: Colors.white,
        fontSize: 14,
        fontFamily: Fonts.Inter.Basic,
        fontWeight: '600',
    },
    card: {
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        width: '90%',
        padding: 10,
        borderRadius: 15,
        gap: 10,
        marginTop: 14,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    profileImage: {
        width: '100%',
        aspectRatio: 1,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.gray,
    },
    profileName: {
        fontSize: 16,
        fontFamily: Fonts.Inter.Basic,
        fontWeight: '600',
        color: Colors.black,
        alignSelf: 'flex-start',
    },
    descriptionContainer: {
        backgroundColor: '#F8F8F8',
        borderColor: Colors.gray,
        borderWidth: 1,
        borderRadius: 10,
        padding: 10,
        width: '100%',
        justifyContent: 'flex-start',
        alignContent: 'center',
    },
    descriptionText: {
        fontSize: 14,
        fontFamily: Fonts.Inter.Basic,
        fontWeight: '500',
        color: Colors.black,
    },
    sectionTitle: {
        fontSize: 16,
        fontFamily: Fonts.Inter.Basic,
        fontWeight: '600',
        color: Colors.black,
        alignSelf: 'flex-start',
    },
    passionContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 8,
    },
    passionItem: {
        backgroundColor: Colors.white,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 15,
        margin: 4,
        borderColor: Colors.orange,
        borderWidth: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    passionText: {
        fontSize: 12,
        fontFamily: Fonts.Inter.Basic,
        fontWeight: '500',
        color: Colors.black,
    },
    noMoreProfilesContainer: {
        width: "100%",
        flex: 1,
        backgroundColor: Colors.white,
        justifyContent: "center",
        alignItems: "center",
    },
    noMoreProfilesText: {
        color: Colors.black,
        fontSize: 20,
        fontFamily: Fonts.Inter.Basic,
        fontWeight: "400",
        padding: 10,
        paddingBottom: 32,
        textAlign: "center",
    },
    noProfileContainer: {
        width: "100%",
        flex: 1,
        backgroundColor: Colors.white,
        justifyContent: "center",
        alignItems: "center",
    },
    noProfileText: {
        color: Colors.gray,
        fontSize: 16,
        fontFamily: "Inter",
        fontWeight: "600",
        padding: 10,
        paddingBottom: 32,
        textAlign: "center",
    },
    buttonActionsContainer: {
        position: 'absolute',
        bottom: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 48,
        width: '100%',
        alignSelf: 'center',
    },
    actionButton: {
        backgroundColor: Colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 5,
        height: 60,
        width: 60,
        borderRadius: 30,
    },
    likeIcon: {
        position: 'absolute',
        top: '40%',
        left: '40%',
    },
    dislikeIcon: {
        position: 'absolute',
        top: '40%',
        left: '40%',
    },
});
