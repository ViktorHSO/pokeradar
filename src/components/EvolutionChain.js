import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { artworkUrl } from '../services/pokeapi';
import { formatName, formatNumber } from '../utils/format';
import { COLORS, ITEMS } from '../theme';

const itemName = (item) => (item ? ITEMS[item.name] || formatName(item.name) : '');

// Explica, em português, como acontece a evolução
export function describeEvolution(details) {
  if (!details) return '';
  const trigger = details.trigger?.name;
  const extras = [];
  if (details.time_of_day === 'day') extras.push('de dia');
  if (details.time_of_day === 'night') extras.push('à noite');
  if (details.gender === 1) extras.push('fêmea');
  if (details.gender === 2) extras.push('macho');
  const suffix = extras.length ? ` (${extras.join(', ')})` : '';

  if (trigger === 'level-up') {
    if (details.min_level) return `Nível ${details.min_level}${suffix}`;
    if (details.min_happiness) return `Amizade alta${suffix}`;
    if (details.min_affection) return `Afeto alto${suffix}`;
    if (details.known_move) return `Sabendo ${formatName(details.known_move.name)}${suffix}`;
    if (details.known_move_type) return `Sabendo golpe de tipo ${formatName(details.known_move_type.name)}`;
    if (details.held_item) return `Segurando ${itemName(details.held_item)}${suffix}`;
    if (details.location) return 'Subir de nível em local especial';
    return `Subir de nível${suffix}`;
  }
  if (trigger === 'use-item') return `${itemName(details.item)}${suffix}`;
  if (trigger === 'trade') {
    return details.held_item ? `Troca segurando ${itemName(details.held_item)}` : 'Troca';
  }
  return formatName(trigger || '');
}

function Node({ pokemon, current, onPress }) {
  const active = pokemon.id === current;
  return (
    <Pressable onPress={() => onPress(pokemon.id)} style={styles.node} disabled={active}>
      <View style={[styles.imageWrap, active && styles.imageWrapActive]}>
        <Image source={{ uri: artworkUrl(pokemon.id) }} style={styles.image} resizeMode="contain" />
      </View>
      <Text style={[styles.name, active && styles.nameActive]} numberOfLines={1}>
        {formatName(pokemon.name)}
      </Text>
      <Text style={styles.number}>{formatNumber(pokemon.id)}</Text>
    </Pressable>
  );
}

// Mostra cada evolução como "A → B". Funciona também para evoluções
// com vários caminhos, como a do Eevee.
export default function EvolutionChain({ chain, currentId, color, onSelect }) {
  if (!chain) return null;

  if (chain.steps.length === 0) {
    return (
      <View style={styles.single}>
        <Node pokemon={chain.first} current={currentId} onPress={onSelect} />
        <Text style={styles.empty}>Este Pokémon não evolui.</Text>
      </View>
    );
  }

  return (
    <View>
      {chain.steps.map((step) => (
        <View key={`${step.from.id}-${step.to.id}`} style={styles.step}>
          <Node pokemon={step.from} current={currentId} onPress={onSelect} />
          <View style={styles.arrow}>
            <Text style={[styles.arrowIcon, { color }]}>→</Text>
            <Text style={styles.method}>{describeEvolution(step.details)}</Text>
          </View>
          <Node pokemon={step.to} current={currentId} onPress={onSelect} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  node: { width: 96, alignItems: 'center' },
  imageWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  imageWrapActive: { borderColor: COLORS.accent },
  image: { width: 66, height: 66 },
  name: { marginTop: 6, fontSize: 13, fontWeight: '700', color: COLORS.text },
  nameActive: { color: COLORS.accent },
  number: { fontSize: 11, color: COLORS.textMuted, fontWeight: '600' },
  arrow: { flex: 1, alignItems: 'center', paddingHorizontal: 4 },
  arrowIcon: { fontSize: 26, fontWeight: '900' },
  method: { fontSize: 12, color: COLORS.textMuted, fontWeight: '700', textAlign: 'center' },
  single: { alignItems: 'center', paddingVertical: 10 },
  empty: { marginTop: 12, color: COLORS.textMuted, fontSize: 14 },
});
