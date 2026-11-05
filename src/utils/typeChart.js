// Tabela de efetividade de tipos (geração VI em diante).
// Para cada tipo de ATAQUE: contra quem é super efetivo (2x), pouco efetivo (½x) e sem efeito (0x).
const CHART = {
  normal: { double: [], half: ['rock', 'steel'], zero: ['ghost'] },
  fire: { double: ['grass', 'ice', 'bug', 'steel'], half: ['fire', 'water', 'rock', 'dragon'], zero: [] },
  water: { double: ['fire', 'ground', 'rock'], half: ['water', 'grass', 'dragon'], zero: [] },
  electric: { double: ['water', 'flying'], half: ['electric', 'grass', 'dragon'], zero: ['ground'] },
  grass: {
    double: ['water', 'ground', 'rock'],
    half: ['fire', 'grass', 'poison', 'flying', 'bug', 'dragon', 'steel'],
    zero: [],
  },
  ice: { double: ['grass', 'ground', 'flying', 'dragon'], half: ['fire', 'water', 'ice', 'steel'], zero: [] },
  fighting: {
    double: ['normal', 'ice', 'rock', 'dark', 'steel'],
    half: ['poison', 'flying', 'psychic', 'bug', 'fairy'],
    zero: ['ghost'],
  },
  poison: { double: ['grass', 'fairy'], half: ['poison', 'ground', 'rock', 'ghost'], zero: ['steel'] },
  ground: {
    double: ['fire', 'electric', 'poison', 'rock', 'steel'],
    half: ['grass', 'bug'],
    zero: ['flying'],
  },
  flying: { double: ['grass', 'fighting', 'bug'], half: ['electric', 'rock', 'steel'], zero: [] },
  psychic: { double: ['fighting', 'poison'], half: ['psychic', 'steel'], zero: ['dark'] },
  bug: {
    double: ['grass', 'psychic', 'dark'],
    half: ['fire', 'fighting', 'poison', 'flying', 'ghost', 'steel', 'fairy'],
    zero: [],
  },
  rock: { double: ['fire', 'ice', 'flying', 'bug'], half: ['fighting', 'ground', 'steel'], zero: [] },
  ghost: { double: ['psychic', 'ghost'], half: ['dark'], zero: ['normal'] },
  dragon: { double: ['dragon'], half: ['steel'], zero: ['fairy'] },
  dark: { double: ['psychic', 'ghost'], half: ['fighting', 'dark', 'fairy'], zero: [] },
  steel: { double: ['ice', 'rock', 'fairy'], half: ['fire', 'water', 'electric', 'steel'], zero: [] },
  fairy: { double: ['fighting', 'dragon', 'dark'], half: ['fire', 'poison', 'steel'], zero: [] },
};

const multiplier = (attack, defense) => {
  const row = CHART[attack];
  if (row.zero.includes(defense)) return 0;
  if (row.double.includes(defense)) return 2;
  if (row.half.includes(defense)) return 0.5;
  return 1;
};

// Recebe os tipos do Pokémon (ex.: ['fire', 'flying']) e devolve
// os tipos de ataque agrupados pelo dano que causam nele.
export function getDefenses(types) {
  const groups = { 4: [], 2: [], 0.5: [], 0.25: [], 0: [] };
  Object.keys(CHART).forEach((attack) => {
    const value = types.reduce((total, defense) => total * multiplier(attack, defense), 1);
    if (groups[value]) groups[value].push(attack);
  });
  return groups;
}
