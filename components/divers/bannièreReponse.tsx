import { Animated, Text } from 'react-native';
import React, { useEffect, useRef } from 'react';

export default function Banner({ message, show }) {
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
        backgroundColor: 'green',
        padding: 16,
        transform: [{ translateY }],
        zIndex: 1,
      }}
    >
      <Text style={{ color: 'white', textAlign: 'center' }}>{message}</Text>
    </Animated.View>
  );
}
