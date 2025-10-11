import React, { useState, useEffect } from 'react';
import { View, Image, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Colors, TextStyles, loadFonts } from '@/constants/GraphSettings';
import Header from '@/components/header';
import BoutonRetour from '@/components/divers/boutonRetour';
import { Heart, Sparkles, MapPin, MessageCircle } from 'lucide-react-native';

//@ts-ignore
export default function MatchScreen() {
    const navigation = useNavigation();
    const route = useRoute();

    const { myImage, roomImage, roomNumber, roomResp } = (route.params as any) || {};

    const [myRoomImage, setMyRoomImage] = useState(myImage);
    const [otherRoomImage, setOtherRoomImage] = useState(roomImage);

    useEffect(() => {
        const loadAsyncFonts = async () => {
            await loadFonts();
        };
        loadAsyncFonts();
    }, []);

    if (!myImage || !roomImage || !roomNumber) {
        navigation.goBack();
        return null;
    }

    return (
        <View style={styles.container}>
            <Header refreshFunction={null} disableRefresh={true} />
            <View style={styles.headerContainer}>
                <BoutonRetour previousRoute={'homeNavigator'} title={'Skinder'} />
            </View>

            <View style={styles.content}>
                <View style={styles.celebrationContainer}>
                    <Sparkles size={32} color={Colors.primary} />
                    <Text style={styles.matchTitle}>C'est un Match !</Text>
                    <Sparkles size={32} color={Colors.primary} />
                </View>

                <View style={styles.profilesContainer}>
                    <View style={styles.profileImageContainer}>
                        <Image
                            source={{ uri: `${myRoomImage}?timestamp=${new Date().getTime()}` }}
                            style={styles.profileImage}
                            resizeMode="cover"
                            onError={() => setMyRoomImage("https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png")}
                        />
                        <View style={styles.profileLabel}>
                            <Text style={styles.profileLabelText}>Vous</Text>
                        </View>
                    </View>

                    <View style={styles.heartContainer}>
                        <Heart size={40} color={Colors.primary} fill={Colors.primary} />
                    </View>

                    <View style={styles.profileImageContainer}>
                        <Image
                            source={{ uri: otherRoomImage }}
                            style={styles.profileImage}
                            resizeMode="cover"
                            onError={() => setOtherRoomImage("https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png")}
                        />
                        <View style={styles.profileLabel}>
                            <Text style={styles.profileLabelText}>Chambre {roomNumber}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.contactCard}>
                    <View style={styles.contactHeader}>
                        <MapPin size={20} color={Colors.primary} />
                        <Text style={styles.contactTitle}>Comment se rencontrer ?</Text>
                    </View>
                    <Text style={styles.contactText}>
                        Allez toquer à la chambre {roomNumber}
                        {roomResp ? ` ou contactez ${roomResp}` : ''} pour vous rencontrer en vrai !
                    </Text>
                </View>

                <View style={styles.encouragementCard}>
                    <MessageCircle size={20} color={Colors.primary} />
                    <Text style={styles.encouragementText}>
                        N'hésitez pas à faire le premier pas ! Les meilleures rencontres commencent par un simple "Salut" 😊
                    </Text>
                </View>

                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.continueButton}
                >
                    <Text style={styles.continueButtonText}>Continuer à découvrir</Text>
                </TouchableOpacity>
            </View>
        </View>
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
    content: {
        flex: 1,
        paddingHorizontal: 20,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 32,
    },
    celebrationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        marginBottom: 16,
    },
    matchTitle: {
        ...TextStyles.h1Bold,
        color: Colors.primary,
        textAlign: 'center',
    },
    profilesContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 24,
        width: '100%',
    },
    profileImageContainer: {
        alignItems: 'center',
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 4,
        borderColor: Colors.primary,
    },
    profileLabel: {
        backgroundColor: Colors.primary,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 12,
        marginTop: 12,
    },
    profileLabelText: {
        ...TextStyles.small,
        color: Colors.white,
        fontWeight: '600',
    },
    heartContainer: {
        backgroundColor: Colors.lightMuted,
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
    },
    contactCard: {
        backgroundColor: Colors.white,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.06)',
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowOffset: { width: 2, height: 3 },
        shadowRadius: 5,
        elevation: 3,
        padding: 20,
        width: '100%',
    },
    contactHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    contactTitle: {
        ...TextStyles.bodyBold,
        color: Colors.primaryBorder,
    },
    contactText: {
        ...TextStyles.body,
        color: Colors.muted,
        lineHeight: 22,
    },
    encouragementCard: {
        backgroundColor: Colors.lightMuted,
        borderRadius: 14,
        padding: 16,
        width: '100%',
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
    },
    encouragementText: {
        ...TextStyles.body,
        color: Colors.primary,
        lineHeight: 22,
        flex: 1,
    },
    continueButton: {
        backgroundColor: Colors.primary,
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 14,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 3,
    },
    continueButtonText: {
        ...TextStyles.button,
        color: Colors.white,
        fontWeight: '600',
    },
});