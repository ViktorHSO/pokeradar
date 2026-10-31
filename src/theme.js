// Paleta 60-30-10
// 60% fundo escuro · 30% superfícies claras · 10% destaque coral
export const COLORS = {
  background: '#0F1628',
  surface: '#FFFFFF',
  surfaceAlt: '#F5F5F5',
  accent: '#FF6B6B',
  text: '#1A1A2E',
  textMuted: '#6C757D',
  textOnDark: '#F5F5F5',
  border: '#E9ECEF',
};

// Cor e nome em português de cada tipo
export const TYPES = {
  normal: { label: 'Normal', color: '#A8A77A' },
  fire: { label: 'Fogo', color: '#EE8130' },
  water: { label: 'Água', color: '#6390F0' },
  electric: { label: 'Elétrico', color: '#F7D02C' },
  grass: { label: 'Planta', color: '#7AC74C' },
  ice: { label: 'Gelo', color: '#96D9D6' },
  fighting: { label: 'Lutador', color: '#C22E28' },
  poison: { label: 'Veneno', color: '#A33EA1' },
  ground: { label: 'Terra', color: '#E2BF65' },
  flying: { label: 'Voador', color: '#A98FF3' },
  psychic: { label: 'Psíquico', color: '#F95587' },
  bug: { label: 'Inseto', color: '#A6B91A' },
  rock: { label: 'Pedra', color: '#B6A136' },
  ghost: { label: 'Fantasma', color: '#735797' },
  dragon: { label: 'Dragão', color: '#6F35FC' },
  dark: { label: 'Sombrio', color: '#705746' },
  steel: { label: 'Aço', color: '#B7B7CE' },
  fairy: { label: 'Fada', color: '#D685AD' },
};

export const getType = (name) =>
  TYPES[name] || { label: name, color: COLORS.textMuted };

export const STAT_LABELS = {
  hp: 'HP',
  attack: 'Ataque',
  defense: 'Defesa',
  'special-attack': 'At. Esp.',
  'special-defense': 'Def. Esp.',
  speed: 'Velocidade',
};
