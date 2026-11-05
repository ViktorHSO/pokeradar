import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { getType } from '../theme';

// variant "solid": fundo da cor do tipo (padrão)
// variant "glass": fundo translúcido, para usar em cima de um card já colorido
export default function TypeBadge({ type, small = false, variant = 'solid' }) {
  const { label, color } = getType(type);
  return (
    <View
      style={[
        styles.badge,
        small && styles.small,
        { backgroundColor: variant === 'glass' ? 'rgba(255,255,255,0.28)' : color },
      ]}
    >
      <Text style={[styles.text, small && styles.smallText]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  small: { paddingVertical: 3, paddingHorizontal: 10 },
  text: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    textShadowColor: 'rgba(0,0,0,0.25)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  smallText: { fontSize: 11, fontWeight: '700' },
});
