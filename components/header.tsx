import React, { useState, useEffect } from 'react';
import { Text, View, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Fonts, loadFonts } from '@/constants/GraphSettings';
import { GanttChart, Bell } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import NotificationPopup from '@/app/notificationPopUp';

export default function Header() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    const loadAsyncFonts = async () => {
      await loadFonts();
      setFontsLoaded(true);
    };
    loadAsyncFonts();
  }, []);

  const handleGanttChartPress = () => {
    navigation.navigate('ProfilNavigator', {
      screen: 'ProfilScreen',
    });
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.leftContainer}>
        <TouchableOpacity onPress={handleGanttChartPress}>
          <GanttChart size={24} color={Colors.black} />
        </TouchableOpacity>
        <View style={styles.textContainer}>
          <Text style={styles.nameText}>John Doe</Text>
          <Text style={styles.roomText}>Chambre 112</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.bellButton} onPress={() => setIsPopupVisible(true)}>
        <Bell size={20} color={Colors.black} />
      </TouchableOpacity>
      <NotificationPopup visible={isPopupVisible} onClose={() => setIsPopupVisible(false)}/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: Colors.white,
    paddingTop: 36,
    paddingBottom: 36,
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
  },
  textContainer: {
    width: 85,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    gap: 4,
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
    top: 36,
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