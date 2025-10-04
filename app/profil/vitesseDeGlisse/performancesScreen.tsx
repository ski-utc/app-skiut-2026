import { Text, View, ScrollView, ActivityIndicator, Dimensions, StyleSheet } from "react-native";
import Header from "@/components/header";
import React, { useState, useEffect } from "react";
import { Colors, TextStyles, Fonts, loadFonts } from '@/constants/GraphSettings';
import { Crown } from "lucide-react-native";
import BoutonRetour from '@/components/divers/boutonRetour';
import { apiGet } from '@/constants/api/apiCalls';
import ErrorScreen from "@/components/pages/errorPage";

const screenWidth = Dimensions.get('window').width;
const containerWidth = screenWidth / 3 - 10;

// Composants RectanglePodium et RectangleReste - pour les performances de vitesse
interface RectanglePodiumProps {
    height: number;
    num: string;
    nb_likes: number;
    style?: any;
}

const RectanglePodium: React.FC<RectanglePodiumProps> = ({ height, num, nb_likes, style }) => {
    const isLongName = num.length > 9;
    const textStyle = isLongName ? podiumStyles.longText : podiumStyles.text;

    return (
        <View style={[podiumStyles.container, style]}>
            <Text style={textStyle} numberOfLines={2}>{num}</Text>
            <Text style={podiumStyles.likesText}>{nb_likes} km/h</Text>
            <View style={[podiumStyles.rectangle, { height }]} />
        </View>
    );
};

interface RectangleResteProps {
    number: number;
    num: string;
    nb_likes: number;
    style?: any;
}

const RectangleReste: React.FC<RectangleResteProps> = ({ number, num, nb_likes, style }) => {
    const marginRight = number < 10 ? 30 : 16;

    return (
        <View style={[resteStyles.rectangle, style]}>
            <Text style={[resteStyles.bigNumber, { marginRight }]}>
                {number}
            </Text>
            <View style={resteStyles.textContainer}>
                <Text style={resteStyles.chambreText}>{num}</Text>
                <Text style={resteStyles.likesText}>{nb_likes} km/h</Text>
            </View>
        </View>
    );
};

// Styles pour RectanglePodium
const podiumStyles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'flex-end',
        width: containerWidth,
        paddingHorizontal: 10,
        marginHorizontal: 5,
    },
    text: {
        color: Colors.white,
        fontSize: 16,
        fontFamily: Fonts.text.medium,
        textAlign: 'center',
        width: '100%',
        flexWrap: 'wrap',
        marginVertical: 4,
    },
    longText: {
        color: Colors.white,
        fontSize: 12,
        fontFamily: Fonts.Text.medium,
        textAlign: 'center',
        width: '100%',
        flexWrap: 'wrap',
        marginVertical: 4,
    },
    likesText: {
        color: Colors.white,
        fontSize: 14,
        fontFamily: Fonts.text.light,
    },
    rectangle: {
        width: '100%',
        backgroundColor: Colors.accent,
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        marginHorizontal: 4,
        marginTop: 4,
    },
});

// Styles pour RectangleReste
const resteStyles = StyleSheet.create({
    rectangle: {
        width: '100%',
        height: 50,
        borderWidth: 2,
        borderColor: Colors.primary,
        backgroundColor: Colors.white,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        borderRadius: 8,
    },
    bigNumber: {
        ...TextStyles.h2,
        color: Colors.primaryBorder,
    },
    textContainer: {
        flexDirection: 'column',
    },
    chambreText: {
        ...TextStyles.body,
        color: Colors.primaryBorder,
        marginBottom: 4,
    },
    likesText: {
        ...TextStyles.small,
        color: Colors.gray,
    },
});

export default function PerformancesScreen() {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState('');
    const [podium, setPodium] = useState([]); // Les données du podium
    const [rest, setRest] = useState([]); // Le reste des chambres
    const [disableRefresh, setDisableRefresh] = useState(false);

    useEffect(() => {
        fetchPerformances(); // Charger les données
        const loadAsyncFonts = async () => { // Charger les polices
            await loadFonts();
        };
        loadAsyncFonts();
    }, []);

    const fetchPerformances = async () => {
        setLoading(true);
        setDisableRefresh(true);
        try {
            const response = await apiGet("classement-performances");
            if (response.success) {
                setPodium(response.podium); // Mettre à jour le podium
                setRest(response.rest);
            } else {
                setError(response.message);
            }
        } catch (error : any) {
            if (error.message === 'NoRefreshTokenError' || error.JWT_ERROR) {
                setPodium([]);
                setRest([]);
            } else {
                setError(error.message);
            }
        } finally {
            setLoading(false);
            setTimeout(() => {
                setDisableRefresh(false);
            }, 5000);
        }
    };

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
                <Header refreshFunction={undefined} disableRefresh={undefined} />
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
        <View style={{ flex: 1, backgroundColor: Colors.white }}>
            <Header refreshFunction={fetchPerformances} disableRefresh={disableRefresh} />
            <View style={styles.headerContainer}>
                <BoutonRetour previousRoute={"VitesseDeGlisseScreen"} title={"Performances"} />
            </View>

            {/* Podium Section */}
            <View style={styles.podiumContainer}>
                <Text style={styles.podiumTitle}>Classement général</Text>
                <View style={styles.podiumRow}>
                    {podium.length > 1 && (
                        <RectanglePodium
                            height={65}
                            nom={podium[1].full_name}
                            vitesse={podium[1].max_speed}
                            style={styles.podiumItem}
                        />
                    )}
                    {podium.length > 0 && (
                        <View style={styles.firstPlaceContainer}>
                            <RectanglePodium
                                height={100}
                                nom={podium[0].full_name}
                                vitesse={podium[0].max_speed}
                                style={styles.podiumItem}
                            />
                            <Crown size={40} color={'#ffbc44'} style={styles.crownStyle} />
                        </View>
                    )}
                    {podium.length > 2 && (
                        <RectanglePodium
                            height={30}
                            nom={podium[2].full_name}
                            vitesse={podium[2].max_speed}
                            style={styles.podiumItem}
                        />
                    )}
                </View>
            </View>

            {/* Remainder Section */}
            <ScrollView contentContainerStyle={styles.scrollViewContainer}>
                {Object.values(rest).map((person: any, index: number) => (
                    <RectangleReste
                        key={person.user_id}
                        number={index + 4}
                        nom={person.full_name}
                        vitesse={person.max_speed}
                        style={styles.remainderItem}
                    />
                ))}
            </ScrollView>
        </View>
    );
}

const styles = {
    headerContainer: {
        width: '100%',
        backgroundColor: Colors.white,
        paddingHorizontal: 20,
        paddingBottom: 8,
    },
    podiumContainer: {
        backgroundColor: Colors.orange,
        padding: 16,
        alignItems: 'center',
        height: 250,
    },
    podiumTitle: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 32,
    },
    podiumRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'flex-end',
        width: '100%',
        position: 'absolute',
        bottom: 0,
    },
    podiumItem: {
        marginHorizontal: 5,
    },
    firstPlaceContainer: {
        position: 'relative',
        alignItems: 'center',
    },
    crownStyle: {
        position: 'absolute',
        top: -45,
        zIndex: 1,
    },
    scrollViewContainer: {
        paddingHorizontal: 0,
        paddingVertical: 0,
    },
    remainderItem: {
        width: '100%',
    },
};
