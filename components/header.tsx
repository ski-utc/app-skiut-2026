import React, { useState, useEffect } from 'react';
import { Text, View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Colors, Fonts, loadFonts } from '@/constants/GraphSettings';
import { GanttChart, Bell, RotateCcw } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import NotificationPopup from '@/app/notificationPopUp';
import { useUser } from '@/contexts/UserContext';

//@ts-ignore
export default function Header({ refreshFunction, disableRefresh }) {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const { user } = useUser();
  const navigation = useNavigation();

  useEffect(() => {
    const loadAsyncFonts = async () => {
      await loadFonts();
      setFontsLoaded(true);
    };
    loadAsyncFonts();
  }, []);

  const handleGanttChartPress = () => {
    navigation.navigate('profilNavigator', {
      screen: 'ProfilScreen',
    });
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.leftContainer}>
        <TouchableOpacity onPress={handleGanttChartPress} style={{flexDirection: 'row', gap:8, justifyContent:'center',alignItems:'center'}}>
          <GanttChart size={24} color={Colors.black} />
        <View style={styles.textContainer}>
          <Text style={styles.nameText} numberOfLines={1}>
            {user?.name} {user?.lastName}
          </Text>
          <Text style={styles.roomText}>
          {`Chambre ${user?.roomName || 'Non attribuée'}`}
          </Text>
        </View>
        </TouchableOpacity>
      </View>
      {refreshFunction == null ? null :
        <TouchableOpacity 
          style={{
            position: 'absolute',
            top: Platform.OS === 'ios' ? 60 : 40,
            right: 70,
            width: 40,
            height: 40,
            borderRadius: 8,
            borderWidth: 1,
            opacity: disableRefresh ? 0.4 : 1,
            borderColor: '#EAEAEA',
            justifyContent: 'center',
            alignItems: 'center',
          }} 
          onPress={refreshFunction} 
          disabled={disableRefresh}
        >
          <RotateCcw size={20} color={Colors.black} />
        </TouchableOpacity>
      }
      <TouchableOpacity style={styles.bellButton} onPress={() => setIsPopupVisible(true)}>
        <Bell size={20} color={Colors.black} />
      </TouchableOpacity>
      <NotificationPopup visible={isPopupVisible} onClose={() => setIsPopupVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: Colors.white,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20, 
    paddingLeft: 20,
    paddingRight: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
  },
  leftContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 13,
    marginTop: 2,
  },
  textContainer: {
    width: 'auto',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    gap: 4,
    marginTop: 0,
  },
  nameText: {
    color: Colors.black,
    fontSize: 14,
    fontFamily: Fonts.Inter.Basic,
    fontWeight: '600',
  },
  roomText: {
    color: '#9D9D9D',
    fontSize: 12,
    fontFamily: Fonts.Inter.Basic,
    fontWeight: '600',
  },
  bellButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
