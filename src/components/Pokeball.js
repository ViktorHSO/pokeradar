import React from 'react';
import { View } from 'react-native';

// Pokébola desenhada só com Views, usada como marca d'água atrás das imagens
export default function Pokeball({ size = 120, color = 'rgba(255,255,255,0.18)', style }) {
  const ring = size * 0.12;
  const center = size * 0.36;
  return (
    <View
      pointerEvents="none"
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: ring,
          borderColor: color,
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}
    >
      <View style={{ position: 'absolute', left: 0, right: 0, height: ring, backgroundColor: color }} />
      <View
        style={{
          width: center,
          height: center,
          borderRadius: center / 2,
          borderWidth: ring,
          borderColor: color,
          backgroundColor: 'transparent',
        }}
      />
    </View>
  );
}
