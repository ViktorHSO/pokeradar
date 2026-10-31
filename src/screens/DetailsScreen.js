import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import axios from 'axios';
import { getPokemon } from '../services/pokeapi';
import { formatName } from '../utils/format';
import { COLORS } from '../theme';

export default function DetailsScreen({ route, navigation }) {
  const { pokemonName } = route.params;
  const [pokemon, setPokemon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0); // muda para forçar "tentar de novo"
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Animação de entrada com fade e scale
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    // Cancela a requisição se o usuário sair da tela antes de terminar
    const controller = new AbortController();

    setLoading(true);
    setError('');

    getPokemon(pokemonName, { signal: controller.signal })
      .then(setPokemon)
      .catch((err) => {
        if (axios.isCancel(err)) return;
        setPokemon(null);
        setError(
          err.response?.status === 404
            ? 'Pokémon não encontrado. Verifique o nome e tente novamente.'
            : 'Não foi possível conectar à PokéAPI. Verifique sua internet.'
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [pokemonName, attempt]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <Animated.View style={[styles.detailContainer, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.detailHeader}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Text style={styles.backButtonText}>← Voltar</Text>
            </TouchableOpacity>
            <Text style={styles.detailTitle}>{formatName(pokemonName)}</Text>
          </View>

          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.accent} />
              <Text style={styles.loadingText}>Carregando...</Text>
            </View>
          )}

          {!loading && error ? (
            <View style={styles.errorCard}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={() => setAttempt((n) => n + 1)}>
                <Text style={styles.retryButtonText}>Tentar Novamente</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {pokemon && !loading && (
            <View style={styles.pokemonCard}>
              <View style={styles.imageContainer}>
                {pokemon.image ? (
                  <Image source={{ uri: pokemon.image }} style={styles.pokemonImage} />
                ) : (
                  <View style={styles.noImageBox}>
                    <Text style={styles.noImageText}>Imagem não disponível</Text>
                  </View>
                )}
              </View>

              <Text style={styles.pokemonName}>{formatName(pokemon.name)}</Text>

              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Altura</Text>
                  <Text style={styles.statValue}>{pokemon.height.toFixed(1)}m</Text>
                </View>
                <View style={[styles.statBox, styles.statBoxCenter]}>
                  <Text style={styles.statLabel}>Peso</Text>
                  <Text style={styles.statValue}>{pokemon.weight.toFixed(1)}kg</Text>
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Tipos</Text>
                <View style={styles.badgeRow}>
                  {pokemon.types.map((type) => (
                    <View key={type} style={[styles.badge, styles.typeBadge]}>
                      <Text style={styles.badgeText}>{formatName(type)}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Habilidades</Text>
                <View style={styles.badgeRow}>
                  {pokemon.abilities.map((ability) => (
                    <View key={ability} style={[styles.badge, styles.abilityBadge]}>
                      <Text style={styles.badgeText}>{formatName(ability)}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <TouchableOpacity
                style={styles.newSearchButton}
                onPress={() => navigation.goBack()}
                activeOpacity={0.8}
              >
                <Text style={styles.newSearchButtonText}>🔍 Buscar Outro</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.primary },
  detailContainer: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 40,
    paddingBottom: 40,
  },
  errorText: {
    marginTop: 16,
    color: COLORS.accent,
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    paddingVertical: 10,
    paddingHorizontal: 0,
  },
  backButtonText: {
    color: COLORS.accent,
    fontSize: 16,
    fontWeight: '600',
  },
  detailTitle: {
    flex: 1,
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.cardBg,
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    color: COLORS.secondary,
    fontSize: 16,
  },
  errorCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.accent,
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: COLORS.accent,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  retryButtonText: {
    color: COLORS.cardBg,
    fontWeight: '600',
  },
  pokemonCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 24,
    padding: 24,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: COLORS.secondary,
    borderRadius: 20,
    paddingVertical: 30,
  },
  pokemonImage: {
    width: 240,
    height: 240,
    resizeMode: 'contain',
  },
  noImageBox: {
    width: 240,
    height: 240,
    borderRadius: 18,
    backgroundColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageText: {
    color: COLORS.textLight,
    fontSize: 14,
  },
  pokemonName: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: COLORS.secondary,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.accent,
  },
  statBoxCenter: {
    borderLeftColor: COLORS.success,
  },
  statLabel: {
    color: COLORS.textLight,
    fontSize: 13,
    marginBottom: 6,
    fontWeight: '600',
  },
  statValue: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '900',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  badge: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    marginBottom: 8,
  },
  typeBadge: {
    backgroundColor: '#FFE5E5',
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  abilityBadge: {
    backgroundColor: '#E8F5FF',
    borderWidth: 1,
    borderColor: '#2E7FFF',
  },
  badgeText: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '700',
  },
  newSearchButton: {
    width: '100%',
    backgroundColor: COLORS.accent,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  newSearchButtonText: {
    color: COLORS.cardBg,
    fontSize: 16,
    fontWeight: '700',
  },
});
