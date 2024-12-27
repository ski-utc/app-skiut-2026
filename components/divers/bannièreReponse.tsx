import { Animated, Text } from 'react-native';
import React, { useEffect, useRef } from 'react';
import {Colors, Fonts} from '../../constants/GraphSettings';

//@ts-ignore
export default function Banner({ message, success, show }) {
  const translateY = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    if (show) {
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [show]);

  if (!message) return null;

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: success ? 'green' : 'red',
        padding: 32,
        paddingBottom:0,
        transform: [{ translateY }],
        zIndex: 1,
      }}
    >
      <Text style={{
        color: Colors.black,
        fontSize: 16,
        fontFamily: Fonts.Inter.Basic,
        fontWeight: '600',
        padding: 12,
        textAlign: 'center',
      }}>
        {message}
      </Text>
    </Animated.View>
  );
}
