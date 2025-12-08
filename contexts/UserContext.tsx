import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

export type User = {
  id: number;
  name: string;
  lastName: string;
  room: number;
  roomName: string;
  admin: boolean;
  member: boolean;
};

type UserContextProps = {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
};

const UserContext = createContext<UserContextProps | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Erreur chargement user:', error);
      }
    };
    loadUser();
  }, []);

  const saveUser = React.useCallback(async (newUser: User | null) => {
    if (newUser) {
      await AsyncStorage.setItem('user', JSON.stringify(newUser));
    } else {
      await AsyncStorage.removeItem('user');
    }
    setUser(newUser);
  }, []);

  const logout = React.useCallback(async () => {
    try {
      await saveUser(null);
      await SecureStore.deleteItemAsync('accessToken');
      await SecureStore.deleteItemAsync('refreshToken');
      await AsyncStorage.removeItem('notificationsRegistered');
    } catch (error) {
      console.error('Erreur lors du logout:', error);
    }
  }, [saveUser]);

  const contextValue = React.useMemo(
    () => ({ user, setUser: saveUser, logout }),
    [user, saveUser, logout],
  );

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
};

export const useUser = (): UserContextProps => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('UserContext Error');
  }
  return context;
};
