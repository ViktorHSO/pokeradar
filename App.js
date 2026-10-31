import React, { useState, useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
  Keyboard,
  Animated,
  Platform,
} from 'react-native';
import axios from 'axios';

const Stack = createNativeStackNavigator();

// Paleta 60-30-10: Cores bem distribuídas
const COLORS = {
  primary: '#0F1628', // 60% - Azul escuro (fundo dominante)
  secondary: '#F5F5F5', // 30% - Cinza claro (cartas secundárias)
  accent: '#FF6B6B', // 10% - Vermelho coral (destaques e acentos)
  cardBg: '#FFFFFF',
  text: '#1A1A2E',
  textLight: '#6C757D',
  border: '#E9ECEF',
  success: '#00C896',
  warning: '#FFB800',
};

const formatTitle = (text) =>
  text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();

function HomeScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    // Animação de entrada suave
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    const loadSuggestions = async () => {
      try {
        const response = await axios.get('https://pokeapi.co/api/v2/pokemon?limit=2000');
        setSuggestions(response.data.results.map((item) => item.name));
      } catch {
        setSuggestions([]);
      } finally {
        setLoadingSuggestions(false);
      }
    };

    loadSuggestions();
  }, []);

  const handleSearch = () => {
    const trimmedQuery = query.trim().toLowerCase();
    if (!trimmedQuery) {
      setError('Digite o nome do Pokémon para buscar.');
      return;
    }

    setError('');
    Keyboard.dismiss();
    navigation.navigate('Details', { pokemonName: trimmedQuery });
  };

  return (
      <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <StatusBar style="light" />

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
              onChangeText={setQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />

            <TouchableOpacity 
              style={styles.searchButton} 
              onPress={handleSearch}
              activeOpacity={0.8}
            >
              <Text style={styles.searchButtonText}>⚡ Buscar</Text>
            </TouchableOpacity>

            {!loadingSuggestions && query.length > 0 ? (
              <View style={styles.suggestionsBox}>
                {suggestions
                  .filter((name) => name.includes(query.toLowerCase()))
                  .slice(0, 5)
                  .map((name) => (
                    <TouchableOpacity
                      key={name}
                      style={styles.suggestionItem}
                      onPress={() => {
                        setQuery(name);
                        setError('');
                        navigation.navigate('Details', { pokemonName: name });
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.suggestionText}>{formatTitle(name)}</Text>
                    </TouchableOpacity>
                  ))}
              </View>
            ) : null}

            {error ? <Text style={styles.errorText}>❌ {error}</Text> : null}
          </View>

          <View style={styles.tipsCard}>
            <Text style={styles.tipsTitle}>💡 Dicas</Text>
            <Text style={styles.tipsText}>Procure por qualquer Pokémon: pikachu, charizard, mewtwo, dragonite...</Text>
          </View>
        </ScrollView>
      </Animated.View>
  );
}

function DetailsScreen({ route, navigation }) {
  const { pokemonName } = route.params;
  const [pokemon, setPokemon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Animação de entrada com fade e scale
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    const loadPokemon = async () => {
      setLoading(true);
      setError('');
      setPokemon(null);

      try {
        const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);
        const data = response.data;

        const imageUrl =
          data.sprites.other['official-artwork'].front_default ||
          data.sprites.front_default;

        setPokemon({
          name: data.name,
          image: imageUrl,
          height: data.height / 10,
          weight: data.weight / 10,
          types: data.types.map((item) => item.type.name),
          abilities: data.abilities.map((item) => item.ability.name),
        });
      } catch (err) {
        setError('Pokémon não encontrado. Verifique o nome e tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    loadPokemon();
  }, [pokemonName]);

  return (
    <Animated.View style={[styles.detailContainer, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <StatusBar style="light" />

        <View style={styles.detailHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Voltar</Text>
          </TouchableOpacity>
          <Text style={styles.detailTitle}>{formatTitle(pokemonName)}</Text>
        </View>

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.accent} />
            <Text style={styles.loadingText}>Carregando...</Text>
          </View>
        )}

        {error ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => navigation.goBack()}>
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

            <Text style={styles.pokemonName}>{formatTitle(pokemon.name)}</Text>

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
                    <Text style={styles.badgeText}>{formatTitle(type)}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Habilidades</Text>
              <View style={styles.badgeRow}>
                {pokemon.abilities.map((ability) => (
                  <View key={ability} style={[styles.badge, styles.abilityBadge]}>
                    <Text style={styles.badgeText}>{formatTitle(ability)}</Text>
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
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: COLORS.primary },
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Details" component={DetailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
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
