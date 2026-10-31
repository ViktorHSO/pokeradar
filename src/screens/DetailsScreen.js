import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import axios from 'axios';
import { getPokemon, MAX_POKEMON_ID } from '../services/pokeapi';
import { formatName, formatNumber } from '../utils/format';
import { COLORS, getType } from '../theme';
import TypeBadge from '../components/TypeBadge';
import StatBar from '../components/StatBar';

export default function DetailsScreen({ route, navigation }) {
  const [current, setCurrent] = useState(route.params.pokemon);
  const [pokemon, setPokemon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [shiny, setShiny] = useState(false);
  const [attempt, setAttempt] = useState(0); // muda para forçar "tentar de novo"
  const appear = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Cancela a requisição se o usuário sair da tela ou trocar de Pokémon antes de terminar
    const controller = new AbortController();

    setLoading(true);
    setError('');
    setShiny(false);
    appear.setValue(0);

    getPokemon(current, { signal: controller.signal })
      .then((data) => {
        setPokemon(data);
        Animated.spring(appear, { toValue: 1, friction: 7, useNativeDriver: true }).start();
      })
      .catch((err) => {
        if (axios.isCancel(err)) return;
        setPokemon(null);
        setError(
          err.response?.status === 404
            ? `Não encontramos "${current}". Confira o nome ou número.`
            : 'Não foi possível conectar à PokéAPI. Verifique sua internet.'
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [current, attempt]);

  const color = pokemon ? getType(pokemon.types[0]).color : COLORS.accent;
  const image = shiny && pokemon?.shinyImage ? pokemon.shinyImage : pokemon?.image;
  const canGoPrev = pokemon && pokemon.id > 1 && pokemon.id <= MAX_POKEMON_ID;
  const canGoNext = pokemon && pokemon.id < MAX_POKEMON_ID;
  const total = pokemon?.stats.reduce((sum, s) => sum + s.value, 0);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
            <Text style={styles.iconButtonText}>← Voltar</Text>
          </TouchableOpacity>
          {pokemon && <Text style={styles.number}>{formatNumber(pokemon.id)}</Text>}
        </View>

        {loading && (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={COLORS.accent} />
            <Text style={styles.loadingText}>Carregando...</Text>
          </View>
        )}

        {!loading && error ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorEmoji}>😕</Text>
            <Text style={styles.errorText}>{error}</Text>
            <View style={styles.row}>
              <TouchableOpacity style={styles.outlineButton} onPress={() => navigation.goBack()}>
                <Text style={styles.outlineButtonText}>Nova busca</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.solidButton} onPress={() => setAttempt((n) => n + 1)}>
                <Text style={styles.solidButtonText}>Tentar de novo</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        {!loading && pokemon && (
          <Animated.View
            style={{
              opacity: appear,
              transform: [{ scale: appear.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1] }) }],
            }}
          >
            <View style={[styles.hero, { backgroundColor: color }]}>
              <Text style={styles.heroWatermark}>{formatNumber(pokemon.id)}</Text>
              {image ? (
                <Image source={{ uri: image }} style={styles.image} resizeMode="contain" />
              ) : (
                <View style={[styles.image, styles.noImage]}>
                  <Text style={styles.noImageText}>Imagem não disponível</Text>
                </View>
              )}
              {pokemon.shinyImage && (
                <TouchableOpacity
                  style={[styles.shinyToggle, shiny && styles.shinyToggleOn]}
                  onPress={() => setShiny((s) => !s)}
                >
                  <Text style={styles.shinyText}>✨ {shiny ? 'Shiny' : 'Normal'}</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.card}>
              <Text style={styles.name}>{formatName(pokemon.name)}</Text>
              <View style={[styles.row, styles.centerRow]}>
                {pokemon.types.map((type) => (
                  <TypeBadge key={type} type={type} />
                ))}
              </View>

              <View style={styles.measures}>
                <View style={styles.measure}>
                  <Text style={styles.measureValue}>{pokemon.height.toFixed(1)} m</Text>
                  <Text style={styles.measureLabel}>Altura</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.measure}>
                  <Text style={styles.measureValue}>{pokemon.weight.toFixed(1)} kg</Text>
                  <Text style={styles.measureLabel}>Peso</Text>
                </View>
              </View>

              <Text style={styles.sectionTitle}>Atributos base</Text>
              {pokemon.stats.map((stat) => (
                <StatBar key={stat.name} name={stat.name} value={stat.value} color={color} />
              ))}
              <Text style={styles.total}>Total: {total}</Text>

              <Text style={styles.sectionTitle}>Habilidades</Text>
              <View style={styles.row}>
                {pokemon.abilities.map((ability) => (
                  <View key={ability.name} style={[styles.ability, { borderColor: color }]}>
                    <Text style={styles.abilityText}>
                      {formatName(ability.name)}
                      {ability.hidden ? ' (oculta)' : ''}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.pager}>
              <TouchableOpacity
                style={[styles.pagerButton, !canGoPrev && styles.disabled]}
                disabled={!canGoPrev}
                onPress={() => setCurrent(pokemon.id - 1)}
              >
                <Text style={styles.pagerText}>‹ Anterior</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.pagerButton, !canGoNext && styles.disabled]}
                disabled={!canGoNext}
                onPress={() => setCurrent(pokemon.id + 1)}
              >
                <Text style={styles.pagerText}>Próximo ›</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  content: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 12,
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconButton: { paddingVertical: 8 },
  iconButtonText: { color: COLORS.accent, fontSize: 16, fontWeight: '700' },
  number: { color: COLORS.textOnDark, opacity: 0.7, fontSize: 18, fontWeight: '800' },
  center: { alignItems: 'center', paddingVertical: 80 },
  loadingText: { marginTop: 14, color: COLORS.textOnDark, fontSize: 16 },
  errorCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  errorEmoji: { fontSize: 44, marginBottom: 8 },
  errorText: { color: COLORS.text, fontSize: 15, textAlign: 'center', marginBottom: 18, lineHeight: 22 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  centerRow: { justifyContent: 'center', marginBottom: 20 },
  outlineButton: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.accent,
  },
  outlineButtonText: { color: COLORS.accent, fontWeight: '700' },
  solidButton: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
    backgroundColor: COLORS.accent,
  },
  solidButtonText: { color: COLORS.surface, fontWeight: '700' },
  hero: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 12,
    overflow: 'hidden',
  },
  heroWatermark: {
    position: 'absolute',
    top: 4,
    right: 14,
    fontSize: 72,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.22)',
  },
  image: { width: 220, height: 220 },
  noImage: { justifyContent: 'center', alignItems: 'center' },
  noImageText: { color: COLORS.surface },
  shinyToggle: {
    position: 'absolute',
    left: 14,
    top: 14,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  shinyToggleOn: { backgroundColor: 'rgba(0,0,0,0.45)' },
  shinyText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  card: {
    backgroundColor: COLORS.surface,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    padding: 22,
  },
  name: {
    fontSize: 30,
    fontWeight: '900',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  measures: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: 16,
    paddingVertical: 14,
    marginBottom: 24,
  },
  measure: { flex: 1, alignItems: 'center' },
  measureValue: { fontSize: 19, fontWeight: '900', color: COLORS.text },
  measureLabel: { fontSize: 12, color: COLORS.textMuted, marginTop: 4, fontWeight: '600' },
  divider: { width: 1, backgroundColor: COLORS.border },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: COLORS.text, marginBottom: 12 },
  total: {
    textAlign: 'right',
    color: COLORS.textMuted,
    fontWeight: '700',
    marginBottom: 22,
    marginTop: 2,
  },
  ability: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    backgroundColor: COLORS.surfaceAlt,
  },
  abilityText: { color: COLORS.text, fontSize: 13, fontWeight: '700' },
  pager: { flexDirection: 'row', gap: 12, marginTop: 16 },
  pagerButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  pagerText: { color: COLORS.textOnDark, fontWeight: '800', fontSize: 15 },
  disabled: { opacity: 0.3 },
});
