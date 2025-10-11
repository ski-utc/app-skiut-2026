import { Text, View, ScrollView, ActivityIndicator, Dimensions, StyleSheet, FlatList } from "react-native";
import Header from "../../components/header";
import React, { useState, useEffect } from "react";
import { Colors, TextStyles, Fonts, loadFonts } from '@/constants/GraphSettings';
import { Crown, Trophy, Medal, Award } from "lucide-react-native";
import BoutonRetour from '@/components/divers/boutonRetour';
import { apiGet } from '@/constants/api/apiCalls';
import ErrorScreen from "@/components/pages/errorPage";

const screenWidth = Dimensions.get('window').width;
const podiumWidth = (screenWidth - 80) / 3;

interface RoomData {
    roomNumber: string;
    totalPoints: number;
}

interface PodiumPlaceProps {
    position: number;
    roomNumber: string;
    points: number;
    height: number;
}

const PodiumPlace: React.FC<PodiumPlaceProps> = ({ position, roomNumber, points, height }) => {
    const getIcon = () => {
        switch (position) {
            case 1: return <Crown size={32} color="#EFBF04" />;
            case 2: return <Trophy size={28} color="#C0C0C0" />;
            case 3: return <Medal size={28} color="#CD7F32" />;
            default: return null;
        }
    };

    const getBackgroundColor = () => {
        switch (position) {
            case 1: return "#EFBF04";
            case 2: return "#C0C0C0";
            case 3: return "#CD7F32";
            default: return "#EBEBEB";
        }
    };

    return (
        <View style={podiumStyles.placeContainer}>
            <View style={podiumStyles.iconContainer}>
                {getIcon()}
                <Text style={[podiumStyles.positionText, { color: Colors.primaryBorder }]}>
                    {position}
                </Text>
            </View>
            <Text style={[podiumStyles.roomText, { color: Colors.primaryBorder }]} numberOfLines={1}>
                {roomNumber}
            </Text>
            <Text style={[podiumStyles.pointsText, { color: Colors.primaryBorder }]}>
                {points} pts
            </Text>
            <View style={[
                podiumStyles.podiumBar,
                {
                    height: height,
                    backgroundColor: getBackgroundColor(),
                }
            ]} />
        </View>
    );
};

interface RankingItemProps {
    position: number;
    roomNumber: string;
    points: number;
}

const RankingItem: React.FC<RankingItemProps> = ({ position, roomNumber, points }) => {
    return (
        <View style={rankingStyles.container}>
            <View style={rankingStyles.positionContainer}>
                <Text style={rankingStyles.positionNumber}>{position}</Text>
            </View>
            <View style={rankingStyles.contentContainer}>
                <Text style={rankingStyles.roomName}>{roomNumber}</Text>
                <Text style={rankingStyles.points}>{points} points</Text>
            </View>
        </View>
    );
};

const podiumStyles = StyleSheet.create({
    placeContainer: {
        alignItems: 'center',
        justifyContent: 'flex-end',
        width: podiumWidth,
        paddingHorizontal: 8,
        marginHorizontal: 4,
    },
    iconContainer: {
        alignItems: 'center',
        marginBottom: 4,
        height: 50,
        justifyContent: 'center',
    },
    positionText: {
        ...TextStyles.small,
        fontFamily: Fonts.text.bold,
        marginTop: 4,
    },
    roomText: {
        ...TextStyles.small,
        fontFamily: Fonts.text.bold,
        textAlign: 'center',
        marginBottom: 4,
    },
    pointsText: {
        ...TextStyles.small,
        fontFamily: Fonts.text.regular,
        textAlign: 'center',
        marginBottom: 8,
    },
    podiumBar: {
        width: '100%',
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        shadowColor: Colors.primaryBorder,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
    },
});

