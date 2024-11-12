import React, { useState, useEffect } from 'react';
import { Text, View } from 'react-native';
import { Colors, Fonts, loadFonts } from '@/constants/GraphSettings';
import { GanttChart, Bell } from 'lucide-react';

// @ts-ignore
export default function Header() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    const loadAsyncFonts = async () => {
      await loadFonts();
      setFontsLoaded(true);
    };
    loadAsyncFonts();
  }, []);

  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        width: '100%',
        paddingTop: 20,
        paddingBottom: 36,
        paddingLeft: 20,
        paddingRight: 20,
        justifyContent: 'space-between',
        alignItems: 'center',
        flexDirection: 'row',
      }}
    >
      <View
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'row',
          gap: 13,
        }}
      >
        <GanttChart
          size={24}
          color={Colors.black}
        />
        <View
          style={{
            width: 85,
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
            gap: 4,
          }}
        >
          <Text
            style={{
              color: Colors.black,
              fontSize: 14,
              fontFamily: Fonts.Inter.Basic,
              fontWeight: '600',
            }}
          >
            John Doe
          </Text>
          <Text
            style={{
              color: '#9D9D9D',
              fontSize: 12,
              fontFamily: Fonts.Inter.Basic,
              fontWeight: '600',
            }}
          >
            Chambre 112
          </Text>
        </View>
      </View>
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: '#EAEAEA',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Bell
          size={20}
          color={Colors.black}
        />
      </View>
    </View>
  );
}