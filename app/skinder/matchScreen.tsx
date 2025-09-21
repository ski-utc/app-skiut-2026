import React, { useState } from 'react';
import { View, Image, Text, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Colors, Fonts } from '@/constants/GraphSettings';
import Header from '@/components/header';
import BoutonRetour from '@/components/divers/boutonRetour';

//@ts-ignore
export default function MatchScreen() {
    const navigation = useNavigation();
    const route = useRoute();

    const { myImage, roomImage, roomNumber, roomResp } = route.params || {};

    const [myRoomImage, setMyRoomImage] = useState(myImage);
    const [otherRoomImage, setOtherRoomImage] = useState(roomImage);

    if (!myImage || !roomImage || !roomNumber) {
        navigation.goBack();
        return null;
    }

    return (        
    <View
        style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
        }}
    >
        <Header />
        <View
            style={{
                width: '100%',
                backgroundColor: Colors.white,
                flex: 1,
                paddingHorizontal: 20,
                paddingBottom: 16,
            }}
        >
            <BoutonRetour previousRoute={'profilNavigator'} title={'Skinder'} />
            <View
                style={{
                    flex: 1,
                    flexDirection: 'column',
                    justifyContent: 'center',
                    gap:32,
                    alignItems: 'center',
                    alignSelf: 'center',
                    width: '100%',
                }}
            >
                <Text 
                    style={{
                        fontSize: 24,
                        fontFamily: Fonts.Text.Bold,
                        color: Colors.black,
                    }}
                >
                    🎉 It's a Match! 🎉
                </Text>
                <View
                    style={{
                        flexDirection: 'row',
                        justifyContent: 'space-around',
                        alignItems: 'center',
                        width: '100%',
                    }}
                >
                    <Image
                        source={{ uri: `${myRoomImage}?timestamp=${new Date().getTime()}` }} 
                        style={{ width: '45%', aspectRatio: '1/1', borderRadius: 100 }}
                        resizeMode="cover"
                        onError={()=>setMyRoomImage("https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png")}
                    /> 
                    <Image
                        source={{ uri: otherRoomImage }}
                        style={{ width: '45%', aspectRatio: '1/1', borderRadius: 100 }}
                        resizeMode="cover"
                        onError={()=>setOtherRoomImage("https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png")}
                    /> 
                </View>
                <View
                    style={{
                        backgroundColor: '#F8F8F8',
                        borderColor: Colors.gray,
                        borderWidth: 1,
                        borderRadius: 12,
                        padding: 14,
                        width: '85%',
                        justifyContent: 'flex-start',
                        alignContent: 'center',
                    }}
                >
                    <Text
                        style={{
                            fontSize: 18,
                            fontFamily: Fonts.Text.Bold,
                            color: Colors.black,
                        }}
                    >
                        Allez toquer à la chambre {roomNumber}{roomResp ? ` (ou contactez ${roomResp}) pour vous rencontrer en vrai !` : ' pour vous rencontrer en vrai !'}
                    </Text>
                </View>
                <TouchableOpacity
                  onPress={()=>navigation.goBack()}
                  style={{
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      backgroundColor: Colors.orange,
                      borderRadius: 8,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
              >
                  <Text
                      style={{
                          color: Colors.white,
                          fontSize: 18,
                          fontWeight: '600',
                      }}
                  >
                      Trop cool !
                  </Text>
              </TouchableOpacity>
            </View>
        </View>
    </View>
    );
}