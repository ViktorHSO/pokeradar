// Paleta 60-30-10
// 60% fundo escuro · 30% superfícies claras · 10% destaque coral
export const COLORS = {
  background: '#0F1628',
  backgroundAlt: '#18213A',
  surface: '#FFFFFF',
  surfaceAlt: '#F5F5F7',
  accent: '#FF6B6B',
  text: '#1A1A2E',
  textMuted: '#6C757D',
  textOnDark: '#F5F5F5',
  border: '#E9ECEF',
  male: '#4A90E2',
  female: '#F06292',
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

export const TYPE_NAMES = Object.keys(TYPES);

export const getType = (name) => TYPES[name] || { label: name, color: COLORS.textMuted };

export const STAT_LABELS = {
  hp: 'HP',
  attack: 'Ataque',
  defense: 'Defesa',
  'special-attack': 'At. Esp.',
  'special-defense': 'Def. Esp.',
  speed: 'Velocidade',
};

// Cor da barra conforme o valor do atributo (vermelho = baixo, verde/azul = alto)
export const statColor = (value) => {
  if (value < 50) return '#F34444';
  if (value < 80) return '#FF7F0F';
  if (value < 100) return '#F2C94C';
  if (value < 130) return '#A0E515';
  if (value < 150) return '#23CD5E';
  return '#00C2B8';
};

// Faixa de números de cada geração na Pokédex Nacional
export const GENERATIONS = [
  { id: 1, label: 'I', region: 'Kanto', from: 1, to: 151 },
  { id: 2, label: 'II', region: 'Johto', from: 152, to: 251 },
  { id: 3, label: 'III', region: 'Hoenn', from: 252, to: 386 },
  { id: 4, label: 'IV', region: 'Sinnoh', from: 387, to: 493 },
  { id: 5, label: 'V', region: 'Unova', from: 494, to: 649 },
  { id: 6, label: 'VI', region: 'Kalos', from: 650, to: 721 },
  { id: 7, label: 'VII', region: 'Alola', from: 722, to: 809 },
  { id: 8, label: 'VIII', region: 'Galar', from: 810, to: 905 },
  { id: 9, label: 'IX', region: 'Paldea', from: 906, to: 1025 },
];

export const generationOf = (id) => GENERATIONS.find((g) => id >= g.from && id <= g.to);

export const HABITATS = {
  cave: 'Caverna',
  forest: 'Floresta',
  grassland: 'Campos',
  mountain: 'Montanha',
  rare: 'Raro',
  'rough-terrain': 'Terreno acidentado',
  sea: 'Mar',
  urban: 'Urbano',
  'waters-edge': 'Beira d’água',
};

export const EGG_GROUPS = {
  monster: 'Monstro',
  water1: 'Água 1',
  water2: 'Água 2',
  water3: 'Água 3',
  bug: 'Inseto',
  flying: 'Voador',
  ground: 'Campo',
  fairy: 'Fada',
  plant: 'Planta',
  humanshape: 'Humanoide',
  mineral: 'Mineral',
  indeterminate: 'Amorfo',
  ditto: 'Ditto',
  dragon: 'Dragão',
  'no-eggs': 'Não põe ovos',
};

export const ITEMS = {
  'fire-stone': 'Pedra do Fogo',
  'water-stone': 'Pedra da Água',
  'thunder-stone': 'Pedra do Trovão',
  'leaf-stone': 'Pedra da Folha',
  'moon-stone': 'Pedra da Lua',
  'sun-stone': 'Pedra do Sol',
  'shiny-stone': 'Pedra Brilhante',
  'dusk-stone': 'Pedra do Anoitecer',
  'dawn-stone': 'Pedra do Amanhecer',
  'ice-stone': 'Pedra de Gelo',
};
