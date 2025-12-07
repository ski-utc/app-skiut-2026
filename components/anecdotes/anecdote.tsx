import { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { Heart, TriangleAlert } from 'lucide-react-native';
import Toast from 'react-native-toast-message';

import { Colors, TextStyles } from '@/constants/GraphSettings';
import {
  apiPost,
  apiDelete,
  isSuccessResponse,
  isPendingResponse,
  handleApiErrorToast,
  AppError,
} from '@/constants/api/apiCalls';
import { useUser } from '@/contexts/UserContext';

type RoomInfo = {
  name?: string;
  roomNumber?: string;
};

type AnecdoteProps = {
  id: string;
  text: string;
  room: string | RoomInfo;
  nbLikes: number;
  liked: boolean;
  warned: boolean;
  authorId: string;
  refresh: () => void;
};

export default function Anecdote({
  id,
  text,
  room,
  nbLikes,
  liked,
  warned,
  authorId,
  refresh,
}: AnecdoteProps) {
  const [isLiked, setIsLiked] = useState(liked);
  const [dynamicNbLikes, setDynamicNbLikes] = useState(nbLikes);
  const [isWarned, setIsWarned] = useState(warned);

  const { setUser, user } = useUser();

  const handleLike = async () => {
    const previousLiked = isLiked;
    const previousCount = dynamicNbLikes;

    const willLike = !isLiked;
    const newCount = willLike
      ? previousCount + 1
      : Math.max(0, previousCount - 1);

    try {
      const response = await apiPost<{ liked?: boolean }>(
        `anecdotes/${id}/like`,
        { like: willLike },
      );

      if (isSuccessResponse(response)) {
        setIsLiked(willLike);
        setDynamicNbLikes(newCount);
      } else if (isPendingResponse(response)) {
        setIsLiked(willLike);
        setDynamicNbLikes(newCount);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Erreur',
          text2: response.message || 'Erreur lors du like',
        });
      }
    } catch (error: unknown) {
      setIsLiked(previousLiked);
      setDynamicNbLikes(previousCount);
      handleApiErrorToast(error as AppError, setUser);
    }
  };

  const handleWarning = async () => {
    const previousWarned = isWarned;
    const willWarn = !isWarned;

    try {
      const response = await apiPost<{ warn?: boolean }>(
        `anecdotes/${id}/warn`,
        { warn: willWarn },
      );

      if (isSuccessResponse(response)) {
        setIsWarned(willWarn);
        if (willWarn) {
          Toast.show({
            type: 'success',
            text1: 'Signalement pris en compte',
            text2:
              "N'hésitez pas à nous contacter si vous pensez que cette anecdote doit disparaître immédiatement",
          });
        }
      } else if (isPendingResponse(response)) {
        setIsWarned(willWarn);
        if (willWarn) {
          Toast.show({
            type: 'info',
            text1: 'Signalement sauvegardé (Hors ligne)',
          });
        }
      } else {
        Toast.show({
          type: 'error',
          text1: 'Erreur',
          text2: response.message || 'Erreur lors du signalement',
        });
      }
    } catch (error: unknown) {
      setIsWarned(previousWarned);
      handleApiErrorToast(error as AppError, setUser);
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

              if (isSuccessResponse(response)) {
                Toast.show({
                  type: 'success',
                  text1: 'Anecdote supprimée !',
                  text2: response.message,
                });
                refresh();
              } else if (isPendingResponse(response)) {
                Toast.show({
                  type: 'info',
                  text1: 'Suppression sauvegardée',
                  text2: 'Elle sera effective au retour de la connexion.',
                });
              } else {
                Toast.show({
                  type: 'error',
                  text1: 'Erreur',
                  text2: response.message,
                });
              }
            } catch (error: unknown) {
              handleApiErrorToast(error as AppError, setUser);
            }
          },
        },
      ],
      { cancelable: true },
    );
  };

  const getRoomName = () => {
    if (typeof room === 'string') return room;
    return room?.name || room?.roomNumber || 'Inconnue';
  };

  return (
    <View style={styles.anecdoteContainer}>
      <View style={styles.contentContainer}>
        <Text style={styles.anecdoteText}>{text}</Text>
        <Text style={styles.roomText}>Chambre : {getRoomName()}</Text>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          onPress={handleLike}
          style={styles.actionButton}
          activeOpacity={0.7}
        >
          <Heart
            size={18}
            color={isLiked ? '#FF1D7C' : '#000000'}
            fill={isLiked ? '#FF1D7C' : 'white'}
          />
          <Text style={styles.likeButtonText}>{dynamicNbLikes}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleWarning}
          style={[styles.actionButton, styles.warnButton]}
          activeOpacity={0.7}
        >
          <TriangleAlert size={18} color={isWarned ? '#E3A300' : '#000000'} />
        </TouchableOpacity>

        {user?.id && String(user.id) === String(authorId) && (
          <TouchableOpacity
            onPress={handleDelete}
            style={[styles.actionButton, styles.deleteButton]}
            activeOpacity={0.7}
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
