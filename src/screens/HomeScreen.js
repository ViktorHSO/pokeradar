import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
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
import { getPokemonNames, randomPokemonId } from '../services/pokeapi';
import { formatName } from '../utils/format';
import { COLORS } from '../theme';

const MAX_SUGGESTIONS = 6;
const EXAMPLES = ['pikachu', 'charizard', 'gengar', 'lucario', 'eevee'];

export default function HomeScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [names, setNames] = useState([]);
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();

    // Se falhar, o app continua funcionando, só sem sugestões
    getPokemonNames().then(setNames).catch(() => setNames([]));
  }, []);

  // Recalcula só quando o texto ou a lista mudam.
  // Nomes que começam com o termo aparecem primeiro.
  const suggestions = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term || /^\d+$/.test(term)) return [];
    const starts = names.filter((n) => n.startsWith(term));
    const contains = names.filter((n) => !n.startsWith(term) && n.includes(term));
    return [...starts, ...contains].slice(0, MAX_SUGGESTIONS);
  }, [query, names]);

  const openPokemon = (nameOrId) => {
    setError('');
    Keyboard.dismiss();
    navigation.navigate('Details', { pokemon: nameOrId });
  };

  const handleSearch = () => {
    const term = query.trim().toLowerCase();
    if (!term) {
      setError('Digite um nome ou número para buscar.');
      return;
    }
    openPokemon(term);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Animated.View style={{ opacity: fade, transform: [{ translateY: slide }] }}>
          <View style={styles.header}>
            <Text style={styles.logo}>
              Poké<Text style={styles.logoAccent}>Radar</Text>
            </Text>
            <Text style={styles.subtitle}>
              Rastreie qualquer Pokémon pelo nome ou número da Pokédex.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Quem você está procurando?</Text>

            <TextInput
              style={styles.input}
              placeholder="Ex.: pikachu ou 25"
              placeholderTextColor={COLORS.textMuted}
              value={query}
              autoCapitalize="none"
              autoCorrect={false}
              onChangeText={(text) => {
                setQuery(text);
                if (error) setError('');
              }}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />

            {suggestions.length > 0 && (
              <View style={styles.suggestions}>
                {suggestions.map((name, index) => (
                  <TouchableOpacity
                    key={name}
                    style={[
                      styles.suggestionItem,
                      index === suggestions.length - 1 && styles.suggestionLast,
                    ]}
                    onPress={() => {
                      setQuery(name);
                      openPokemon(name);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.suggestionText}>{formatName(name)}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity style={styles.primaryButton} onPress={handleSearch} activeOpacity={0.8}>
              <Text style={styles.primaryButtonText}>Buscar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => openPokemon(randomPokemonId())}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryButtonText}>🎲 Surpreenda-me</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.tips}>
            <Text style={styles.tipsTitle}>Experimente</Text>
            <View style={styles.chips}>
              {EXAMPLES.map((name) => (
                <TouchableOpacity key={name} style={styles.chip} onPress={() => openPokemon(name)}>
                  <Text style={styles.chipText}>{formatName(name)}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  content: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 32,
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
  },
  header: { marginBottom: 28 },
  logo: { fontSize: 46, fontWeight: '900', color: COLORS.surface, letterSpacing: -1 },
  logoAccent: { color: COLORS.accent },
  subtitle: { fontSize: 16, color: COLORS.textOnDark, opacity: 0.8, lineHeight: 24, marginTop: 6 },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 22,
    marginBottom: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  cardTitle: { fontSize: 19, fontWeight: '800', color: COLORS.text, marginBottom: 14 },
  input: {
    height: 52,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    fontSize: 16,
    color: COLORS.text,
    backgroundColor: COLORS.surfaceAlt,
  },
  suggestions: {
    marginTop: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surfaceAlt,
    overflow: 'hidden',
  },
  suggestionItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  suggestionLast: { borderBottomWidth: 0 },
  suggestionText: { color: COLORS.text, fontSize: 15, fontWeight: '500' },
  errorText: { marginTop: 12, color: COLORS.accent, fontSize: 14, fontWeight: '600' },
  primaryButton: {
    marginTop: 16,
    backgroundColor: COLORS.accent,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },
  primaryButtonText: { color: COLORS.surface, fontSize: 16, fontWeight: '800' },
  secondaryButton: {
    marginTop: 10,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.accent,
  },
  secondaryButtonText: { color: COLORS.accent, fontSize: 15, fontWeight: '800' },
  tips: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 20,
    padding: 18,
  },
  tipsTitle: { fontSize: 14, fontWeight: '700', color: COLORS.textOnDark, marginBottom: 12, opacity: 0.8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: 'rgba(255,107,107,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,107,107,0.5)',
  },
  chipText: { color: COLORS.textOnDark, fontSize: 13, fontWeight: '600' },
});
