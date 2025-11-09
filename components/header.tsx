import React, { useState, useCallback, useEffect } from 'react';
import { Text, View, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, TextStyles } from '@/constants/GraphSettings';
import { GanttChart, Bell, RotateCcw } from 'lucide-react-native';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import NotificationPopup from '@/app/notificationPopUp';
import { useUser } from '@/contexts/UserContext';
import { apiGet } from '@/constants/api/apiCalls';

interface HeaderProps {
  refreshFunction?: (() => void) | null;
  disableRefresh?: boolean;
}

const Header: React.FC<HeaderProps> = React.memo(({ refreshFunction, disableRefresh = false }) => {
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
  const { user } = useUser();
  const navigation = useNavigation();

  const handleMenuPress = useCallback(() => {
    navigation.dispatch(DrawerActions.openDrawer());
  }, [navigation]);

  const handleBellPress = useCallback(() => {
    setIsPopupVisible(true);
  }, []);

  const handleClosePopup = useCallback(() => {
    setIsPopupVisible(false);
  }, []);

  const updateUnreadNotifications = useCallback(async () => {
    try {
      const response = await apiGet('notifications');
      if (response.success && response.data) {
        const hasUnread = response.data.some((notification: any) => notification.read === false);
        setHasUnreadNotifications(hasUnread);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications:', error);
    }
  }, []);

  useEffect(() => {
    updateUnreadNotifications();
    // const interval = setInterval(updateUnreadNotifications, 30000);
    // return () => clearInterval(interval);
  }, []);

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
      <TouchableOpacity style={styles.bellButton} onPress={handleBellPress}>
        <Bell size={20} color={Colors.primaryBorder} />
        {hasUnreadNotifications && (
          <View style={styles.notificationDot} />
        )}
      </TouchableOpacity>
      <NotificationPopup visible={isPopupVisible} onClose={handleClosePopup} />
    </View>
  );
});

Header.displayName = 'Header';

export default Header;

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
  notificationDot: {
    position: 'absolute',
    top: -2,
    left: -2,
    width: 14,
    height: 14,
    borderRadius: 32,
    backgroundColor: Colors.error,
    borderWidth: 2,
    borderColor: Colors.white,
  },
});
