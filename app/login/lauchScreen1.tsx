import React from 'react';
import { View, Text, Image, TouchableOpacity, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors, Fonts } from '@/constants/GraphSettings';

export default function LaunchScreen1() {
  const navigation = useNavigation();

  const screenHeight = Dimensions.get("window").height;
  const imageWidth = 0.4*screenHeight;

  return (
    <View style={{ flex: 1, backgroundColor: 'white'}}>
      {/* Image */}
      <Image
        source={require('../../assets/images/OursCabine.png')}
        style={{
          height: '40%',
          width: imageWidth,
          position: 'absolute',
          right: 0,
          top: 0,
        }}
      />
      <View style ={{ height: '100%', width: '100%', flexDirection: 'column', justifyContent: 'center' , alignItems: 'center' }}>
        <View style={{ height: '50%' }}/>
        <View style={{ paddingHorizontal: 24, width: '100%', flexDirection: 'column', justifyContent: 'flex-start' }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              marginBottom: 20
            }}
          >
            <View
              style={{
                width: 37.47,
                height: 13,
                backgroundColor: '#E64034',
                borderRadius: 61,
              }}
            />
            <View
              style={{
                width: 13,
                height: 13,
                backgroundColor: 'rgba(230, 64, 52, 0.20)',
                borderRadius: 61,
              }}
            />
            <View
              style={{
                width: 13,
                height: 13,
                backgroundColor: 'rgba(230, 64, 52, 0.20)',
                borderRadius: 61,
              }}
            />
          </View>
          <Text
            style={{
              fontFamily: Fonts.Title.Bold,
              fontSize: 32,
              fontWeight: '500',
              color: 'black',
              marginBottom: 16,
            }}
          >
            Bienvenue sur l’application SkiUTC
          </Text>
          <Text
            style={{
              fontFamily: Fonts.Text.Medium,
              fontSize: 16,
              fontWeight: '400',
              color: '#737373',
              lineHeight: 24,
              marginBottom: 40
            }}
          >
            Ton indispensable pour passer une semaine de folie !!
          </Text>
          <TouchableOpacity
          onPress={()=>{navigation.navigate("launchScreen2")}}
            style={{
              alignSelf: 'stretch',
              backgroundColor: '#E64034',
              paddingVertical: 15,
              borderRadius: 8,
              alignItems: 'center',
              marginBottom: 8,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: '600',
                color: 'white',
              }}
            >
              Suivant
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            disabled={true}
            style={{
              alignSelf: 'stretch',
              backgroundColor: '#F2F2F2',
              opacity: 0.2,
              paddingVertical: 15,
              borderRadius: 8,
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: '600',
                color: 'black',
              }}
            >
              Retour
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
