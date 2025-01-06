import React, { useEffect, useState, useRef } from 'react';
import { View, Image, Text, ActivityIndicator, Animated, TouchableOpacity } from 'react-native';
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
    const [profile, setProfile] = useState({ id: null, nom: '', description: '', passions: [] });
    const [imageProfil, setImageProfil] = useState("https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png");
    const [disableButton, setDisableButton] = useState(false);
    const [isLiking, setIsLiking] = useState(false);
    const [isDisliking, setIsDisliking] = useState(false);

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
                setDisableButton(true);
                if(response.message="NoPhoto"){
                    setNoPhoto(true);
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
            resetPosition();
        }
    };

    const handleLike = async () => {
      try {
          const response = await apiPost('likeSkinder', { 'roomLiked': profile.id });
          if (response.success) {
            if(response.match){
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
        fetchProfil();
    }, []);

    if (error !== '') {
        return <ErrorScreen error={error} />;
    }

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
                    backgroundColor: Colors.white,
                    flex: 1,
                    paddingHorizontal: 20,
                    paddingBottom: 16,
                }}
            >
                <View
                    style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}
                >
                    <View
                        style={{
                            justifyContent: 'center',
                            alignItems: 'center',
                            paddingTop:8
                        }}
                    >
                        <BoutonRetour previousRoute={'profilNavigator'} title={'Skinder'} />
                    </View>
                    <View
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap:4
                        }}
                    >
                        <TouchableOpacity
                            onPress={()=>navigation.navigate('skinderMyMatches')}
                            style={{
                                paddingHorizontal: 10,
                                paddingVertical: 8,
                                backgroundColor: Colors.customGray,
                                borderColor: Colors.gray,
                                borderWidth: 1,
                                borderRadius: 8,
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                        >
                            <Text
                                style={{
                                    color: Colors.black,
                                    fontSize: 14,
                                    fontFamily: Fonts.Inter.Basic,
                                    fontWeight: '600',
                                }}
                            >
                                Mes Matches
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={()=>navigation.navigate('skinderProfil')}
                            style={{
                                paddingHorizontal: 10,
                                paddingVertical: 8,
                                backgroundColor: Colors.orange,
                                borderRadius: 8,
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                        >
                            <Text
                                style={{
                                    color: Colors.white,
                                    fontSize: 14,
                                    fontFamily: Fonts.Inter.Basic,
                                    fontWeight: '600',
                                }}
                            >
                                Modifier mon profil
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
                { noPhoto ?
                    <View
                        style={{
                            width: "100%",
                            flex: 1,
                            backgroundColor: Colors.white,
                            justifyContent: "center",
                            alignItems: "center",
                        }}
                    >
                        <Text
                            style={{
                            color: Colors.black,
                            fontSize: 20,
                            fontFamily: Fonts.Inter.Basic,
                            fontWeight: "400",
                            padding: 10,
                            paddingBottom: 32,
                            textAlign: "center",
                            }}
                        >
                            Veuillez d'abord choisir une photo de profil pour pouvoir utiliser Skinder
                        </Text>
                    </View>
                    :
                    <PanGestureHandler onGestureEvent={handleGesture} onEnded={handleGestureEnd}>
                        <Animated.View
                            style={{
                                transform: [
                                    { translateX }, 
                                    {
                                        translateY: translateX.interpolate({
                                            inputRange: [-300, -150, 0, 150, 300],
                                            outputRange: [20, 5, 0, 5, 20], 
                                            extrapolate: 'clamp',
                                        }),
                                    },
                                    {
                                        rotate: translateX.interpolate({
                                            inputRange: [-300, 0, 300],
                                            outputRange: ['-10deg', '0deg', '10deg'],
                                            extrapolate: 'clamp',
                                        }),
                                    },
                                    ],
                                opacity: cardOpacity,
                                backgroundColor: translateX.interpolate({
                                    inputRange: [-300, 0, 300],
                                    outputRange: ['#ffcccc', Colors.white, '#ccffcc'],
                                    extrapolate: 'clamp',
                                }),
                                justifyContent: 'center',
                                alignItems: 'center',
                                alignSelf: 'center',
                                width: '90%',
                                padding: 10, 
                                borderRadius: 15,
                                gap: 10, 
                                marginTop:14,
                                shadowColor: "#000",
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.2,
                                shadowRadius: 4,
                                elevation: 5,
                            }}
                        >
                            <Image
                                source={{ uri: imageProfil }}
                                style={{
                                    width: '100%',
                                    aspectRatio: 1,
                                    borderRadius: 12, 
                                    borderWidth: 1,
                                    borderColor: Colors.gray,
                                }}
                                resizeMode="cover"
                                onError={() => setImageProfil("https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png")}
                            />
                            <Text
                                style={{
                                    fontSize: 16, 
                                    fontFamily: Fonts.Inter.Basic,
                                    fontWeight: '600',
                                    color: Colors.black,
                                    alignSelf: 'flex-start',
                                }}
                            >
                                {profile.nom}
                            </Text>
                            <View
                                style={{
                                    backgroundColor: '#F8F8F8',
                                    borderColor: Colors.gray,
                                    borderWidth: 1,
                                    borderRadius: 10, 
                                    padding: 10,
                                    width: '100%',
                                    justifyContent: 'flex-start',
                                    alignContent: 'center',
                                }}
                            >
                                <Text
                                    style={{
                                        fontSize: 14,
                                        fontFamily: Fonts.Inter.Basic,
                                        fontWeight: '500',
                                        color: Colors.black,
                                    }}
                                >
                                    {profile.description}
                                </Text>
                            </View>
                            <Text
                                style={{
                                    fontSize: 16, 
                                    fontFamily: Fonts.Inter.Basic,
                                    fontWeight: '600',
                                    color: Colors.black,
                                    alignSelf: 'flex-start',
                                }}
                            >
                                Passions
                            </Text>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 }}>
                                {profile.passions.map((passion, index) => (
                                    <View
                                        key={index}
                                        style={{
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
                                        }}
                                    >
                                        <Text style={{ fontSize: 14, fontFamily: Fonts.Inter.Basic, fontWeight: '500', color: Colors.black }}>
                                            {passion}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        </Animated.View>
                    </PanGestureHandler>
                }
            </View>
            <View
                style={{
                    position: 'absolute',
                    bottom: 16,
                    flexDirection: 'row',
                    justifyContent: 'center',
                    gap: 48,
                    width: '100%%',
                    alignSelf: 'center',
                }}
            >
                <TouchableOpacity
                    onPress={() => animateCard(-600)}
                    disabled={disableButton}
                    style={{
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
                        opacity: disableButton ? 0.4 : 1
                    }}
                >
                    <X size={30} color={Colors.orange} />
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => {
                        animateCard(600);
                        handleLike();
                    }}
                    disabled={disableButton}
                    style={{
                        backgroundColor: Colors.orange,
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
                        opacity: disableButton ? 0.4 : 1
                    }}
                >
                    <Heart size={30} color={Colors.white} />
                </TouchableOpacity>
            </View>
            <Animated.View
                style={{
                    position: 'absolute',
                    top: '40%',
                    left: '40%',
                    opacity: likeOpacity,
                    transform: [{ scale: likeOpacity }],
                }}
            >
                <Heart size={75} color="red" fill="red" />
            </Animated.View>

            <Animated.View
                style={{
                    position: 'absolute',
                    top: '40%',
                    left: '40%',
                    opacity: dislikeOpacity,
                    transform: [{ scale: dislikeOpacity }],
                }}
            >
                <HeartCrack size={75} color="red" />
            </Animated.View>
        </View>
    );
}
