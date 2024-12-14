import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import { Colors, Fonts } from "@/constants/GraphSettings"
import React from "react";
import BoutonNavigation from "@/components/divers/boutonNavigation";
import OAuthScreen from "./OAuthScreen";

export default function LoginScreen() {
    return (
        <SafeAreaView style={styles.container}>
          <OAuthScreen/>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.white,
    },
    titre: {
        color: Colors.black,
        fontSize: 32,
        fontFamily: 'Inter',
        fontWeight: '500',
        width: 348,
        height: 78,
        marginTop: 100,
        marginLeft: 32,
        marginRight: 34,
    },
    soustitre: {
        color: Colors.gray,
        fontSize: 14,
        fontFamily: 'Inter',
        fontWeight: '400',
        lineHeight: 21,
        marginTop: 12,
        marginLeft: 32,
        marginRight: 34,
    },
    flexGrow: {
        flex: 1,
    },
    boutonContainer: {
        paddingLeft: 20,
        paddingRight: 20,
        alignItems: 'center',
        paddingBottom: 16,
    }
});



/*
import React, { useState } from 'react';
import { View, TextInput, Button, Text } from 'react-native';
import { useUser } from '../contexts/UserContext';

export default function LoginScreen() {
  const { setUser } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    // Simuler une requête API
    if (email === 'test@example.com' && password === 'password') {
      const user = {
        id: '1',
        email,
        token: 'abc123',
      };
      setUser(user);
    } else {
      setError('Identifiants incorrects');
    }
  };

  return (
    <View>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} />
      <TextInput placeholder="Mot de passe" value={password} onChangeText={setPassword} secureTextEntry />
      {error ? <Text style={{ color: 'red' }}>{error}</Text> : null}
      <Button title="Se connecter" onPress={handleLogin} />
    </View>
  );
}

*/



/*
Déconnexion 
import React from 'react';
import { Button } from 'react-native';
import { useUser } from '../contexts/UserContext';

export default function HomeScreen() {
  const { logout } = useUser();

  return <Button title="Déconnexion" onPress={logout} />;
}



*/