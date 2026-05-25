import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import axios from 'axios';

const Stack = createNativeStackNavigator();

const formatTitle = (text) =>
  text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();

function HomeScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);

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
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <StatusBar style="dark" />

        <View style={styles.homeHeader}>
          <Text style={styles.title}>Pokédex</Text>
          <Text style={styles.subtitle}>Encontre dados rápidos do seu Pokémon favorito.</Text>
        </View>

        <View style={styles.introCard}>
          <Text style={styles.introTitle}>Bem-vindo à Pokédex</Text>
          <Text style={styles.introText}>
            Digite o nome do Pokémon no campo abaixo e toque em Buscar para ver imagem, tipos, altura, peso e habilidades.
          </Text>
        </View>

        <View style={styles.searchCard}>
          <TextInput
            style={styles.input}
            placeholder="Exemplo: pikachu"
            placeholderTextColor="#999"
            value={query}
            autoCapitalize="none"
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />

          <TouchableOpacity style={styles.button} onPress={handleSearch}>
            <Text style={styles.buttonText}>Buscar Pokémon</Text>
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
                  >
                    <Text style={styles.suggestionText}>{formatTitle(name)}</Text>
                  </TouchableOpacity>
                ))}
            </View>
          ) : null}

          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>

        <View style={styles.footerCard}>
          <Text style={styles.footerTitle}>Dica</Text>
          <Text style={styles.footerText}>Tente procurar por nomes como "pikachu", "bulbasaur" ou "charizard".</Text>
        </View>
      </ScrollView>
  );
}

function DetailsScreen({ route, navigation }) {
  const { pokemonName } = route.params;
  const [pokemon, setPokemon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  const formatTitle = (text) =>
    text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.detailsHeader}>
        <Text style={styles.detailsTitle}>Resultado</Text>
        <Text style={styles.detailsSubtitle}>{formatTitle(pokemonName)}</Text>
      </View>

      {loading && (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#D62828" />
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
      )}

      {error ? (
        <View style={styles.errorCard}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {pokemon && !loading && (
        <View style={styles.card}>
          <Text style={styles.pokemonName}>{formatTitle(pokemon.name)}</Text>

          {pokemon.image ? (
            <Image source={{ uri: pokemon.image }} style={styles.pokemonImage} />
          ) : (
            <View style={styles.noImageBox}>
              <Text style={styles.noImageText}>Imagem não disponível</Text>
            </View>
          )}

          <View style={styles.infoRow}>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Altura</Text>
              <Text style={styles.infoValue}>{pokemon.height.toFixed(1)} m</Text>
            </View>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Peso</Text>
              <Text style={styles.infoValue}>{pokemon.weight.toFixed(1)} kg</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tipos</Text>
            <View style={styles.badgeRow}>
              {pokemon.types.map((type) => (
                <View key={type} style={styles.typeBadge}>
                  <Text style={styles.badgeText}>{formatTitle(type)}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Habilidades</Text>
            <View style={styles.badgeRow}>
              {pokemon.abilities.map((ability) => (
                <View key={ability} style={styles.abilityBadge}>
                  <Text style={styles.badgeText}>{formatTitle(ability)}</Text>
                </View>
              ))}
            </View>
          </View>

          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Buscar outro Pokémon</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#D62828' },
          headerTintColor: '#fff',
          contentStyle: { backgroundColor: '#F7F7FA' },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'Pokédex' }}
        />
        <Stack.Screen
          name="Details"
          component={DetailsScreen}
          options={{ title: 'Detalhes do Pokémon' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#F7F7FA',
    padding: 24,
    paddingTop: 30,
    alignItems: 'center',
  },
  homeHeader: {
    width: '100%',
    marginBottom: 20,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    color: '#1F1E33',
  },
  subtitle: {
    fontSize: 16,
    color: '#5A5A75',
    marginTop: 6,
  },
  introCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 20,
  },
  introTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F1E33',
    marginBottom: 10,
  },
  introText: {
    color: '#5A5A75',
    fontSize: 15,
    lineHeight: 22,
  },
  searchCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 54,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E2E8',
    paddingHorizontal: 16,
    marginBottom: 14,
    fontSize: 16,
    color: '#222',
    backgroundColor: '#FAFAFC',
  },
  button: {
    width: '100%',
    backgroundColor: '#D62828',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  suggestionsBox: {
    width: '100%',
    backgroundColor: '#F7F7FA',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E2E8',
    paddingVertical: 8,
    marginTop: 12,
    maxHeight: 220,
  },
  suggestionItem: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E2E2E8',
  },
  suggestionText: {
    color: '#1F1E33',
    fontSize: 15,
  },
  footerCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 20,
  },
  footerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F1E33',
    marginBottom: 8,
  },
  footerText: {
    color: '#5A5A75',
    fontSize: 15,
    lineHeight: 22,
  },
  loadingBox: {
    marginTop: 18,
    alignItems: 'center',
    width: '100%',
  },
  loadingText: {
    marginTop: 10,
    color: '#5A5A75',
    fontSize: 15,
  },
  errorText: {
    marginTop: 16,
    color: '#D62828',
    fontSize: 15,
    textAlign: 'center',
  },
  errorCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 20,
  },
  detailsHeader: {
    width: '100%',
    marginBottom: 20,
  },
  detailsTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F1E33',
  },
  detailsSubtitle: {
    fontSize: 16,
    color: '#5A5A75',
    marginTop: 6,
  },
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 6,
    alignItems: 'center',
  },
  pokemonName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F1E33',
    marginBottom: 14,
  },
  pokemonImage: {
    width: 220,
    height: 220,
    resizeMode: 'contain',
    marginBottom: 18,
  },
  noImageBox: {
    width: 220,
    height: 220,
    borderRadius: 18,
    backgroundColor: '#F0F0F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  noImageText: {
    color: '#8A8A99',
    fontSize: 14,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 18,
  },
  infoBox: {
    width: '48%',
    backgroundColor: '#F7F7FA',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
  },
  infoLabel: {
    color: '#5A5A75',
    fontSize: 14,
    marginBottom: 4,
  },
  infoValue: {
    color: '#1F1E33',
    fontSize: 18,
    fontWeight: '700',
  },
  section: {
    width: '100%',
    marginTop: 10,
  },
  sectionTitle: {
    color: '#5A5A75',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 10,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },
  typeBadge: {
    backgroundColor: '#FFE6E6',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    margin: 5,
  },
  abilityBadge: {
    backgroundColor: '#F0F4FF',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    margin: 5,
  },
  badgeText: {
    color: '#1F1E33',
    fontSize: 14,
    fontWeight: '600',
  },
  backButton: {
    width: '100%',
    backgroundColor: '#1F1E33',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 18,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
