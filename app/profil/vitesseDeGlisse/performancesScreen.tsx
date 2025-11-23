import { Text, View, ActivityIndicator, Dimensions, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import React, { useState, useEffect, useCallback } from "react";
import { Crown, Trophy, Medal, ChevronDown } from "lucide-react-native";

import Header from "@/components/header";
import { Colors, TextStyles, Fonts } from '@/constants/GraphSettings';
import BoutonRetour from '@/components/divers/boutonRetour';
import { apiGet, isSuccessResponse, handleApiErrorScreen } from '@/constants/api/apiCalls';
import ErrorScreen from "@/components/pages/errorPage";
import { useUser } from "@/contexts/UserContext";

const screenWidth = Dimensions.get('window').width;
const podiumWidth = (screenWidth - 80) / 3;

const goldColor = "#EFBF04";
const silverColor = "#C0C0C0";
const bronzeColor = "#CD7F32";

type RankingType = 'speed' | 'distance' | 'duration';

type PerformanceData = {
    user_id: number;
    full_name: string;
    max_speed: number;
    total_distance?: number;
    duration?: number;
}

type PerformanceResponse = PerformanceData[] | Record<string, PerformanceData>;

type PodiumPlaceProps = {
    position: number;
    fullName: string;
    valueDisplay: string;
    height: number;
}

type RankingItemProps = {
    position: number;
    fullName: string;
    valueDisplay: string;
}

const PodiumPlace: React.FC<PodiumPlaceProps> = ({ position, fullName, valueDisplay, height }) => {
    return (
        <View style={podiumStyles.placeContainer}>
            <View style={podiumStyles.iconContainer}>
                {position === 1 && <Crown size={32} color={goldColor} />}
                {position === 2 && <Trophy size={28} color={silverColor} />}
                {position === 3 && <Medal size={28} color={bronzeColor} />}
                <Text style={podiumStyles.positionText}>{position}</Text>
            </View>
            <Text style={podiumStyles.roomText} numberOfLines={1}>{fullName}</Text>
            <Text style={podiumStyles.pointsText}>{valueDisplay}</Text>
            <View style={[
                podiumStyles.podiumBar,
                { height, backgroundColor: position === 1 ? goldColor : position === 2 ? silverColor : bronzeColor }
            ]} />
        </View>
    );
};

const RankingItem: React.FC<RankingItemProps> = ({ position, fullName, valueDisplay }) => {
    return (
        <View style={rankingStyles.container}>
            <View style={rankingStyles.positionContainer}>
                <Text style={rankingStyles.positionNumber}>{position}</Text>
            </View>
            <View style={rankingStyles.contentContainer}>
                <Text style={rankingStyles.roomName}>{fullName}</Text>
                <Text style={rankingStyles.points}>{valueDisplay}</Text>
            </View>
        </View>
    );
};

const podiumStyles = StyleSheet.create({
    iconContainer: {
        alignItems: 'center',
        height: 50,
        justifyContent: 'center',
        marginBottom: 4,
    },
    placeContainer: {
        alignItems: 'center',
        justifyContent: 'flex-end',
        marginHorizontal: 4,
        paddingHorizontal: 8,
        width: podiumWidth,
    },
    podiumBar: {
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        elevation: 5,
        shadowColor: Colors.primaryBorder,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        width: '100%',
    },
    pointsText: {
        ...TextStyles.small,
        color: Colors.primaryBorder,
        fontFamily: Fonts.text.regular,
        marginBottom: 8,
        textAlign: 'center',
    },
    positionText: {
        ...TextStyles.small,
        color: Colors.primaryBorder,
        fontFamily: Fonts.text.bold,
        marginTop: 4,
    },
    roomText: {
        ...TextStyles.small,
        color: Colors.primaryBorder,
        fontFamily: Fonts.text.bold,
        marginBottom: 4,
        textAlign: 'center',
    },
});

const rankingStyles = StyleSheet.create({
    container: {
        alignItems: 'center',
        backgroundColor: Colors.white,
        borderColor: "rgba(0,0,0,0.06)",
        borderRadius: 12,
        borderWidth: 1,
        elevation: 3,
        flexDirection: 'row',
        marginHorizontal: 16,
        marginVertical: 4,
        paddingHorizontal: 16,
        paddingVertical: 16,
        shadowColor: "#000",
        shadowOffset: { width: 2, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 5,
    },
    contentContainer: {
        flex: 1,
    },
    points: {
        ...TextStyles.small,
        color: Colors.muted,
    },
    positionContainer: {
        alignItems: 'center',
        backgroundColor: Colors.primary,
        borderRadius: 20,
        height: 40,
        justifyContent: 'center',
        marginRight: 16,
        width: 40,
    },
    positionNumber: {
        ...TextStyles.bodyLarge,
        color: Colors.white,
        fontWeight: '800',
    },
    roomName: {
        ...TextStyles.bodyBold,
        color: Colors.primaryBorder,
        marginBottom: 2,
    },
});

export default function PerformancesScreen() {
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState('');

    const [podium, setPodium] = useState<PerformanceData[]>([]);
    const [rest, setRest] = useState<PerformanceData[]>([]);

    const [rankingType, setRankingType] = useState<RankingType>('speed');
    const [showRankingMenu, setShowRankingMenu] = useState(false);

    const { setUser } = useUser();

    const fetchPerformances = useCallback(async () => {
        setLoading(true);
        setError('');

        try {
            const response = await apiGet<PerformanceResponse>(`classement-performances?type=${rankingType}`);

            if (isSuccessResponse(response) && response.data) {
                let allPerformances: PerformanceData[] = [];

                if (Array.isArray(response.data)) {
                    allPerformances = response.data;
                } else if (typeof response.data === 'object') {
                    allPerformances = Object.values(response.data);
                }

                // Découpage Podium / Reste
                setPodium(allPerformances.slice(0, 3));
                setRest(allPerformances.slice(3));
            }
        } catch (err: unknown) {
            handleApiErrorScreen(err, setUser, setError);
            setPodium([]);
            setRest([]);
        } finally {
            setLoading(false);
        }
    }, [rankingType, setUser]);

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

    const getValueDisplay = (item: PerformanceData) => {
        switch (rankingType) {
            case 'speed': return `${Number(item.max_speed).toFixed(1)} km/h`;
            case 'distance': return `${Number(item.total_distance || 0).toFixed(2)} km`;
            case 'duration': return `${Math.floor(Number(item.duration || 0) / 3600)}h${Math.floor((Number(item.duration || 0) % 3600) / 60)}min`;
            default: return '';
        }
    };

    if (error) {
        return <ErrorScreen error={error} />;
    }

    if (loading && podium.length === 0 && rest.length === 0) {
        return (
            <View style={styles.pageContainer}>
                <Header refreshFunction={undefined} disableRefresh={true} />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.primaryBorder} />
                    <Text style={styles.loadingText}>Chargement...</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.pageContainer}>
            <Header refreshFunction={fetchPerformances} disableRefresh={loading} />

            <View style={styles.headerRow}>
                <BoutonRetour title={"Classement"} />

                <View style={styles.dropdownContainer}>
                    <TouchableOpacity
                        style={styles.rankingButton}
                        onPress={() => setShowRankingMenu(!showRankingMenu)}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.rankingButtonText}>{getRankingLabel()}</Text>
                        <ChevronDown
                            size={16}
                            color={Colors.primary}
                            style={showRankingMenu ? styles.chevronIconRotated : styles.chevronIcon}
                        />
                    </TouchableOpacity>

                    {showRankingMenu && (
                        <View style={styles.dropdownMenu}>
                            {(['speed', 'distance', 'duration'] as const).map((type) => (
                                <TouchableOpacity
                                    key={type}
                                    style={[
                                        styles.dropdownOption,
                                        rankingType === type && styles.dropdownOptionActive,
                                        type === 'duration' && styles.dropdownOptionLast
                                    ]}
                                    onPress={() => {
                                        setRankingType(type);
                                        setShowRankingMenu(false);
                                    }}
                                >
                                    <Text style={[
                                        styles.dropdownOptionText,
                                        rankingType === type && styles.dropdownOptionTextActive
                                    ]}>
                                        {type === 'speed' ? 'Vitesse max' : type === 'distance' ? 'Distance' : 'Temps'}
                                    </Text>
                                </TouchableOpacity>
                            ))}
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
                            valueDisplay={getValueDisplay(podium[1])}
                            height={80}
                        />
                    )}
                    {podium.length > 0 && (
                        <PodiumPlace
                            position={1}
                            fullName={podium[0].full_name}
                            valueDisplay={getValueDisplay(podium[0])}
                            height={120}
                        />
                    )}
                    {podium.length > 2 && (
                        <PodiumPlace
                            position={3}
                            fullName={podium[2].full_name}
                            valueDisplay={getValueDisplay(podium[2])}
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
                            <Text style={styles.sectionTitle}>Classement</Text>
                        )}
                    </View>
                )}
                renderItem={({ item, index }) => (
                    <RankingItem
                        position={index + 4}
                        fullName={item.full_name}
                        valueDisplay={getValueDisplay(item)}
                    />
                )}
                contentContainerStyle={styles.flatListContainer}
                ListEmptyComponent={() =>
                    rest.length === 0 && !loading ? (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>Aucune autre performance</Text>
                        </View>
                    ) : null
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    chevronIcon: {
        transform: [{ rotate: '0deg' }],
    },
    chevronIconRotated: {
        transform: [{ rotate: '180deg' }],
    },
    dropdownContainer: {
        marginBottom: 8,
        position: 'relative',
        zIndex: 2000,
    },
    dropdownMenu: {
        backgroundColor: Colors.white,
        borderColor: Colors.lightMuted,
        borderRadius: 8,
        borderWidth: 1,
        elevation: 5,
        marginTop: 4,
        minWidth: 140,
        overflow: 'hidden',
        position: 'absolute',
        right: 0,
        shadowColor: Colors.primaryBorder,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        top: '100%',
    },
    dropdownOption: {
        borderBottomColor: Colors.lightMuted,
        borderBottomWidth: 1,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    dropdownOptionActive: {
        backgroundColor: Colors.primary,
    },
    dropdownOptionLast: {
        borderBottomWidth: 0,
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
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyText: {
        ...TextStyles.body,
        color: Colors.muted,
        textAlign: 'center',
    },
    flatListContainer: {
        paddingBottom: 20,
    },
    headerRow: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        width: '100%',
        zIndex: 1000,
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
    },
    pageContainer: {
        backgroundColor: Colors.white,
        flex: 1,
    },
    podiumContainer: {
        alignItems: 'flex-end',
        flexDirection: 'row',
        height: 200,
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    podiumSection: {
        backgroundColor: Colors.white,
        borderRadius: 16,
        elevation: 5,
        marginHorizontal: 16,
        paddingBottom: 16,
        paddingTop: 24,
        shadowColor: Colors.primaryBorder,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        zIndex: 1,
    },
    rankingButton: {
        alignItems: 'center',
        backgroundColor: Colors.white,
        borderColor: Colors.primary,
        borderRadius: 8,
        borderWidth: 1,
        flexDirection: 'row',
        gap: 4,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    rankingButtonText: {
        ...TextStyles.small,
        color: Colors.primary,
        fontWeight: '600',
    },
    rankingSection: {
        flex: 1,
        marginTop: 12,
        paddingTop: 16,
    },
    sectionTitle: {
        ...TextStyles.h3,
        color: Colors.primaryBorder,
        marginBottom: 26,
        textAlign: 'center',
    },
});
