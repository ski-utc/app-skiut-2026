import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string;
  name: string;
  lastName: string;
  room: string;
  location: string;
  admin: string;
}

interface UserContextProps {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextProps | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    };
    loadUser();
  }, []);

  const saveUser = async (newUser: User | null) => {
    if (newUser) {
      await AsyncStorage.setItem('user', JSON.stringify(newUser)); // Stocke dans AsyncStorage
    } else {
      await AsyncStorage.removeItem('user'); // Supprime si déconnexion
    }
    setUser(newUser); // Met à jour l'état utilisateur dans le contexte
  };

  const logout = async () => {
    await saveUser(null);
  };

  return (
    <UserContext.Provider value={{ user, setUser: saveUser, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextProps => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('UserContext Error');
  }
  return context;
};
