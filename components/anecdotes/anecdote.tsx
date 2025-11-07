import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Colors, TextStyles } from '@/constants/GraphSettings';
import { Heart, TriangleAlert } from 'lucide-react-native';
import { apiPost, apiDelete } from '@/constants/api/apiCalls';
import { useUser } from '@/contexts/UserContext';
import Toast from 'react-native-toast-message';

// @ts-ignore
export default function Anecdote({ id, text, room, nbLikes, liked, warned, authorId, refresh, setError }) {
  const [isLiked, setIsLiked] = useState(liked);
  const [dynamicNbLikes, setDynamicNbLikes] = useState(nbLikes);
  const [isWarned, setIsWarned] = useState(warned);

  const { setUser, user } = useUser();

  const handleLike = async () => {
    try {
      const response = await apiPost(`anecdotes/${id}/like`, { 'like': !isLiked });
      if (response.success) {
        setIsLiked(response.liked);
        const updateLike = (response.liked) ? 1 : -1;
        setDynamicNbLikes(dynamicNbLikes + updateLike);
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
  };

  const handleWarning = async () => {
    try {
      const response = await apiPost(`anecdotes/${id}/warn`, { 'warn': !isWarned });
      if (response.success) {
        setIsWarned(response.warn);
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
  };

  const handleDelete = async () => {
    Alert.alert(
      'Confirmation',
      'Êtes-vous sûr de vouloir supprimer cette anecdote ?',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
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
    <View
      style={{
        width: '100%',
        padding: 14,
        backgroundColor: '#F8F8F8',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#EAEAEA',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        gap: 8,
      }}
    >
      <View
        style={{
          alignSelf: 'stretch',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
          gap: 20,
        }}
      >
        <Text
          style={{
            color: Colors.primaryBorder,
            ...TextStyles.body,
          }}
        >
          {text}
        </Text>

        <Text
          style={{
            alignSelf: 'stretch',
            textAlign: 'right',
            color: Colors.muted,
            ...TextStyles.small,
            fontStyle: 'italic',
          }}
        >
          Chambre : {room}
        </Text>
      </View>
      <View
        style={{
          position: 'absolute',
          bottom: '-20%',
          width: '100%',
          justifyContent: 'flex-start',
          alignItems: 'center',
          gap: 7,
          flexDirection: 'row',
        }}
      >
        <TouchableOpacity
          onPress={() => handleLike()}
          style={{
            paddingLeft: 10,
            paddingRight: 10,
            paddingTop: 8,
            paddingBottom: 8,
            backgroundColor: 'white',
            boxShadow: '0px 3px 5px rgba(0, 0, 0, 0.1)',
            borderRadius: 8,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <Heart
            size={18}
            color={isLiked ? '#FF1D7C' : '#000000'}
            fill={isLiked ? '#FF1D7C' : 'white'}
          />
          <Text
            style={{
              color: 'black',
              ...TextStyles.body,
            }}
          >
            {dynamicNbLikes}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleWarning()}
          style={{
            width: 40,
            paddingLeft: 10,
            paddingRight: 10,
            paddingTop: 8,
            paddingBottom: 8,
            backgroundColor: 'white',
            boxShadow: '0px 3px 5px rgba(0, 0, 0, 0.1)',
            borderRadius: 8,
            justifyContent: 'center',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <TriangleAlert
            size={18}
            color={isWarned ? '#E3A300' : '#000000'}
          />
        </TouchableOpacity>
        {user?.id === authorId && (
          <TouchableOpacity
            onPress={() => handleDelete()}
            style={{
              paddingHorizontal: 10,
              paddingVertical: 8,
              backgroundColor: Colors.accent,
              borderRadius: 8,
              boxShadow: '0px 3px 5px rgba(0, 0, 0, 0.1)',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                color: Colors.white,
                ...TextStyles.body,
                fontWeight: '600',
              }}
            >
              Supprimer
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};