import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ActivityIndicator, FlatList, TouchableOpacity, StyleSheet, Modal, ScrollView, Image, StatusBar } from 'react-native';
import { Colors, TextStyles } from '@/constants/GraphSettings';
import Header from '../../components/header';
import { useUser } from '@/contexts/UserContext';
import BoutonRetour from '@/components/divers/boutonRetour';
import { apiGet } from '@/constants/api/apiCalls';
import ErrorScreen from '@/components/pages/errorPage';
import { Heart, User, Sparkles, Eye, X, Trophy } from 'lucide-react-native';

export default function SkinderMyMatches() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [matchedRooms, setMatchedRooms] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loadingRoomDetails, setLoadingRoomDetails] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
        <BoutonRetour previousRoute={'homeNavigator'} title={'Mes Matches'} />
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
              <Text style={[TextStyles.body, { color: Colors.muted, marginTop: 16 }]}>
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
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  headerContainer: {
    width: '100%',
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    ...TextStyles.body,
    color: Colors.muted,
    marginTop: 16,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  pageTitle: {
    ...TextStyles.h3Bold,
    color: Colors.primaryBorder,
  },
  listContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  matchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 2, height: 3 },
    shadowRadius: 5,
    elevation: 3,
    marginBottom: 12,
    padding: 16,
  },
  matchIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.lightMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  matchContent: {
    flex: 1,
  },
  matchRoomNumber: {
    ...TextStyles.bodyBold,
    color: Colors.primaryBorder,
    marginBottom: 4,
  },
  matchRespName: {
    ...TextStyles.body,
    color: Colors.primary,
    marginBottom: 4,
  },
  matchSubtitle: {
    ...TextStyles.small,
    color: Colors.muted,
  },
  matchAction: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.lightMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 60,
  },
  emptyStateTitle: {
    ...TextStyles.h2Bold,
    color: Colors.primaryBorder,
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 12,
  },
  emptyStateText: {
    ...TextStyles.body,
    color: Colors.muted,
    textAlign: 'center',
    lineHeight: 22,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1000,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    flex: 1,
  },
  modalImageContainer: {
    position: 'relative',
    height: 400,
  },
  modalImage: {
    width: '100%',
    height: '100%',
  },
  modalImageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 24,
    paddingHorizontal: 20,
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
  modalInfo: {
    padding: 20,
  },
  modalInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.lightMuted,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    gap: 8,
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
  modalSection: {
    marginBottom: 24,
  },
  modalSectionTitle: {
    ...TextStyles.h4Bold,
    color: Colors.primaryBorder,
    marginBottom: 12,
  },
  modalDescriptionText: {
    ...TextStyles.body,
    color: Colors.muted,
    lineHeight: 22,
  },
  modalPassionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  modalPassionChip: {
    backgroundColor: Colors.lightMuted,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  modalPassionText: {
    ...TextStyles.body,
    color: Colors.primary,
    fontWeight: '600',
  },
  modalStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 16,
  },
  modalStatItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Colors.lightMuted,
    borderRadius: 12,
    padding: 16,
  },
  modalStatValue: {
    ...TextStyles.h2Bold,
    color: Colors.primaryBorder,
    marginTop: 8,
  },
  modalStatLabel: {
    ...TextStyles.small,
    color: Colors.muted,
    marginTop: 4,
    textAlign: 'center',
  },
});