const rankingStyles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        marginHorizontal: 16,
        marginVertical: 4,
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "rgba(0,0,0,0.06)",
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowOffset: { width: 2, height: 3 },
        shadowRadius: 5,
        elevation: 3,
    },
    positionContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    positionNumber: {
        ...TextStyles.bodyLarge,
        fontWeight: '800',
        color: Colors.white,
    },
    contentContainer: {
        flex: 1,
    },
    roomName: {
        ...TextStyles.bodyBold,
        color: Colors.primaryBorder,
        marginBottom: 2,
    },
    points: {
        ...TextStyles.small,
        color: Colors.muted,
    },
});

export default function DefisClassement() {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState('');
    const [podium, setPodium] = useState<RoomData[]>([]);
    const [rest, setRest] = useState<RoomData[]>([]);
    const [disableRefresh, setDisableRefresh] = useState(false);

    useEffect(() => {
        fetchClassement();
        const loadAsyncFonts = async () => {
            await loadFonts();
        };
        loadAsyncFonts();
    }, []);

    const fetchClassement = async () => {
        setLoading(true);
        setDisableRefresh(true);
        try {
            const response = await apiGet("classement-chambres");
            if (response.success) {
                setPodium(response.podium);
                setRest(response.rest);
            } else {
                setError(response.message);
            }
        } catch (error: any) {
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
        <View style={{ flex: 1, backgroundColor: Colors.white }}>
            <Header refreshFunction={fetchClassement} disableRefresh={disableRefresh} />
            <View style={{ width: '100%', paddingHorizontal: 20 }}>
                <BoutonRetour previousRoute="defisScreen" title={"Classement"} />
            </View>

            <View style={styles.podiumSection}>
                <Text style={styles.sectionTitle}>Podium</Text>
                <View style={styles.podiumContainer}>
                    {podium.length > 1 && (
                        <PodiumPlace
                            position={2}
                            roomNumber={podium[1].roomNumber}
                            points={podium[1].totalPoints}
                            height={80}
                        />
                    )}
                    {podium.length > 0 && (
                        <PodiumPlace
                            position={1}
                            roomNumber={podium[0].roomNumber}
                            points={podium[0].totalPoints}
                            height={120}
                        />
                    )}
                    {podium.length > 2 && (
                        <PodiumPlace
                            position={3}
                            roomNumber={podium[2].roomNumber}
                            points={podium[2].totalPoints}
                            height={60}
                        />
                    )}
                </View>
            </View>

            <FlatList
                data={Object.values(rest)}
                keyExtractor={(item) => item.roomNumber}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={() => (
                    <View style={styles.rankingSection}>
                        {Object.values(rest).length > 0 && (
                            <Text style={styles.sectionTitle}>
                                Classement
                            </Text>
                        )}
                    </View>
                )}
                renderItem={({ item, index }) => (
                    <RankingItem
                        position={index + 4}
                        roomNumber={item.roomNumber}
                        points={item.totalPoints}
                    />
                )}
                contentContainerStyle={styles.flatListContainer}
                ListEmptyComponent={() =>
                    Object.values(rest).length === 0 ? null : (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>Aucune autre chambre dans le classement</Text>
                        </View>
                    )
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.lightMuted,
    },
    headerContainer: {
        width: '100%',
        backgroundColor: Colors.white,
        paddingHorizontal: 20,
        shadowColor: Colors.primaryBorder,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    sectionTitle: {
        ...TextStyles.h3,
        color: Colors.primaryBorder,
        textAlign: 'center',
        marginBottom: 26,
    },
    podiumSection: {
        backgroundColor: Colors.white,
        paddingTop: 24,
        paddingBottom: 16,
        marginHorizontal: 16,
        borderRadius: 16,
        shadowColor: Colors.primaryBorder,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    podiumContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'flex-end',
        paddingHorizontal: 20,
        height: 200,
    },
    rankingSection: {
        flex: 1,
        marginTop: 8,
        paddingTop: 16,
    },
    rankingScrollView: {
        flex: 1,
        paddingTop: 8,
    },
    flatListContainer: {
        paddingBottom: 20,
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyText: {
        ...TextStyles.body,
        color: Colors.muted,
        textAlign: 'center',
    },
});
