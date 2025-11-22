import { useState } from 'react';
import { View, Image, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { NavigationProp, useNavigation, useRoute } from '@react-navigation/native';
import { Heart, Sparkles, MapPin } from 'lucide-react-native';

import { Colors, TextStyles } from '@/constants/GraphSettings';
import Header from '@/components/header';
import BoutonRetour from '@/components/divers/boutonRetour';

type MatchStackParamList = {
    matchScreen: undefined;
}

export default function MatchScreen() {
    const navigation = useNavigation<NavigationProp<MatchStackParamList>>();
    const route = useRoute();

    const { myImage, roomImage, roomNumber, roomResp } = (route.params as any) || {};

    const [myRoomImage, setMyRoomImage] = useState(myImage);
    const [otherRoomImage, setOtherRoomImage] = useState(roomImage);
    if (!myImage || !roomImage || !roomNumber) {
        navigation.goBack();
        return null;
    }

    return (
        <View style={styles.container}>
            <Header refreshFunction={null} disableRefresh={true} />
            <View style={styles.headerContainer}>
                <BoutonRetour title={'Skinder'} />
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
    celebrationContainer: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: 16,
        marginBottom: 16,
    },
    contactCard: {
        backgroundColor: Colors.white,
        borderColor: 'rgba(0,0,0,0.06)',
        borderRadius: 14,
        borderWidth: 1,
        elevation: 3,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 5,
        width: '100%',
    },
    contactHeader: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: 8,
        marginBottom: 12,
    },
    contactText: {
        ...TextStyles.body,
        color: Colors.muted,
        lineHeight: 22,
    },
    contactTitle: {
        ...TextStyles.bodyBold,
        color: Colors.primaryBorder,
    },
    container: {
        backgroundColor: Colors.white,
        flex: 1,
    },
    content: {
        alignItems: 'center',
        flex: 1,
        gap: 32,
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    continueButton: {
        backgroundColor: Colors.primary,
        borderRadius: 14,
        elevation: 3,
        paddingHorizontal: 32,
        paddingVertical: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    continueButtonText: {
        ...TextStyles.button,
        color: Colors.white,
        fontWeight: '600',
    },
    headerContainer: {
        paddingBottom: 8,
        paddingHorizontal: 20,
        width: '100%',
    },
    heartContainer: {
        alignItems: 'center',
        backgroundColor: Colors.lightMuted,
        borderRadius: 32,
        height: 64,
        justifyContent: 'center',
        width: 64,
    },
    matchTitle: {
        ...TextStyles.h1Bold,
        color: Colors.primary,
        textAlign: 'center',
    },
    profileImage: {
        borderColor: Colors.primary,
        borderRadius: 60,
        borderWidth: 4,
        height: 120,
        width: 120,
    },
    profileImageContainer: {
        alignItems: 'center',
    },
    profileLabel: {
        backgroundColor: Colors.primary,
        borderRadius: 12,
        marginTop: 12,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    profileLabelText: {
        ...TextStyles.small,
        color: Colors.white,
        fontWeight: '600',
    },
    profilesContainer: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: 24,
        justifyContent: 'center',
        width: '100%',
    },
});
