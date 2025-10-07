import React, { useState, useEffect } from 'react';
import { Text, View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Colors, Fonts, TextStyles, loadFonts } from '@/constants/GraphSettings';
import { GanttChart, Bell, RotateCcw } from 'lucide-react-native';
import { useNavigation, DrawerActions } from '@react-navigation/native';
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

  const handleMenuPress = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.leftContainer}>
        <TouchableOpacity onPress={handleMenuPress} style={styles.menuButton}>
          <GanttChart size={24} color={Colors.primaryBorder} />
        </TouchableOpacity>
        <View style={styles.textContainer}>
          <Text style={styles.nameText} numberOfLines={1}>
            {user?.name} {user?.lastName}
          </Text>
          <Text style={styles.roomText}>
            {`Chambre ${user?.roomName || 'Non attribuée'}`}
          </Text>
        </View>
      </View>
      {refreshFunction === null ? null :
        <TouchableOpacity
          style={{
            position: 'absolute',
            //top: Platform.OS === 'ios' ? 60 : 20,
            top: 60,
            right: 70,
            width: 40,
            height: 40,
            borderRadius: 8,
            borderWidth: 1,
            opacity: disableRefresh ? 0.4 : 1,
            borderColor: Colors.muted,
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onPress={refreshFunction}
          disabled={disableRefresh}
        >
          <RotateCcw size={20} color={Colors.primaryBorder} />
        </TouchableOpacity>
      }
      <TouchableOpacity style={styles.bellButton} onPress={() => setIsPopupVisible(true)}>
        <Bell size={20} color={Colors.primaryBorder} />
      </TouchableOpacity>
      <NotificationPopup visible={isPopupVisible} onClose={() => setIsPopupVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: Colors.white,
    //paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingTop: 50,
    paddingBottom: 20,
    paddingLeft: 20,
    paddingRight: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
  },
  leftContainer: {
    justifyContent: 'flex-start',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 13,
    marginTop: 2,
    flex: 1,
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
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
    ...TextStyles.bodyBold,
    color: Colors.primaryBorder,
  },
  roomText: {
    ...TextStyles.small,
    color: Colors.muted,
  },
  bellButton: {
    position: 'absolute',
    //top: Platform.OS === 'ios' ? 60 : 20,
    top: 60,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.muted,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
