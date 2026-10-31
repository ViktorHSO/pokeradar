import axios from 'axios';

const api = axios.create({
  baseURL: 'https://pokeapi.co/api/v2',
  timeout: 10000,
});

let cachedNames = null;

// Lista com o nome de todos os Pokémon (para as sugestões). Fica em cache.
export async function getPokemonNames() {
  if (cachedNames) return cachedNames;
  const { data } = await api.get('/pokemon', { params: { limit: 2000 } });
  cachedNames = data.results.map((item) => item.name);
  return cachedNames;
}

// Busca um Pokémon por nome e devolve só o que o app usa
export async function getPokemon(name, { signal } = {}) {
  const key = String(name).trim().toLowerCase();
  const { data } = await api.get(`/pokemon/${encodeURIComponent(key)}`, { signal });

  return {
    name: data.name,
    image: data.sprites.other?.['official-artwork']?.front_default || data.sprites.front_default,
    height: data.height / 10, // decímetros -> metros
    weight: data.weight / 10, // hectogramas -> kg
    types: data.types.map((item) => item.type.name),
    abilities: data.abilities.map((item) => item.ability.name),
  };
}
