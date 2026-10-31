import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { COLORS, STAT_LABELS } from '../theme';

const MAX_STAT = 255; // maior valor base possível na série

export default function StatBar({ name, value, color }) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    progress.setValue(0);
    Animated.timing(progress, {
      toValue: Math.min(value / MAX_STAT, 1),
      duration: 700,
      useNativeDriver: false, // largura não é suportada pelo driver nativo
    }).start();
  }, [value]);

  const width = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.row}>
      <Text style={styles.label}>{STAT_LABELS[name] || name}</Text>
      <Text style={styles.value}>{value}</Text>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, { width, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  label: {
    width: 84,
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  value: {
    width: 36,
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'right',
    marginRight: 10,
  },
  track: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.border,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
});
