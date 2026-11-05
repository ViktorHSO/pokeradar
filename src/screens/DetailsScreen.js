import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import axios from 'axios';
import { getEvolutions, getPokemon, getSpecies, MAX_POKEMON_ID } from '../services/pokeapi';
import { useFavorites } from '../context/FavoritesContext';
import { LANGUAGES, useLanguage } from '../context/LanguageContext';
import { DESCRIPTIONS, GENERA } from '../data/pokedexTexts';
import { formatName, formatNumber } from '../utils/format';
import { COLORS, EGG_GROUPS, HABITATS, generationOf, getType } from '../theme';
import TypeBadge from '../components/TypeBadge';
import StatBar from '../components/StatBar';
import Pokeball from '../components/Pokeball';
import EvolutionChain from '../components/EvolutionChain';
import TypeDefenses from '../components/TypeDefenses';

const TABS = [
  { key: 'about', label: 'Sobre' },
  { key: 'stats', label: 'Atributos' },
  { key: 'evolution', label: 'Evolução' },
  { key: 'defenses', label: 'Fraquezas' },
];

function InfoRow({ label, children }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <View style={styles.infoValue}>
        {typeof children === 'string' ? <Text style={styles.infoText}>{children}</Text> : children}
      </View>
    </View>
  );
}

function GenderBar({ rate }) {
  if (rate === -1) return <Text style={styles.infoText}>Sem gênero</Text>;
  const female = (rate / 8) * 100;
  const male = 100 - female;
  return (
    <View style={{ flex: 1 }}>
      <View style={styles.genderTrack}>
        <View style={{ flex: male, backgroundColor: COLORS.male }} />
        <View style={{ flex: female, backgroundColor: COLORS.female }} />
      </View>
      <View style={styles.genderLabels}>
        <Text style={[styles.genderText, { color: COLORS.male }]}>
          ♂ {male.toFixed(1).replace('.', ',')}%
        </Text>
        <Text style={[styles.genderText, { color: COLORS.female }]}>
          ♀ {female.toFixed(1).replace('.', ',')}%
        </Text>
      </View>
    </View>
  );
}

