import { useEffect, useState, useCallback } from 'react';
import { View, Text, ActivityIndicator, FlatList, TouchableOpacity, StyleSheet, Modal, ScrollView, Image, StatusBar } from 'react-native';
import { Heart, User, Sparkles, Eye, X, Trophy } from 'lucide-react-native';

import { Colors, TextStyles } from '@/constants/GraphSettings';
import { useUser } from '@/contexts/UserContext';
import BoutonRetour from '@/components/divers/boutonRetour';
import { apiGet } from '@/constants/api/apiCalls';
import ErrorScreen from '@/components/pages/errorPage';

import Header from '../../components/header';

export default function SkinderMyMatches() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [matchedRooms, setMatchedRooms] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loadingRoomDetails, setLoadingRoomDetails] = useState(false);
  const [_selectedRoom, setSelectedRoom] = useState<any>(null);
  const [roomDetails, setRoomDetails] = useState({
    id: null,
    roomNumber: '',
    name: '',
    description: '',
    mood: '',
    passions: [],
    image: "https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png",
    totalPoints: 0,
    respUser: null,
    statistics: {
      likesReceived: 0,
      likesGiven: 0,
      matches: 0
    }
  });
  const { setUser } = useUser();
  const fetchMatches = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiGet('skinder/matches');
      if (response.success) {
        setMatchedRooms(response.data);
      } else {
        setError(response.message || 'Une erreur est survenue lors de la récupération des matchs.');
      }
    } catch (error: any) {
      if (error.message === 'NoRefreshTokenError' || error.JWT_ERROR) {
        setUser(null);
      } else {
        setError(error.message || 'Erreur réseau.');
      }
    } finally {
      setLoading(false);
    }
  }, [setUser]);

  const fetchRoomDetails = useCallback(async (roomId: number) => {
    setLoadingRoomDetails(true);
    try {
      const response = await apiGet(`skinder/rooms/${roomId}`);
      if (response.success) {
        setRoomDetails({
          id: response.data.id,
          roomNumber: response.data.roomNumber,
          name: response.data.name,
          description: response.data.description,
          mood: response.data.mood,
          passions: Array.isArray(response.data.passions) ? response.data.passions : [],
          image: response.data.image || "https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png",
          totalPoints: response.data.totalPoints,
          respUser: response.data.respUser,
          statistics: response.data.statistics || {
            likesReceived: 0,
            likesGiven: 0,
            matches: 0
          }
        });
      } else {
        setError(response.message || 'Une erreur est survenue lors de la récupération des détails.');
      }
    } catch (error: any) {
      if (error.message === 'NoRefreshTokenError' || error.JWT_ERROR) {
        setUser(null);
      } else {
        setError(error.message || 'Erreur réseau.');
      }
    } finally {
      setLoadingRoomDetails(false);
    }
  }, [setUser]);

  const handleOpenModal = (room: any) => {
    setSelectedRoom(room);
    setIsModalVisible(true);
    fetchRoomDetails(room.roomId);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedRoom(null);
    setRoomDetails({
      id: null,
      roomNumber: '',
      name: '',
      description: '',
      mood: '',
      passions: [],
      image: "https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png",
      totalPoints: 0,
      respUser: null,
      statistics: {
        likesReceived: 0,
        likesGiven: 0,
        matches: 0
      }
    });
  };

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  if (error) {
    return (
      <ErrorScreen error={error} />
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <Header refreshFunction={undefined} disableRefresh={true} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primaryBorder} />
          <Text style={styles.loadingText}>
            Chargement...
          </Text>
        </View>
      </View>
    );
  }

  const renderMatchItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.matchCard} onPress={() => handleOpenModal(item)} activeOpacity={0.7}>
      <View style={styles.matchIconContainer}>
        <Heart size={24} color={Colors.primary} fill={Colors.primary} />
      </View>
      <View style={styles.matchContent}>
        <Text style={styles.matchRoomNumber}>Chambre {item.roomNumber}</Text>
        {item.respRoom && (
          <Text style={styles.matchRespName}>{item.respRoom}</Text>
        )}
        <Text style={styles.matchSubtitle}>
          Appuyez pour voir le profil
        </Text>
      </View>
      <View style={styles.matchAction}>
        <Eye size={20} color={Colors.primary} />
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <User size={64} color={Colors.lightMuted} />
      <Text style={styles.emptyStateTitle}>Aucun match pour le moment</Text>
      <Text style={styles.emptyStateText}>
        Continuez à découvrir des profils pour trouver vos premiers matches !
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header refreshFunction={fetchMatches} disableRefresh={loading} />
      <View style={styles.headerContainer}>
        <BoutonRetour title={'Mes Matches'} />
      </View>

      <View style={styles.content}>
        <FlatList
          data={matchedRooms}
          renderItem={renderMatchItem}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
        />
      </View>

      <Modal
        visible={isModalVisible}
        transparent={false}
        animationType="slide"
        onRequestClose={handleCloseModal}
      >
        <StatusBar hidden />
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleCloseModal}
            activeOpacity={0.7}
          >
            <X size={24} color={Colors.white} />
          </TouchableOpacity>

          {loadingRoomDetails ? (
            <View style={styles.modalLoadingContainer}>
              <ActivityIndicator size="large" color={Colors.primaryBorder} />
              <Text style={styles.loadingText}>
                Chargement du profil...
              </Text>
            </View>
          ) : (
            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              <View style={styles.modalImageContainer}>
                <Image
                  source={{ uri: roomDetails.image }}
                  style={styles.modalImage}
                  resizeMode="cover"
                />
                <View style={styles.modalImageOverlay}>
                  <Text style={styles.modalRoomName}>{roomDetails.name}</Text>
                  {roomDetails.roomNumber && (
                    <Text style={styles.modalRoomNumber}>Chambre {roomDetails.roomNumber}</Text>
                  )}
                </View>
              </View>

              <View style={styles.modalInfo}>
                {roomDetails.respUser && (
                  <View style={styles.modalInfoCard}>
                    <Text style={styles.modalInfoLabel}>Responsable de chambre</Text>
                    <Text style={styles.modalInfoValue}>{(roomDetails.respUser as any).fullName}</Text>
                  </View>
                )}

                {roomDetails.totalPoints > 0 && (
                  <View style={styles.modalInfoCard}>
                    <Trophy size={16} color={Colors.primary} />
                    <Text style={styles.modalInfoLabel}>Points Défis</Text>
                    <Text style={styles.modalInfoValue}>{roomDetails.totalPoints} pts</Text>
                  </View>
                )}

                {roomDetails.mood && (
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Humeur</Text>
                    <Text style={styles.modalDescriptionText}>{roomDetails.mood}</Text>
                  </View>
                )}

                {roomDetails.description ? (
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>À propos</Text>
                    <Text style={styles.modalDescriptionText}>{roomDetails.description}</Text>
                  </View>
                ) : null}

                {roomDetails.passions.length > 0 ? (
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Passions</Text>
                    <View style={styles.modalPassionContainer}>
                      {roomDetails.passions.map((passion, index) => (
                        <View key={index} style={styles.modalPassionChip}>
                          <Text style={styles.modalPassionText}>{passion}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                ) : null}

                {(roomDetails.statistics.matches > 0 || roomDetails.statistics.likesReceived > 0) && (
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Statistiques</Text>
                    <View style={styles.modalStatsContainer}>
                      <View style={styles.modalStatItem}>
                        <Heart size={20} color={Colors.primary} fill={Colors.primary} />
                        <Text style={styles.modalStatValue}>{roomDetails.statistics.likesReceived}</Text>
                        <Text style={styles.modalStatLabel}>Likes reçus</Text>
                      </View>
                      <View style={styles.modalStatItem}>
                        <Sparkles size={20} color={Colors.accent} />
                        <Text style={styles.modalStatValue}>{roomDetails.statistics.matches}</Text>
                        <Text style={styles.modalStatLabel}>Matches</Text>
                      </View>
                    </View>
                  </View>
                )}
              </View>
            </ScrollView>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  closeButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 22,
    height: 44,
    justifyContent: 'center',
    position: 'absolute',
    right: 20,
    top: 50,
    width: 44,
    zIndex: 1000,
  },
  container: {
    backgroundColor: Colors.white,
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyStateContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingTop: 60,
  },
  emptyStateText: {
    ...TextStyles.body,
    color: Colors.muted,
    lineHeight: 22,
    textAlign: 'center',
  },
  emptyStateTitle: {
    ...TextStyles.h2Bold,
    color: Colors.primaryBorder,
    marginBottom: 12,
    marginTop: 24,
    textAlign: 'center',
  },
  headerContainer: {
    paddingHorizontal: 20,
    width: '100%',
  },
  listContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    ...TextStyles.body,
    color: Colors.muted,
    marginTop: 16,
    textAlign: 'center',
  },
  matchAction: {
    alignItems: 'center',
    backgroundColor: Colors.lightMuted,
    borderRadius: 16,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  matchCard: {
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderColor: 'rgba(0,0,0,0.06)',
    borderRadius: 14,
    borderWidth: 1,
    elevation: 3,
    flexDirection: 'row',
    marginBottom: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
  },
  matchContent: {
    flex: 1,
  },
  matchIconContainer: {
    alignItems: 'center',
    backgroundColor: Colors.lightMuted,
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    marginRight: 16,
    width: 48,
  },
  matchRespName: {
    ...TextStyles.body,
    color: Colors.primary,
    marginBottom: 4,
  },
  matchRoomNumber: {
    ...TextStyles.bodyBold,
    color: Colors.primaryBorder,
    marginBottom: 4,
  },
  matchSubtitle: {
    ...TextStyles.small,
    color: Colors.muted,
  },
  modalContainer: {
    backgroundColor: Colors.white,
    flex: 1,
  },
  modalContent: {
    flex: 1,
  },
  modalDescriptionText: {
    ...TextStyles.body,
    color: Colors.muted,
    lineHeight: 22,
  },
  modalImage: {
    height: '100%',
    width: '100%',
  },
  modalImageContainer: {
    height: 400,
    position: 'relative',
  },
  modalImageOverlay: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    bottom: 0,
    left: 0,
    paddingHorizontal: 20,
    paddingVertical: 24,
    position: 'absolute',
    right: 0,
  },
  modalInfo: {
    padding: 20,
  },
  modalInfoCard: {
    alignItems: 'center',
    backgroundColor: Colors.lightMuted,
    borderRadius: 12,
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
    padding: 16,
  },
  modalInfoLabel: {
    ...TextStyles.body,
    color: Colors.muted,
    flex: 1,
  },
  modalInfoValue: {
    ...TextStyles.bodyBold,
    color: Colors.primaryBorder,
  },
  modalLoadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalPassionChip: {
    backgroundColor: Colors.lightMuted,
    borderColor: Colors.primary,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  modalPassionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  modalPassionText: {
    ...TextStyles.body,
    color: Colors.primary,
    fontWeight: '600',
  },
  modalRoomName: {
    ...TextStyles.h1Bold,
    color: Colors.white,
  },
  modalRoomNumber: {
    ...TextStyles.body,
    color: Colors.white,
    marginTop: 4,
    opacity: 0.9,
  },
  modalSection: {
    marginBottom: 24,
  },
  modalSectionTitle: {
    ...TextStyles.h4Bold,
    color: Colors.primaryBorder,
    marginBottom: 12,
  },
  modalStatItem: {
    alignItems: 'center',
    backgroundColor: Colors.lightMuted,
    borderRadius: 12,
    flex: 1,
    padding: 16,
  },
  modalStatLabel: {
    ...TextStyles.small,
    color: Colors.muted,
    marginTop: 4,
    textAlign: 'center',
  },
  modalStatValue: {
    ...TextStyles.h2Bold,
    color: Colors.primaryBorder,
    marginTop: 8,
  },
  modalStatsContainer: {
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'space-around',
  },
});
