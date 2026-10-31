import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Keyboard, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { getPokemonNames } from '../services/pokeapi';
import { formatName } from '../utils/format';
import { COLORS } from '../theme';

const MAX_SUGGESTIONS = 5;

export default function HomeScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [names, setNames] = useState([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    // Animação de entrada suave
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
    ]).start();

    // Se falhar, o app continua funcionando, só sem sugestões
    getPokemonNames().then(setNames).catch(() => setNames([]));
  }, []);

  // Recalcula só quando o texto ou a lista mudam
  const suggestions = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return [];
    return names.filter((name) => name.includes(term)).slice(0, MAX_SUGGESTIONS);
  }, [query, names]);

  const openPokemon = (name) => {
    setError('');
    Keyboard.dismiss();
    navigation.navigate('Details', { pokemonName: name });
  };

  const handleSearch = () => {
    const term = query.trim().toLowerCase();
    if (!term) {
      setError('Digite o nome do Pokémon para buscar.');
      return;
    }
    openPokemon(term);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.homeHeader}>
            <Text style={styles.logo}>Pokédex</Text>
            <Text style={styles.subtitle}>Encontre qualquer Pokémon em um piscar de olhos</Text>
          </View>

          <View style={styles.gradientCard}>
            <Text style={styles.cardTitle}>Procure um Pokémon</Text>

            <TextInput
              style={styles.input}
              placeholder="Digite o nome (ex: pikachu)"
              placeholderTextColor={COLORS.textLight}
              value={query}
              autoCapitalize="none"
              autoCorrect={false}
              onChangeText={setQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />

            <TouchableOpacity style={styles.searchButton} onPress={handleSearch} activeOpacity={0.8}>
              <Text style={styles.searchButtonText}>⚡ Buscar</Text>
            </TouchableOpacity>

            {suggestions.length > 0 && (
              <View style={styles.suggestionsBox}>
                {suggestions.map((name) => (
                  <TouchableOpacity
                    key={name}
                    style={styles.suggestionItem}
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

            {error ? <Text style={styles.errorText}>❌ {error}</Text> : null}
          </View>

          <View style={styles.tipsCard}>
            <Text style={styles.tipsTitle}>💡 Dicas</Text>
            <Text style={styles.tipsText}>
              Procure por qualquer Pokémon: pikachu, charizard, mewtwo, dragonite...
            </Text>
          </View>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.primary },
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 40,
    paddingBottom: 40,
  },
  homeHeader: {
    marginBottom: 30,
  },
  logo: {
    fontSize: 48,
    fontWeight: '900',
    color: COLORS.cardBg,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.secondary,
    lineHeight: 24,
  },
  gradientCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 16,
  },
  input: {
    width: '100%',
    height: 54,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    marginBottom: 14,
    fontSize: 16,
    color: COLORS.text,
    backgroundColor: COLORS.secondary,
  },
  searchButton: {
    width: '100%',
    backgroundColor: COLORS.accent,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  searchButtonText: {
    color: COLORS.cardBg,
    fontSize: 16,
    fontWeight: '700',
  },
  suggestionsBox: {
    width: '100%',
    backgroundColor: COLORS.secondary,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 8,
    marginTop: 12,
    maxHeight: 220,
  },
  suggestionItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
  },
  suggestionText: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '500',
  },
  errorText: {
    marginTop: 16,
    color: COLORS.accent,
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  tipsCard: {
    backgroundColor: COLORS.secondary,
    borderRadius: 20,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.accent,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  tipsText: {
    fontSize: 14,
    color: COLORS.textLight,
    lineHeight: 22,
  },
});
