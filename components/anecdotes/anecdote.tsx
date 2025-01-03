import React, {useState} from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Colors, Fonts } from '@/constants/GraphSettings';
import { Heart, TriangleAlert } from 'lucide-react-native';
import { apiPost } from '@/constants/api/apiCalls';
import { useUser } from '@/contexts/UserContext';

// @ts-ignore
export default function Anecdote({ id, text, room, nbLikes, liked, warned, authorId, refresh, setError, setResponseMessage, setResponseSuccess, setShowBanner }) {
  const [isLiked, setIsLiked] = useState(liked);
  const [dynamicNbLikes, setDynamicNbLikes] = useState(nbLikes);
  const [isWarned, setIsWarned] =useState(warned);

  const { setUser, user } = useUser();

  const handleLike = async () => {
    try {
      const response = await apiPost('likeAnecdote', { 'anecdoteId': id, 'like': !isLiked });
      if (response.success) {
        setIsLiked(response.liked);
        const updateLike = (response.liked) ? 1 : -1;
        setDynamicNbLikes(dynamicNbLikes+updateLike);
      } else {
        setResponseMessage(response.message);
        setResponseSuccess(false);
        setShowBanner(true);
        setTimeout(() => setShowBanner(false), 5000);
      }
    } catch (error) {
      if (error.message === 'NoRefreshTokenError' || error.JWT_ERROR) {
        setUser(null);
      } else {
        setError(error.message);
      }
    }
  };
  
  const handleWarning = async () => {
    try {
      const response = await apiPost('warnAnecdote', { 'anecdoteId': id, 'warn': !isWarned });
      if (response.success) {
        setIsWarned(response.warn);
      } else {
        setResponseMessage(response.message);
        setResponseSuccess(false);
        setShowBanner(true);
        setTimeout(() => setShowBanner(false), 5000);      }
    } catch (error) {
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
              const response = await apiPost('deleteAnecdote', { anecdoteId: id });
              if (response.success) {
                setResponseMessage('Anecdote supprimée avec succès !');
                setResponseSuccess(true);
                refresh();
              } else {
                setResponseMessage(response.message);
                setResponseSuccess(false);
              }
              setShowBanner(true);
              setTimeout(() => setShowBanner(false), 5000);
            } catch (error) {
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
          gap: 27,
        }}
      >
        <Text
          style={{
            color: 'black',
            fontSize: 12,
            fontFamily: 'Inter',
            fontWeight: '500',
          }}
        >
          {text}
        </Text>
        
        <Text
          style={{
            alignSelf: 'stretch',
            textAlign: 'right',
            color: '#737373',
            fontSize: 12,
            fontFamily: 'Inter',
            fontStyle: 'italic',
            fontWeight: '300',
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
          onPress={()=>handleLike()}
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
                fontSize: 14,
                fontFamily: Fonts.Inter.Basic,
                fontWeight: '600',
              }}
            >
              {dynamicNbLikes}
            </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={()=>handleWarning()}
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
            onPress={()=>handleDelete()}
            style={{
              paddingHorizontal: 10,
              paddingVertical: 8,
              backgroundColor: Colors.orange,
              borderRadius: 8,
              boxShadow: '0px 3px 5px rgba(0, 0, 0, 0.1)',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                color: Colors.white,
                fontSize: 14,
                fontFamily: Fonts.Inter.Basic,
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