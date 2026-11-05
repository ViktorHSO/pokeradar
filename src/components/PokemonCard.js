import React, { memo, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { artworkUrl, spriteUrl } from '../services/pokeapi';
import { formatName, formatNumber } from '../utils/format';
import { COLORS, getType } from '../theme';
import TypeBadge from './TypeBadge';
import Pokeball from './Pokeball';

// Card da grade da tela inicial, com a cor do tipo principal
function PokemonCard({ pokemon, favorite, onPress }) {
  const [useSprite, setUseSprite] = useState(false);
  const color = pokemon.types[0] ? getType(pokemon.types[0]).color : COLORS.backgroundAlt;

  return (
    <Pressable
      onPress={() => onPress(pokemon.id)}
      style={({ pressed }) => [styles.card, { backgroundColor: color }, pressed && styles.pressed]}
    >
      <Pokeball size={110} style={styles.watermark} />
      <Text style={styles.number}>{formatNumber(pokemon.id)}</Text>
      {favorite && <Text style={styles.heart}>♥</Text>}

      <Text style={styles.name} numberOfLines={1}>
        {formatName(pokemon.name)}
      </Text>
      <View style={styles.types}>
        {pokemon.types.map((type) => (
          <TypeBadge key={type} type={type} small variant="glass" />
        ))}
      </View>

      <Image
        // Se a arte oficial falhar, tenta o sprite pequeno
        source={{ uri: useSprite ? spriteUrl(pokemon.id) : artworkUrl(pokemon.id) }}
        onError={() => setUseSprite(true)}
        style={styles.image}
        resizeMode="contain"
      />
    </Pressable>
  );
}

export default memo(PokemonCard);

const styles = StyleSheet.create({
  card: {
    height: 128,
    borderRadius: 20,
    padding: 14,
    overflow: 'hidden',
  },
  pressed: { opacity: 0.85, transform: [{ scale: 0.97 }] },
  watermark: { position: 'absolute', right: -18, bottom: -18 },
  number: {
    position: 'absolute',
    top: 10,
    right: 14,
    color: 'rgba(0,0,0,0.22)',
    fontSize: 14,
    fontWeight: '900',
  },
  heart: { position: 'absolute', top: 30, right: 14, color: '#FFFFFF', fontSize: 14 },
  name: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 8,
    marginRight: 44,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  types: { gap: 5 },
  image: { position: 'absolute', right: 4, bottom: 4, width: 84, height: 84 },
});
