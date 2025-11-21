import { Text, View, ActivityIndicator, Dimensions, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import Header from "@/components/header";
import React, { useState, useEffect, useCallback } from "react";
import { Colors, TextStyles, Fonts } from '@/constants/GraphSettings';
import { Crown, Trophy, Medal, ChevronDown } from "lucide-react-native";
import BoutonRetour from '@/components/divers/boutonRetour';
import { apiGet } from '@/constants/api/apiCalls';
import ErrorScreen from "@/components/pages/errorPage";

const screenWidth = Dimensions.get('window').width;
const podiumWidth = (screenWidth - 80) / 3;

type RankingType = 'speed' | 'distance' | 'duration';

interface PerformanceData {
    user_id: number;
    full_name: string;
    max_speed: number;
    total_distance?: number;
    duration?: number;
}

interface PodiumPlaceProps {
    position: number;
    fullName: string;
    speed: string;
    height: number;
}

const PodiumPlace: React.FC<PodiumPlaceProps> = ({ position, fullName, speed, height }) => {
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
                {fullName}
            </Text>
            <Text style={[podiumStyles.pointsText, { color: Colors.primaryBorder }]}>
                {speed}
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
    fullName: string;
    speed: string;
}

const RankingItem: React.FC<RankingItemProps> = ({ position, fullName, speed }) => {
    return (
        <View style={rankingStyles.container}>
            <View style={rankingStyles.positionContainer}>
                <Text style={rankingStyles.positionNumber}>{position}</Text>
            </View>
            <View style={rankingStyles.contentContainer}>
                <Text style={rankingStyles.roomName}>{fullName}</Text>
                <Text style={rankingStyles.points}>{speed}</Text>
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

export default function PerformancesScreen() {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState('');
    const [podium, setPodium] = useState<PerformanceData[]>([]);
    const [rest, setRest] = useState<PerformanceData[]>([]);
    const [disableRefresh, setDisableRefresh] = useState(false);
    const [rankingType, setRankingType] = useState<RankingType>('speed');
    const [showRankingMenu, setShowRankingMenu] = useState(false);

    const fetchPerformances = useCallback(async () => {
        setLoading(true);
        setDisableRefresh(true);
        try {
            const response = await apiGet(`classement-performances?type=${rankingType}`);
            if (response.success && response.data) {
                const allPerformances = Object.values(response.data as any[]);
                const podiumData = allPerformances.slice(0, 3);
                const restData = allPerformances.slice(3);

                setPodium(podiumData);
                setRest(restData);
            } else {
                setError(response.message || 'Erreur lors du chargement des performances');
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
    }, [rankingType]);

    useEffect(() => {
        fetchPerformances();
    }, [fetchPerformances]);

    const getRankingLabel = () => {
        switch (rankingType) {
            case 'speed': return 'Vitesse max';
            case 'distance': return 'Distance';
            case 'duration': return 'Temps';
        }
    };

    const getValue = (item: PerformanceData) => {
        switch (rankingType) {
            case 'speed': return `${Number(item.max_speed).toFixed(1)} km/h`;
            case 'distance': return `${Number(item.total_distance || 0).toFixed(2)} km`;
            case 'duration': return `${Math.floor(Number(item.duration || 0) / 60 / 60)}h${Math.floor(Number(item.duration || 0) % 60)}min`;
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
            <Header refreshFunction={fetchPerformances} disableRefresh={disableRefresh} />
            <View style={{ width: '100%', paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', zIndex: 1000 }}>
                <BoutonRetour previousRoute="VitesseDeGlisseScreen" title={"Classement"} />
                <View style={styles.dropdownContainer}>
                    <TouchableOpacity
                        style={styles.rankingButton}
                        onPress={() => setShowRankingMenu(!showRankingMenu)}
                    >
                        <Text style={styles.rankingButtonText}>{getRankingLabel()}</Text>
                        <ChevronDown
                            size={16}
                            color={Colors.primary}
                            style={{
                                transform: [{ rotate: showRankingMenu ? '180deg' : '0deg' }]
                            }}
                        />
                    </TouchableOpacity>

                    {showRankingMenu && (
                        <View style={styles.dropdownMenu}>
                            <TouchableOpacity
                                style={[styles.dropdownOption, rankingType === 'speed' && styles.dropdownOptionActive]}
                                onPress={() => {
                                    setRankingType('speed');
                                    setShowRankingMenu(false);
                                }}
                            >
                                <Text style={[styles.dropdownOptionText, rankingType === 'speed' && styles.dropdownOptionTextActive]}>
                                    Vitesse max
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.dropdownOption, rankingType === 'distance' && styles.dropdownOptionActive]}
                                onPress={() => {
                                    setRankingType('distance');
                                    setShowRankingMenu(false);
                                }}
                            >
                                <Text style={[styles.dropdownOptionText, rankingType === 'distance' && styles.dropdownOptionTextActive]}>
                                    Distance
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.dropdownOption,
                                    styles.dropdownOptionLast,
                                    rankingType === 'duration' && styles.dropdownOptionActive
                                ]}
                                onPress={() => {
                                    setRankingType('duration');
                                    setShowRankingMenu(false);
                                }}
                            >
                                <Text style={[styles.dropdownOptionText, rankingType === 'duration' && styles.dropdownOptionTextActive]}>
                                    Temps
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </View>

            <View style={styles.podiumSection}>
                <Text style={styles.sectionTitle}>Podium</Text>
                <View style={styles.podiumContainer}>
                    {podium.length > 1 && (
                        <PodiumPlace
                            position={2}
                            fullName={podium[1].full_name}
                            speed={getValue(podium[1])}
                            height={80}
                        />
                    )}
                    {podium.length > 0 && (
                        <PodiumPlace
                            position={1}
                            fullName={podium[0].full_name}
                            speed={getValue(podium[0])}
                            height={120}
                        />
                    )}
                    {podium.length > 2 && (
                        <PodiumPlace
                            position={3}
                            fullName={podium[2].full_name}
                            speed={getValue(podium[2])}
                            height={60}
                        />
                    )}
                </View>
            </View>

            <FlatList
                data={rest}
                keyExtractor={(item) => item.user_id.toString()}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={() => (
                    <View style={styles.rankingSection}>
                        {rest.length > 0 && (
                            <Text style={styles.sectionTitle}>
                                Classement
                            </Text>
                        )}
                    </View>
                )}
                renderItem={({ item, index }) => (
                    <RankingItem
                        position={index + 4}
                        fullName={item.full_name}
                        speed={getValue(item)}
                    />
                )}
                contentContainerStyle={styles.flatListContainer}
                ListEmptyComponent={() =>
                    rest.length === 0 ? null : (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>Aucune autre performance dans le classement</Text>
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
        marginTop: 12,
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
    dropdownContainer: {
        position: 'relative',
        marginBottom: 8,
    },
    rankingButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: Colors.primary,
        gap: 4,
    },
    rankingButtonText: {
        ...TextStyles.small,
        color: Colors.primary,
        fontWeight: '600',
    },
    dropdownMenu: {
        position: 'absolute',
        top: '100%',
        right: 0,
        marginTop: 4,
        backgroundColor: Colors.white,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: Colors.lightMuted,
        shadowColor: Colors.primaryBorder,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5,
        minWidth: 140,
        overflow: 'hidden',
    },
    dropdownOption: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.lightMuted,
    },
    dropdownOptionLast: {
        borderBottomWidth: 0,
    },
    dropdownOptionActive: {
        backgroundColor: Colors.primary,
    },
    dropdownOptionText: {
        ...TextStyles.body,
        color: Colors.primaryBorder,
        textAlign: 'left',
    },
    dropdownOptionTextActive: {
        color: Colors.white,
        fontWeight: '600',
    },
});
