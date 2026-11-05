import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { getDefenses } from '../utils/typeChart';
import { COLORS } from '../theme';
import TypeBadge from './TypeBadge';

const GROUPS = [
  { key: 4, title: 'Muito fraco', tag: '4x', color: '#D32F2F' },
  { key: 2, title: 'Fraco', tag: '2x', color: '#F57C00' },
  { key: 0.5, title: 'Resistente', tag: '½x', color: '#388E3C' },
  { key: 0.25, title: 'Muito resistente', tag: '¼x', color: '#1B5E20' },
  { key: 0, title: 'Imune', tag: '0x', color: '#455A64' },
];

// Mostra quais tipos de ataque causam mais ou menos dano neste Pokémon
export default function TypeDefenses({ types }) {
  const defenses = getDefenses(types);

  return (
    <View>
      <Text style={styles.hint}>Dano recebido de cada tipo de ataque.</Text>
      {GROUPS.filter((g) => defenses[g.key].length > 0).map((group) => (
        <View key={group.key} style={styles.group}>
          <View style={styles.header}>
            <View style={[styles.tag, { backgroundColor: group.color }]}>
              <Text style={styles.tagText}>{group.tag}</Text>
            </View>
            <Text style={styles.title}>{group.title}</Text>
          </View>
          <View style={styles.badges}>
            {defenses[group.key].map((type) => (
              <TypeBadge key={type} type={type} small />
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  hint: { color: COLORS.textMuted, fontSize: 13, marginBottom: 16 },
  group: { marginBottom: 18 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  tag: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, marginRight: 8 },
  tagText: { color: '#FFFFFF', fontWeight: '900', fontSize: 12 },
  title: { fontSize: 15, fontWeight: '800', color: COLORS.text },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
