import React, {useState} from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Colors, Fonts } from '@/constants/GraphSettings';
import { Heart, TriangleAlert } from 'lucide-react-native';
import { apiPost } from '@/constants/api/apiCalls';

// @ts-ignore
export default function Anecdote({ id, text, room, nbLikes, liked, warned }) {
  const [isLiked, setIsLiked] = useState(liked);
  const [isWarned, setIsWarned] =useState(warned);

  const handleLike = async () => {
    try {
      const response = await apiPost('likeAnecdote', { id, liked: !isLiked });
      if (response.success) {
        setIsLiked(!isLiked);
      }
    } catch (error) {
      console.error('Erreur lors du like de l’anecdote', error);
    }
  };
  
  const handleWarning = async () => {
    try {
      const response = await apiPost('warnAnecdote', { id, warned: !isWarned });
      if (response.success) {
        setIsWarned(!isWarned);
      }
    } catch (error) {
      console.error('Erreur lors du warning de l’anecdote', error);
    }
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
              {nbLikes}
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








    {/* Rajouter le boutton supprimer ici */}








        </View>
    </View>
  );
};