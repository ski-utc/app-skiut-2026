import { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { Heart, TriangleAlert } from 'lucide-react-native';
import Toast from 'react-native-toast-message';

import { Colors, TextStyles } from '@/constants/GraphSettings';
import { apiPost, apiDelete } from '@/constants/api/apiCalls';
import { useUser } from '@/contexts/UserContext';

export default function Anecdote({
  id,
  text,
  room,
  nbLikes,
  liked,
  warned,
  authorId,
  refresh,
  setError,
}: {
  id: string,
  text: string,
  room: string | { name?: string, roomNumber?: string },
  nbLikes: number,
  liked: boolean,
  warned: boolean,
  authorId: string,
  refresh: () => void,
  setError: (error: string) => void
}) {
  const [isLiked, setIsLiked] = useState(liked);
  const [dynamicNbLikes, setDynamicNbLikes] = useState(nbLikes);
  const [isWarned, setIsWarned] = useState(warned);
  const { setUser, user } = useUser();

  const handleLike = async () => {
    try {
      const willLike = !isLiked;
      setIsLiked(willLike);
      setDynamicNbLikes((prev) => Math.max(0, prev + (willLike ? 1 : -1)));
      const response = await apiPost(`anecdotes/${id}/like`, { like: willLike });
      if (response.success || response.pending) {
        setIsLiked(response.liked);
        setDynamicNbLikes(response.nbLikes || (dynamicNbLikes + (response.liked ? 1 : -1)));
      } else {
        setIsLiked(!willLike);
        setDynamicNbLikes((prev) => prev + (willLike ? -1 : 1));
        Toast.show({
          type: 'error',
          text1: 'Une erreur est survenue...',
          text2: response.message,
        });
      }
    } catch (error: any) {
      setIsLiked(!isLiked);
      setDynamicNbLikes((prev) => prev + (isLiked ? 1 : -1));
      if (error.message === 'NoRefreshTokenError' || error.JWT_ERROR) {
        setUser(null);
      } else {
        setError(error.message);
      }
    }
  };

  const handleWarning = async () => {
    try {
      const willWarn = !isWarned;
      setIsWarned(willWarn);
      const response = await apiPost(`anecdotes/${id}/warn`, { warn: willWarn });
      if (response.success || response.pending) {
        setIsWarned(response.warn);
      } else {
        setIsWarned(!willWarn);
        Toast.show({
          type: 'error',
          text1: 'Une erreur est survenue...',
          text2: response.message,
        });
      }
    } catch (error: any) {
      setIsWarned(!isWarned);
      if (error.message === 'NoRefreshTokenError' || error.JWT_ERROR) {
        setUser(null);
      } else {
        setError(error.message);
      }
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      'Confirmation',
      'Êtes-vous sûr de vouloir supprimer cette anecdote ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await apiDelete(`anecdotes/${id}`);
              if (response.success) {
                Toast.show({
                  type: 'success',
                  text1: 'Anecdote supprimée avec succès !',
                  text2: response.message,
                });
                refresh();
              } else if (response.pending) {
                Toast.show({
                  type: 'info',
                  text1: 'Requête sauvegardée',
                  text2: response.message,
                });
              } else {
                Toast.show({
                  type: 'error',
                  text1: 'Une erreur est survenue...',
                  text2: response.message,
                });
              }
            } catch (error: any) {
              if (error.message === 'NoRefreshTokenError' || error.JWT_ERROR) {
                setUser(null);
              } else {
                setError(error.message);
              }
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.anecdoteContainer}>
      <View style={styles.contentContainer}>
        <Text style={styles.anecdoteText}>{text}</Text>
        <Text style={styles.roomText}>
          Chambre : {typeof room === 'string' ? room : room?.name || room?.roomNumber || 'Inconnue'}
        </Text>
      </View>
      <View style={styles.actionsContainer}>
        <TouchableOpacity onPress={handleLike} style={styles.actionButton}>
          <Heart
            size={18}
            color={isLiked ? '#FF1D7C' : '#000000'}
            fill={isLiked ? '#FF1D7C' : 'white'}
          />
          <Text style={styles.likeButtonText}>{dynamicNbLikes}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleWarning} style={[styles.actionButton, styles.warnButton]}>
          <TriangleAlert
            size={18}
            color={isWarned ? '#E3A300' : '#000000'}
          />
        </TouchableOpacity>
        {user?.id === authorId && (
          <TouchableOpacity
            onPress={handleDelete}
            style={[styles.actionButton, styles.deleteButton]}
          >
            <Text style={styles.deleteButtonText}>Supprimer</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  actionButton: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    elevation: 3,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  actionsContainer: {
    alignItems: 'center',
    bottom: '-20%',
    flexDirection: 'row',
    gap: 7,
    justifyContent: 'flex-start',
    position: 'absolute',
    width: '100%',
  },
  anecdoteContainer: {
    alignItems: 'flex-start',
    backgroundColor: '#F8F8F8',
    borderColor: '#EAEAEA',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'column',
    gap: 8,
    justifyContent: 'flex-start',
    padding: 14,
    position: 'relative',
    width: '100%',
  },
  anecdoteText: {
    color: Colors.primaryBorder,
    ...TextStyles.body,
  },

  contentContainer: {
    alignItems: 'flex-start',
    alignSelf: 'stretch',
    flexDirection: 'column',
    gap: 20,
    justifyContent: 'flex-start',
  },
  deleteButton: {
    backgroundColor: Colors.primary,
  },
  deleteButtonText: {
    color: Colors.white,
    ...TextStyles.body,
    fontWeight: '600',
  },
  likeButtonText: {
    color: 'black',
    ...TextStyles.body,
  },
  roomText: {
    alignSelf: 'stretch',
    color: Colors.muted,
    textAlign: 'right',
    ...TextStyles.small,
    fontStyle: 'italic',
  },
  warnButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
  },
});
