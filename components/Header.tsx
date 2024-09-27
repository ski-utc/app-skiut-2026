import React, { useState, useEffect } from 'react';
import { Text, View } from 'react-native';
import { Colors, Fonts, loadFonts } from '@/constants/GraphSettings';

// @ts-ignore
export default function Header({ text }) {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    const loadAsyncFonts = async () => {
      await loadFonts();
      setFontsLoaded(true);
    };
    loadAsyncFonts();
  }, []);

  return (  // Il faudra créer un autre component avec une croix en haut à droite pour les pages qui se stackent
    <View
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        height: "10%",
        paddingTop: 10,
        backgroundColor: Colors.darkBlue,
      }}
    >
      <Text
        style={{
          fontSize: 32,
          textAlign: "center",
          maxWidth: "90%",
          color: Colors.white,
          fontFamily: Fonts.Title.Bold,
        }}
      >
        {text}
      </Text>
    </View>
  );
}