export default function DetailsScreen({ route, navigation }) {
  const [current, setCurrent] = useState(route.params.pokemon);
  const [pokemon, setPokemon] = useState(null);
  const [species, setSpecies] = useState(null);
  const [evolutions, setEvolutions] = useState(null);
  const [extraLoading, setExtraLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [shiny, setShiny] = useState(false);
  const [tab, setTab] = useState('about');
  const [attempt, setAttempt] = useState(0); // muda para forçar "tentar de novo"
  const appear = useRef(new Animated.Value(0)).current;
  const float = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef(null);
  const { isFavorite, toggle } = useFavorites();
  const { language, setLanguage } = useLanguage();

  // Animação de "flutuar" da imagem
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(float, { toValue: 1, duration: 1800, useNativeDriver: true }),
        Animated.timing(float, { toValue: 0, duration: 1800, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, []);

  useEffect(() => {
    // Cancela as requisições se o usuário sair da tela ou trocar de Pokémon antes de terminar
    const controller = new AbortController();
    const { signal } = controller;

    setLoading(true);
    setError('');
    setShiny(false);
    setSpecies(null);
    setEvolutions(null);
    appear.setValue(0);
    scrollRef.current?.scrollTo({ y: 0, animated: false });

    getPokemon(current, { signal })
      .then((data) => {
        setPokemon(data);
        setLoading(false);
        Animated.spring(appear, { toValue: 1, friction: 7, useNativeDriver: true }).start();

        // Descrição e evolução vêm de outras rotas. Se falharem, o resto da tela continua funcionando.
        setExtraLoading(true);
        return getSpecies(data.speciesUrl, { signal })
          .then((sp) => {
            setSpecies(sp);
            return sp.evolutionChainUrl ? getEvolutions(sp.evolutionChainUrl, { signal }) : null;
          })
          .then((chain) => setEvolutions(chain))
          .catch(() => {})
          .finally(() => {
            if (!signal.aborted) setExtraLoading(false);
          });
      })
      .catch((err) => {
        if (axios.isCancel(err)) return;
        setPokemon(null);
        setLoading(false);
        setError(
          err.response?.status === 404
            ? `Não encontramos "${current}". Confira o nome ou número.`
            : 'Não foi possível conectar à PokéAPI. Verifique sua internet.',
        );
      });

    return () => controller.abort();
  }, [current, attempt]);

  const color = pokemon ? getType(pokemon.types[0]).color : COLORS.background;
  const image = shiny && pokemon?.shinyImage ? pokemon.shinyImage : pokemon?.image;
  const canGoPrev = pokemon && pokemon.id > 1 && pokemon.id <= MAX_POKEMON_ID;
  const canGoNext = pokemon && pokemon.id < MAX_POKEMON_ID;
  const total = pokemon?.stats.reduce((sum, s) => sum + s.value, 0);
  const favorite = pokemon && isFavorite(pokemon.id);
  const generation = pokemon && generationOf(pokemon.id);
  // Textos traduzidos ficam no próprio app (src/data/pokedexTexts.js).
  // Para formas especiais sem tradução, usa o texto em inglês que vem da API.
  const description = (pokemon && DESCRIPTIONS[language][pokemon.id]) || species?.description;
  const genus = (pokemon && GENERA[language][pokemon.id]) || species?.genus;
  const translateY = float.interpolate({ inputRange: [0, 1], outputRange: [0, -8] });

  const renderExtraLoading = () => (
    <View style={styles.tabLoading}>
      <ActivityIndicator color={color} />
    </View>
  );

  const renderTab = () => {
    if (tab === 'about') {
      return (
        <View>
          <View style={styles.descriptionCard}>
            <View style={styles.descriptionHeader}>
              <Text style={styles.descriptionTitle}>Descrição da Pokédex</Text>
              <View style={styles.langSwitch}>
                {LANGUAGES.map((lang) => {
                  const active = language === lang.code;
                  return (
                    <TouchableOpacity
                      key={lang.code}
                      onPress={() => setLanguage(lang.code)}
                      style={[styles.langOption, active && { backgroundColor: color }]}
                      accessibilityLabel={lang.code === 'pt' ? 'Mostrar em português' : 'Show in English'}
                    >
                      <Text style={[styles.langText, active && styles.langTextActive]}>{lang.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
            {description ? (
              <Text style={styles.description}>{description}</Text>
            ) : extraLoading ? (
              renderExtraLoading()
            ) : (
              <Text style={styles.descriptionEmpty}>Descrição indisponível.</Text>
            )}
          </View>

          <View style={styles.measures}>
            <View style={styles.measure}>
              <Text style={styles.measureValue}>{pokemon.height.toFixed(1).replace('.', ',')} m</Text>
              <Text style={styles.measureLabel}>Altura</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.measure}>
              <Text style={styles.measureValue}>{pokemon.weight.toFixed(1).replace('.', ',')} kg</Text>
              <Text style={styles.measureLabel}>Peso</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.measure}>
              <Text style={styles.measureValue}>{pokemon.baseExperience ?? '—'}</Text>
              <Text style={styles.measureLabel}>Exp. base</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Habilidades</Text>
          <View style={[styles.row, { marginBottom: 22 }]}>
            {pokemon.abilities.map((ability) => (
              <View key={ability.name} style={[styles.ability, { borderColor: color }]}>
                <Text style={styles.abilityText}>{formatName(ability.name)}</Text>
                {ability.hidden && <Text style={styles.hiddenTag}>oculta</Text>}
              </View>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Dados</Text>
          {generation && <InfoRow label="Geração">{`${generation.label} · ${generation.region}`}</InfoRow>}
          {species && (
            <>
              {genus && <InfoRow label="Categoria">{genus}</InfoRow>}
              <InfoRow label="Habitat">
                {species.habitat ? HABITATS[species.habitat] || formatName(species.habitat) : 'Desconhecido'}
              </InfoRow>
              <InfoRow label="Taxa de captura">{`${species.captureRate} / 255`}</InfoRow>
              {species.baseHappiness != null && (
                <InfoRow label="Amizade base">{String(species.baseHappiness)}</InfoRow>
              )}
              <InfoRow label="Grupos de ovo">
                {species.eggGroups.map((g) => EGG_GROUPS[g] || formatName(g)).join(', ')}
              </InfoRow>
              <InfoRow label="Gênero">
                <GenderBar rate={species.genderRate} />
              </InfoRow>
            </>
          )}
        </View>
      );
    }

    if (tab === 'stats') {
      const best = pokemon.stats.reduce((a, b) => (b.value > a.value ? b : a));
      return (
        <View>
          {pokemon.stats.map((stat, i) => (
            <StatBar key={stat.name} name={stat.name} value={stat.value} delay={i * 90} />
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={[styles.totalValue, { color }]}>{total}</Text>
          </View>
          <Text style={styles.statHint}>
            Ponto forte: <Text style={styles.statHintBold}>{STAT_NAMES[best.name] || best.name}</Text>
          </Text>
        </View>
      );
    }

    if (tab === 'evolution') {
      if (!evolutions) {
        return extraLoading ? (
          renderExtraLoading()
        ) : (
          <Text style={styles.statHint}>Evolução indisponível.</Text>
        );
      }
      return (
        <EvolutionChain
          chain={evolutions}
          currentId={pokemon.id}
          color={color}
          onSelect={(id) => setCurrent(id)}
        />
      );
    }

    return <TypeDefenses types={pokemon.types} />;
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: color }]} edges={['top', 'left', 'right']}>
      <StatusBar style="light" />
      <ScrollView ref={scrollRef} contentContainerStyle={styles.content} bounces={false}>
        <View style={styles.inner}>
          <View style={styles.topBar}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton} hitSlop={10}>
              <Text style={styles.iconButtonText}>←</Text>
            </TouchableOpacity>
            {pokemon && (
              <TouchableOpacity
                onPress={() => toggle(pokemon.id)}
                style={styles.iconButton}
                hitSlop={10}
                accessibilityLabel={favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
              >
                <Text style={styles.heart}>{favorite ? '♥' : '♡'}</Text>
              </TouchableOpacity>
            )}
          </View>

          {loading && (
            <View style={styles.center}>
              <ActivityIndicator size="large" color={COLORS.accent} />
              <Text style={styles.loadingText}>Rastreando...</Text>
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
                transform: [{ scale: appear.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1] }) }],
              }}
            >
              <View style={styles.hero}>
                <View style={styles.heroHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.name}>{formatName(pokemon.name)}</Text>
                    <View style={styles.row}>
                      {pokemon.types.map((type) => (
                        <TypeBadge key={type} type={type} variant="glass" />
                      ))}
                    </View>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.number}>{formatNumber(pokemon.id)}</Text>
                    {species?.isLegendary && <Text style={styles.rarity}>★ Lendário</Text>}
                    {species?.isMythical && <Text style={styles.rarity}>✦ Mítico</Text>}
                  </View>
                </View>

                <View style={styles.imageArea}>
                  <Pokeball size={230} style={styles.heroBall} />
                  {image ? (
                    <Animated.Image
                      source={{ uri: image }}
                      style={[styles.image, { transform: [{ translateY }] }]}
                      resizeMode="contain"
                    />
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
              </View>

              <View style={styles.sheet}>
                <View style={styles.tabs}>
                  {TABS.map((t) => {
                    const active = tab === t.key;
                    return (
                      <TouchableOpacity key={t.key} style={styles.tab} onPress={() => setTab(t.key)}>
                        <Text style={[styles.tabText, active && { color: COLORS.text }]}>{t.label}</Text>
                        <View style={[styles.tabLine, active && { backgroundColor: color }]} />
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <View style={styles.tabContent}>{renderTab()}</View>

                <View style={styles.pager}>
                  <TouchableOpacity
                    style={[styles.pagerButton, !canGoPrev && styles.disabled]}
                    disabled={!canGoPrev}
                    onPress={() => setCurrent(pokemon.id - 1)}
                  >
                    <Text style={styles.pagerText}>‹ {canGoPrev ? formatNumber(pokemon.id - 1) : ''}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.pagerButton, !canGoNext && styles.disabled]}
                    disabled={!canGoNext}
                    onPress={() => setCurrent(pokemon.id + 1)}
                  >
                    <Text style={styles.pagerText}>{canGoNext ? formatNumber(pokemon.id + 1) : ''} ›</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const STAT_NAMES = {
  hp: 'HP',
  attack: 'Ataque',
  defense: 'Defesa',
  'special-attack': 'Ataque Especial',
  'special-defense': 'Defesa Especial',
  speed: 'Velocidade',
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { flexGrow: 1 },
  inner: { flexGrow: 1, width: '100%', maxWidth: 560, alignSelf: 'center' },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonText: { color: '#FFFFFF', fontSize: 22, fontWeight: '800' },
  heart: { color: '#FFFFFF', fontSize: 22 },
  center: { alignItems: 'center', paddingVertical: 120 },
  loadingText: { marginTop: 14, color: COLORS.textOnDark, fontSize: 16 },
  errorCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 24,
    margin: 20,
    alignItems: 'center',
  },
  errorEmoji: { fontSize: 44, marginBottom: 8 },
  errorText: { color: COLORS.text, fontSize: 15, textAlign: 'center', marginBottom: 18, lineHeight: 22 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
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
  hero: { paddingHorizontal: 20, paddingTop: 12, zIndex: 2 },
  heroHeader: { flexDirection: 'row', alignItems: 'flex-start' },
  name: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 10,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  number: { color: 'rgba(255,255,255,0.75)', fontSize: 20, fontWeight: '900', marginTop: 8 },
  rarity: {
    marginTop: 6,
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
    overflow: 'hidden',
  },
  imageArea: { alignItems: 'center', justifyContent: 'flex-end', height: 250, marginBottom: -40 },
  heroBall: { position: 'absolute', top: 6 },
  image: { width: 230, height: 230 },
  noImage: { justifyContent: 'center', alignItems: 'center' },
  noImageText: { color: COLORS.surface },
  shinyToggle: {
    position: 'absolute',
    left: 0,
    bottom: 50,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  shinyToggleOn: { backgroundColor: 'rgba(0,0,0,0.45)' },
  shinyText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  sheet: {
    flexGrow: 1,
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 36,
    paddingHorizontal: 22,
    paddingBottom: 30,
    minHeight: 520,
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginBottom: 20,
  },
  tab: { flex: 1, alignItems: 'center' },
  tabText: { fontSize: 14, fontWeight: '800', color: COLORS.textMuted, paddingVertical: 10 },
  tabLine: { height: 3, width: '70%', borderRadius: 2, backgroundColor: 'transparent' },
  tabContent: { minHeight: 280 },
  tabLoading: { paddingVertical: 30, alignItems: 'center' },
  descriptionCard: {
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: 16,
    padding: 16,
    marginBottom: 18,
  },
  descriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  descriptionTitle: { fontSize: 13, fontWeight: '800', color: COLORS.textMuted, textTransform: 'uppercase' },
  langSwitch: {
    flexDirection: 'row',
    backgroundColor: COLORS.border,
    borderRadius: 999,
    padding: 3,
  },
  langOption: { paddingVertical: 4, paddingHorizontal: 12, borderRadius: 999 },
  langText: { fontSize: 12, fontWeight: '800', color: COLORS.textMuted },
  langTextActive: { color: '#FFFFFF' },
  description: {
    fontSize: 15,
    lineHeight: 23,
    color: COLORS.text,
  },
  descriptionEmpty: { fontSize: 14, color: COLORS.textMuted },
  measures: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: 16,
    paddingVertical: 14,
    marginBottom: 22,
  },
  measure: { flex: 1, alignItems: 'center' },
  measureValue: { fontSize: 17, fontWeight: '900', color: COLORS.text },
  measureLabel: { fontSize: 12, color: COLORS.textMuted, marginTop: 4, fontWeight: '600' },
  divider: { width: 1, backgroundColor: COLORS.border },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: COLORS.text, marginBottom: 12 },
  ability: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    backgroundColor: COLORS.surfaceAlt,
  },
  abilityText: { color: COLORS.text, fontSize: 13, fontWeight: '700' },
  hiddenTag: {
    marginLeft: 6,
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  infoLabel: { width: 120, color: COLORS.textMuted, fontSize: 14, fontWeight: '600' },
  infoValue: { flex: 1, flexDirection: 'row' },
  infoText: { color: COLORS.text, fontSize: 14, fontWeight: '700', flexShrink: 1 },
  genderTrack: { flexDirection: 'row', height: 8, borderRadius: 4, overflow: 'hidden' },
  genderLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  genderText: { fontSize: 12, fontWeight: '800' },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  totalLabel: { fontSize: 15, fontWeight: '800', color: COLORS.text },
  totalValue: { fontSize: 22, fontWeight: '900' },
  statHint: { marginTop: 12, color: COLORS.textMuted, fontSize: 14 },
  statHintBold: { color: COLORS.text, fontWeight: '800' },
  pager: { flexDirection: 'row', gap: 12, marginTop: 24 },
  pagerButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 14,
    backgroundColor: COLORS.surfaceAlt,
  },
  pagerText: { color: COLORS.text, fontWeight: '800', fontSize: 15 },
  disabled: { opacity: 0.35 },
});
