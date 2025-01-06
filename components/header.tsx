import React, { useState, useEffect } from 'react';
import { Text, View, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Fonts, loadFonts } from '@/constants/GraphSettings';
import { GanttChart, Bell, RotateCcw } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import NotificationPopup from '@/app/notificationPopUp';
import { useUser } from '@/contexts/UserContext';
import { apiGet } from '@/constants/api/apiCalls'; // Import apiGet to fetch user data

//@ts-ignore
export default function Header({ refreshFunction, disableRefresh }) {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [roomName, setRoomName] = useState<any>(null);
  const { user } = useUser();
  const navigation = useNavigation();

  // Fetch user data and room name
  const fetchUserData = async () => {
    try {
      const response = await apiGet("getUserData"); // Adjust API endpoint if needed
      if (response.success) {
        setRoomName(response.roomName); // Set room name from response
      } else {
        console.error("Error fetching user data:", response.message);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    const loadAsyncFonts = async () => {
      await loadFonts();
      setFontsLoaded(true);
    };
    loadAsyncFonts();

    if (user) {
      fetchUserData(); // Fetch user data when user is available
    }
  }, [user]);

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
        <TouchableOpacity onPress={handleGanttChartPress}>
          <GanttChart size={24} color={Colors.black} />
        </TouchableOpacity>
        <View style={styles.textContainer}>
          <Text style={styles.nameText} numberOfLines={1}>
            {user?.name} {user?.lastName}
          </Text>
          <Text style={styles.roomText}>
          {`Chambre ${roomName || 'Non attribuée'}`}
          </Text>
        </View>
      </View>
      {refreshFunction == null ? null :
        <TouchableOpacity 
          style={{
            position: 'absolute',
            top: 40,
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
    paddingTop: 40,
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
    top: 40,
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
