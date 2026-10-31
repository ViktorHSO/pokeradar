import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { getType } from '../theme';

export default function TypeBadge({ type }) {
  const { label, color } = getType(type);
  return (
    <View style={[styles.badge, { backgroundColor: color }]}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 999,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    textShadowColor: 'rgba(0,0,0,0.25)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
