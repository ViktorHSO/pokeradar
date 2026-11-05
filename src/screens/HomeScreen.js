import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { getPokemonIndex, randomPokemonId } from '../services/pokeapi';
import { useFavorites } from '../context/FavoritesContext';
import { COLORS, GENERATIONS, TYPE_NAMES, getType } from '../theme';
import PokemonCard from '../components/PokemonCard';
import Pokeball from '../components/Pokeball';

function Chip({ label, active, color = COLORS.accent, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[styles.chip, active && { backgroundColor: color, borderColor: color }]}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function HomeScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const [index, setIndex] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [typeFilter, setTypeFilter] = useState(null);
  const [genFilter, setGenFilter] = useState(null);
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const { ids: favoriteIds, isFavorite } = useFavorites();
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setLoading(true);
    setError('');
    getPokemonIndex()
      .then((list) => {
        setIndex(list);
        Animated.timing(fade, { toValue: 1, duration: 500, useNativeDriver: true }).start();
      })
      .catch(() => setError('Não foi possível carregar a Pokédex. Verifique sua internet.'))
      .finally(() => setLoading(false));
  }, [attempt]);

  // Aplica busca e filtros. Recalcula só quando algum deles muda.
  const results = useMemo(() => {
    const term = query.trim().toLowerCase().replace(/^#/, '');
    const gen = GENERATIONS.find((g) => g.id === genFilter);
    const isNumber = /^\d+$/.test(term);

    const filtered = index.filter((p) => {
      if (onlyFavorites && !favoriteIds.includes(p.id)) return false;
      if (typeFilter && !p.types.includes(typeFilter)) return false;
      if (gen && (p.id < gen.from || p.id > gen.to)) return false;
      if (!term) return true;
      return isNumber ? String(p.id).startsWith(String(Number(term))) : p.name.includes(term);
    });

    // Nomes que começam com o termo aparecem primeiro
    if (term && !isNumber) {
      return [
        ...filtered.filter((p) => p.name.startsWith(term)),
        ...filtered.filter((p) => !p.name.startsWith(term)),
      ];
    }
    return filtered;
  }, [index, query, typeFilter, genFilter, onlyFavorites, favoriteIds]);

  const openPokemon = useCallback(
    (nameOrId) => {
      Keyboard.dismiss();
      navigation.navigate('Details', { pokemon: nameOrId });
    },
    [navigation],
  );

  const handleSubmit = () => {
    const term = query.trim().toLowerCase().replace(/^#/, '');
    if (!term) return;
    const exact = index.find((p) => p.name === term || String(p.id) === String(Number(term)));
    if (exact) openPokemon(exact.id);
    else if (results.length === 1) openPokemon(results[0].id);
    else if (results.length === 0) openPokemon(term); // a tela de detalhes mostra o erro
  };

  const hasFilters = typeFilter || genFilter || onlyFavorites || query;
  const clearFilters = () => {
    setQuery('');
    setTypeFilter(null);
    setGenFilter(null);
    setOnlyFavorites(false);
  };

  const header = (
    <View>
      <View style={styles.header}>
        <Pokeball size={200} color="rgba(255,255,255,0.05)" style={styles.headerBall} />
        <View style={styles.headerRow}>
          <Text style={styles.logo}>
            Poké<Text style={styles.logoAccent}>Radar</Text>
          </Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={[styles.roundButton, onlyFavorites && styles.roundButtonOn]}
              onPress={() => setOnlyFavorites((v) => !v)}
              accessibilityLabel="Mostrar só favoritos"
            >
              <Text style={styles.roundButtonText}>{onlyFavorites ? '♥' : '♡'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.roundButton}
              onPress={() => openPokemon(randomPokemonId())}
              accessibilityLabel="Pokémon aleatório"
            >
              <Text style={styles.roundButtonText}>🎲</Text>
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.subtitle}>Rastreie qualquer Pokémon pelo nome ou número.</Text>

        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>⌕</Text>
          <TextInput
            style={styles.input}
            placeholder="Buscar: pikachu ou 25"
            placeholderTextColor={COLORS.textMuted}
            value={query}
            autoCapitalize="none"
            autoCorrect={false}
            onChangeText={setQuery}
            onSubmitEditing={handleSubmit}
            returnKeyType="search"
          />
          {query ? (
            <TouchableOpacity onPress={() => setQuery('')} hitSlop={10}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <Text style={styles.filterLabel}>Tipo</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        <Chip label="Todos" active={!typeFilter} onPress={() => setTypeFilter(null)} />
        {TYPE_NAMES.map((type) => (
          <Chip
            key={type}
            label={getType(type).label}
            color={getType(type).color}
            active={typeFilter === type}
            onPress={() => setTypeFilter(typeFilter === type ? null : type)}
          />
        ))}
      </ScrollView>

      <Text style={styles.filterLabel}>Geração</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        <Chip label="Todas" active={!genFilter} onPress={() => setGenFilter(null)} />
        {GENERATIONS.map((gen) => (
          <Chip
            key={gen.id}
            label={`${gen.label} · ${gen.region}`}
            active={genFilter === gen.id}
            onPress={() => setGenFilter(genFilter === gen.id ? null : gen.id)}
          />
        ))}
      </ScrollView>

      {!loading && !error && (
        <View style={styles.countRow}>
          <Text style={styles.count}>
            {results.length} Pokémon{onlyFavorites ? ' favoritos' : ''}
          </Text>
          {hasFilters ? (
            <TouchableOpacity onPress={clearFilters}>
              <Text style={styles.clearFilters}>Limpar filtros</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      )}
    </View>
  );

  const renderEmpty = () => {
    if (loading) {
      return (
        <View style={styles.state}>
          <ActivityIndicator size="large" color={COLORS.accent} />
          <Text style={styles.stateText}>Carregando a Pokédex...</Text>
        </View>
      );
    }
    if (error) {
      return (
        <View style={styles.state}>
          <Text style={styles.stateEmoji}>📡</Text>
          <Text style={styles.stateText}>{error}</Text>
          <TouchableOpacity style={styles.retry} onPress={() => setAttempt((n) => n + 1)}>
            <Text style={styles.retryText}>Tentar de novo</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <View style={styles.state}>
        <Text style={styles.stateEmoji}>{onlyFavorites ? '♡' : '🔍'}</Text>
        <Text style={styles.stateText}>
          {onlyFavorites && favoriteIds.length === 0
            ? 'Você ainda não favoritou nenhum Pokémon. Toque no coração na tela de detalhes.'
            : 'Nenhum Pokémon encontrado com esses filtros.'}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <StatusBar style="light" />
      <FlatList
        // Com número ímpar de cards, um espaço vazio mantém o último do mesmo tamanho
        data={results.length % 2 ? [...results, { id: 'vazio', empty: true }] : results}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        style={styles.list}
        contentContainerStyle={styles.content}
        columnWrapperStyle={styles.column}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        ListHeaderComponent={header}
        ListEmptyComponent={renderEmpty}
        initialNumToRender={12}
        windowSize={7}
        renderItem={({ item }) =>
          item.empty ? (
            <View style={styles.cell} />
          ) : (
            <Animated.View style={[styles.cell, { opacity: fade }]}>
              <PokemonCard pokemon={item} favorite={isFavorite(item.id)} onPress={openPokemon} />
            </Animated.View>
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  list: { width: '100%', maxWidth: 720, alignSelf: 'center' },
  content: { padding: 16, paddingBottom: 40 },
  column: { gap: 12 },
  cell: { flex: 1, marginBottom: 12 },
  header: {
    backgroundColor: COLORS.backgroundAlt,
    borderRadius: 24,
    padding: 20,
    marginBottom: 18,
    overflow: 'hidden',
  },
  headerBall: { position: 'absolute', right: -50, top: -50 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerActions: { flexDirection: 'row', gap: 8 },
  logo: { fontSize: 36, fontWeight: '900', color: COLORS.surface, letterSpacing: -1 },
  logoAccent: { color: COLORS.accent },
  subtitle: { fontSize: 15, color: COLORS.textOnDark, opacity: 0.75, marginTop: 4, marginBottom: 16 },
  roundButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roundButtonOn: { backgroundColor: COLORS.accent },
  roundButtonText: { color: '#FFFFFF', fontSize: 20 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 14,
  },
  searchIcon: { fontSize: 22, color: COLORS.textMuted, marginRight: 8 },
  input: { flex: 1, height: '100%', fontSize: 16, color: COLORS.text },
  clearIcon: { fontSize: 16, color: COLORS.textMuted, paddingHorizontal: 4 },
  filterLabel: {
    color: COLORS.textOnDark,
    opacity: 0.6,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  chips: { gap: 8, paddingBottom: 14 },
  chip: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  chipText: { color: COLORS.textOnDark, fontSize: 13, fontWeight: '600' },
  chipTextActive: { color: '#FFFFFF', fontWeight: '800' },
  countRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  count: { color: COLORS.textOnDark, fontSize: 14, fontWeight: '700', opacity: 0.8 },
  clearFilters: { color: COLORS.accent, fontSize: 14, fontWeight: '700' },
  state: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 20 },
  stateEmoji: { fontSize: 42, marginBottom: 10, color: COLORS.textOnDark },
  stateText: { color: COLORS.textOnDark, fontSize: 15, textAlign: 'center', lineHeight: 22, opacity: 0.85 },
  retry: {
    marginTop: 16,
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  retryText: { color: '#FFFFFF', fontWeight: '800' },
});
