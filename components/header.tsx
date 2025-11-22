import React, { useState, useCallback, useEffect, memo } from 'react';
import { Text, View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { GanttChart, Bell, RotateCcw } from 'lucide-react-native';
import { NavigationProp, useNavigation, DrawerActions } from '@react-navigation/native';

import { Colors, TextStyles } from '@/constants/GraphSettings';
import NotificationPopup from '@/app/notificationPopUp';
import { useUser } from '@/contexts/UserContext';
import { apiGet } from '@/constants/api/apiCalls';

type HeaderStackParamList = {
  homeScreen: undefined;
  planningScreen: undefined;
  defisScreen: undefined;
  anecdotesScreen: undefined;
  profilScreen: undefined;
}

type HeaderProps = {
  refreshFunction?: (() => void) | null;
  disableRefresh?: boolean;
}

const Header: React.FC<HeaderProps> = memo(({ refreshFunction, disableRefresh = false }) => {
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
  const { user } = useUser();
  const navigation = useNavigation<NavigationProp<HeaderStackParamList>>();

  const activeOpacity = 1;
  const inactiveOpacity = 0.4;

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
  }, [updateUnreadNotifications]);

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
          style={[styles.refreshButton, { opacity: disableRefresh ? inactiveOpacity : activeOpacity }]}
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
  bellButton: {
    alignItems: 'center',
    borderColor: Colors.muted,
    borderRadius: 8,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    position: 'absolute',
    right: 20,
    top: Platform.OS === 'ios' ? 60 : 40,
    width: 40,
  },
  container: {
    alignItems: 'center',
    backgroundColor: Colors.white,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 20,
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    width: '100%',
  },
  leftContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    flex: 1,
    gap: 13,
    justifyContent: 'flex-start',
    marginTop: 2,
  },
  menuButton: {
    alignItems: 'center',
    borderRadius: 8,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  nameText: {
    ...TextStyles.bodyBold,
    color: Colors.primaryBorder,
  },
  notificationDot: {
    backgroundColor: Colors.error,
    borderColor: Colors.white,
    borderRadius: 32,
    borderWidth: 2,
    height: 14,
    left: -2,
    position: 'absolute',
    top: -2,
    width: 14,
  },
  refreshButton: {
    alignItems: 'center',
    borderColor: Colors.muted,
    borderRadius: 8,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    position: 'absolute',
    right: 70,
    top: Platform.OS === 'ios' ? 60 : 40,
    width: 40,
  },
  roomText: {
    ...TextStyles.small,
    color: Colors.muted,
  },
  textContainer: {
    alignItems: 'flex-start',
    flexDirection: 'column',
    gap: 4,
    justifyContent: 'flex-start',
    marginTop: 0,
    width: 'auto',
  },
});
