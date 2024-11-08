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
        height: "10%",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: Colors.darkBlue,
      }}
    >
      <View
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          paddingTop: 10,
          backgroundColor: Colors.white,
          shadowColor: 'black',
          shadowOffset: {width: 3, height: 3},
          shadowRadius: 10,
          shadowOpacity: 0.2
        }}
      >
        <Text
          style={{
            fontSize: 40,
            textAlign: "center",
            maxWidth: "90%",
            color: Colors.darkBlue,
            fontFamily: Fonts.Title.Bold,
          }}
        >
          {text}
        </Text>
      </View>
    </View>
  );
}