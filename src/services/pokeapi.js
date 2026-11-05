import axios from 'axios';
import { TYPE_NAMES } from '../theme';

const api = axios.create({
  baseURL: 'https://pokeapi.co/api/v2',
  timeout: 15000,
});

// Total de Pokémon da Pokédex Nacional (usado no "aleatório" e no anterior/próximo)
export const MAX_POKEMON_ID = 1025;

const SPRITES = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon';

// Montamos a URL da imagem pelo número, sem precisar de uma requisição por Pokémon
export const artworkUrl = (id) => `${SPRITES}/other/official-artwork/${id}.png`;
export const spriteUrl = (id) => `${SPRITES}/${id}.png`;

// "https://pokeapi.co/api/v2/pokemon/25/" -> 25
const idFromUrl = (url) => Number(url.split('/').filter(Boolean).pop());

let indexPromise = null;

// Índice com todos os Pokémon: número, nome e tipos.
// Os tipos vêm de 18 requisições (uma por tipo) em vez de 1025 (uma por Pokémon).
// Fica em cache durante o uso do app.
export function getPokemonIndex() {
  if (!indexPromise) {
    indexPromise = loadIndex().catch((err) => {
      indexPromise = null; // permite tentar de novo
      throw err;
    });
  }
  return indexPromise;
}

async function loadIndex() {
  const { data } = await api.get('/pokemon', { params: { limit: MAX_POKEMON_ID } });
  const list = data.results.map((item) => ({ id: idFromUrl(item.url), name: item.name, types: [] }));
  const byId = new Map(list.map((p) => [p.id, p]));

  // Se algum tipo falhar, o app continua: o card só fica sem a cor daquele tipo
  const responses = await Promise.allSettled(TYPE_NAMES.map((type) => api.get(`/type/${type}`)));
  responses.forEach((res, i) => {
    if (res.status !== 'fulfilled') return;
    res.value.data.pokemon.forEach(({ pokemon, slot }) => {
      const entry = byId.get(idFromUrl(pokemon.url));
      if (entry) entry.types[slot - 1] = TYPE_NAMES[i];
    });
  });

  list.forEach((p) => {
    p.types = p.types.filter(Boolean);
  });
  return list;
}

// Busca um Pokémon por nome ou número e devolve só o que o app usa
export async function getPokemon(nameOrId, { signal } = {}) {
  const key = String(nameOrId).trim().toLowerCase();
  const { data } = await api.get(`/pokemon/${encodeURIComponent(key)}`, { signal });

  const artwork = data.sprites.other?.['official-artwork'] ?? {};

  return {
    id: data.id,
    name: data.name,
    speciesUrl: data.species.url,
    // Se não houver arte oficial, usa o sprite pequeno
    image: artwork.front_default || data.sprites.front_default,
    shinyImage: artwork.front_shiny || data.sprites.front_shiny,
    height: data.height / 10, // decímetros -> metros
    weight: data.weight / 10, // hectogramas -> kg
    baseExperience: data.base_experience,
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

// Pega o texto no idioma preferido (português, se existir; senão inglês)
const pickLanguage = (entries, field) => {
  const found =
    entries.find((e) => e.language.name === 'pt-br') ||
    entries.find((e) => e.language.name === 'pt') ||
    entries.find((e) => e.language.name === 'en');
  return found ? found[field] : null;
};

// Informações da espécie: descrição, habitat, taxa de captura, gênero, cadeia de evolução...
export async function getSpecies(url, { signal } = {}) {
  const { data } = await api.get(url, { signal });

  // As descrições vêm com quebras de linha e caracteres de controle do jogo
  const description = pickLanguage(data.flavor_text_entries, 'flavor_text');

  return {
    description: description ? description.replace(/[\n\f\r­]+/g, ' ').replace(/\s+/g, ' ') : null,
    genus: pickLanguage(data.genera, 'genus'),
    habitat: data.habitat?.name ?? null,
    captureRate: data.capture_rate,
    baseHappiness: data.base_happiness,
    genderRate: data.gender_rate, // -1 = sem gênero; 0 a 8 = oitavos de fêmea
    eggGroups: data.egg_groups.map((g) => g.name),
    isLegendary: data.is_legendary,
    isMythical: data.is_mythical,
    evolutionChainUrl: data.evolution_chain?.url ?? null,
  };
}

// Transforma a árvore de evolução da API em uma lista de "setas": de -> para (com o método)
export async function getEvolutions(url, { signal } = {}) {
  const { data } = await api.get(url, { signal });
  const steps = [];

  const walk = (node) => {
    const from = { id: idFromUrl(node.species.url), name: node.species.name };
    node.evolves_to.forEach((next) => {
      steps.push({
        from,
        to: { id: idFromUrl(next.species.url), name: next.species.name },
        details: next.evolution_details[0] ?? null,
      });
      walk(next);
    });
  };
  walk(data.chain);

  return {
    first: { id: idFromUrl(data.chain.species.url), name: data.chain.species.name },
    steps,
  };
}

export const randomPokemonId = () => Math.floor(Math.random() * MAX_POKEMON_ID) + 1;
