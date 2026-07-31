import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, type ViewStyle } from 'react-native';

interface SkeletonProps {
  className?: string;
  style?: ViewStyle;
}

export function Skeleton({ style }: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.6, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        s.skeleton,
        style,
        { opacity },
      ]}
    />
  );
}

const s = StyleSheet.create({
  skeleton: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    width: '100%',
  },
});
