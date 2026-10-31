import axios from 'axios';

const api = axios.create({
  baseURL: 'https://pokeapi.co/api/v2',
  timeout: 10000,
});

// Total de Pokémon da Pokédex Nacional (usado no "aleatório" e no anterior/próximo)
export const MAX_POKEMON_ID = 1025;

let cachedNames = null;

// Lista com o nome de todos os Pokémon (para as sugestões). Fica em cache.
export async function getPokemonNames() {
  if (cachedNames) return cachedNames;
  const { data } = await api.get('/pokemon', { params: { limit: 2000 } });
  cachedNames = data.results.map((item) => item.name);
  return cachedNames;
}

// Busca um Pokémon por nome ou número e devolve só o que o app usa
export async function getPokemon(nameOrId, { signal } = {}) {
  const key = String(nameOrId).trim().toLowerCase();
  const { data } = await api.get(`/pokemon/${encodeURIComponent(key)}`, { signal });

  const artwork = data.sprites.other?.['official-artwork'] ?? {};

  return {
    id: data.id,
    name: data.name,
    image: artwork.front_default || data.sprites.front_default,
    shinyImage: artwork.front_shiny || data.sprites.front_shiny,
    height: data.height / 10, // decímetros -> metros
    weight: data.weight / 10, // hectogramas -> kg
    types: data.types.map((item) => item.type.name),
    abilities: data.abilities.map((item) => ({
      name: item.ability.name,
      hidden: item.is_hidden,
    })),
    stats: data.stats.map((item) => ({
      name: item.stat.name,
      value: item.base_stat,
    })),
  };
}

export const randomPokemonId = () => Math.floor(Math.random() * MAX_POKEMON_ID) + 1;
