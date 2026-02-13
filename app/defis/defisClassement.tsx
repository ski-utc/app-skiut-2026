import React, { useState, useEffect, useCallback } from 'react';
import {
  Text,
  View,
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  FlatList,
} from 'react-native';
import { Crown, Trophy, Medal } from 'lucide-react-native';

import { Colors, TextStyles, Fonts } from '@/constants/GraphSettings';
import BoutonRetour from '@/components/divers/boutonRetour';
import {
  apiGet,
  isSuccessResponse,
  handleApiErrorScreen,
} from '@/constants/api/apiCalls';
import ErrorScreen from '@/components/pages/errorPage';
import { useUser } from '@/contexts/UserContext';

import Header from '../../components/header';

const screenWidth = Dimensions.get('window').width;
const podiumWidth = (screenWidth - 80) / 3;

type RoomData = {
  roomNumber: string;
  totalPoints: number;
};

type RankingResponse = {
  podium: RoomData[];
  rest: RoomData[];
};

type PodiumPlaceProps = {
  position: number;
  roomNumber: string;
  points: number;
  height: number;
};

const PodiumPlace: React.FC<PodiumPlaceProps> = ({
  position,
  roomNumber,
  points,
  height,
}) => {
  const getIcon = () => {
    switch (position) {
      case 1:
        return <Crown size={32} color="#EFBF04" />;
      case 2:
        return <Trophy size={28} color="#C0C0C0" />;
      case 3:
        return <Medal size={28} color="#CD7F32" />;
      default:
        return null;
    }
  };

  const getBackgroundColor = () => {
    switch (position) {
      case 1:
        return '#EFBF04';
      case 2:
        return '#C0C0C0';
      case 3:
        return '#CD7F32';
      default:
        return '#EBEBEB';
    }
  };

  return (
    <View style={podiumStyles.placeContainer}>
      <View style={podiumStyles.iconContainer}>
        {getIcon()}
        <Text
          style={[podiumStyles.positionText, { color: Colors.primaryBorder }]}
        >
          {position}
        </Text>
      </View>
      <Text
        style={[podiumStyles.roomText, { color: Colors.primaryBorder }]}
        numberOfLines={1}
      >
        {roomNumber}
      </Text>
      <Text style={[podiumStyles.pointsText, { color: Colors.primaryBorder }]}>
        {points} pts
      </Text>
      <View
        style={[
          podiumStyles.podiumBar,
          {
            height: height,
            backgroundColor: getBackgroundColor(),
          },
        ]}
      />
    </View>
  );
};

type RankingItemProps = {
  position: number;
  roomNumber: string;
  points: number;
};

const RankingItem: React.FC<RankingItemProps> = ({
  position,
  roomNumber,
  points,
}) => {
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
    fontFamily: Fonts.text.regular,
    marginBottom: 8,
    textAlign: 'center',
  },
  positionText: {
    ...TextStyles.small,
    fontFamily: Fonts.text.bold,
    marginTop: 4,
  },
  roomText: {
    ...TextStyles.small,
    fontFamily: Fonts.text.bold,
    marginBottom: 4,
    textAlign: 'center',
  },
});

const rankingStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderColor: 'rgba(0,0,0,0.06)',
    borderRadius: 12,
    borderWidth: 1,
    elevation: 3,
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 4,
    paddingHorizontal: 16,
    paddingVertical: 16,
    shadowColor: '#000',
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

export default function DefisClassement() {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState('');
  const [podium, setPodium] = useState<RoomData[]>([]);
  const [rest, setRest] = useState<RoomData[]>([]);

  const { setUser } = useUser();

  const fetchClassement = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await apiGet<RankingResponse>('classement-chambres');

      if (isSuccessResponse(response) && response.data) {
        setPodium(response.data.podium || []);
        setRest(response.data.rest || []);
      }
    } catch (err: unknown) {
      handleApiErrorScreen(err, setUser, setError);
    } finally {
      setLoading(false);
    }
  }, [setUser]);

  useEffect(() => {
    fetchClassement();
  }, [fetchClassement]);

  if (error) {
    return <ErrorScreen error={error} />;
  }

  if (loading && podium.length === 0) {
    return (
      <View style={styles.container}>
        <Header refreshFunction={undefined} disableRefresh={true} />
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color={Colors.primaryBorder} />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header refreshFunction={fetchClassement} disableRefresh={false} />
      <View style={styles.headerContainer}>
        <BoutonRetour title={'Classement'} />
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
        data={rest}
        keyExtractor={(item, index) => item.roomNumber + index}
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
            roomNumber={item.roomNumber}
            points={item.totalPoints}
          />
        )}
        contentContainerStyle={styles.flatListContainer}
        ListEmptyComponent={() =>
          rest.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                Aucune autre chambre dans le classement
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    flex: 1,
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
  headerContainer: {
    paddingHorizontal: 20,
    width: '100%',
  },
  loadingContent: {
    alignItems: 'center',
    backgroundColor: Colors.white,
    flex: 1,
    justifyContent: 'center',
    width: '100%',
  },
  loadingText: {
    ...TextStyles.body,
    color: Colors.muted,
    marginTop: 16,
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
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  rankingSection: {
    flex: 1,
    marginTop: 8,
    paddingTop: 16,
  },
  sectionTitle: {
    ...TextStyles.h3,
    color: Colors.primaryBorder,
    marginBottom: 26,
    textAlign: 'center',
  },
});
