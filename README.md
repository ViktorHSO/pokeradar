# PokéRadar 📡

Uma Pokédex em React Native (Expo) que consome a [PokéAPI](https://pokeapi.co/).
Digite um nome ou número e veja tudo sobre o Pokémon: arte oficial, tipos, atributos base e habilidades.

## Funcionalidades

- 🔎 Busca por **nome ou número** da Pokédex (ex.: `pikachu` ou `25`)
- 💡 Sugestões automáticas enquanto você digita
- 🎲 Botão **Surpreenda-me** com um Pokémon aleatório
- 🎨 Card colorido de acordo com o **tipo** do Pokémon (tipos traduzidos para português)
- 📊 **Atributos base** com barras animadas e total
- ✨ Alternar entre a arte **normal e shiny**
- ‹ › Navegar para o Pokémon **anterior/próximo** na Pokédex
- ⚠️ Mensagens de erro claras (Pokémon não encontrado × sem internet) com botão de tentar de novo

## Tecnologias

- [Expo](https://expo.dev/) SDK 58 + React Native
- React Navigation (native stack)
- Axios
- PokéAPI

## Estrutura

```
App.js                      # navegação
src/
  theme.js                  # cores, tipos e nomes dos atributos
  services/pokeapi.js       # chamadas à PokéAPI
  utils/format.js           # formatação de nomes e números
  components/
    TypeBadge.js            # etiqueta colorida de tipo
    StatBar.js              # barra animada de atributo
  screens/
    HomeScreen.js           # busca
    DetailsScreen.js        # detalhes do Pokémon
```

## Como rodar

```bash
npm install
npx expo start
```

Depois, escaneie o QR code com o app **Expo Go** no celular, ou aperte:

- `a` para Android
- `i` para iOS
- `w` para Web
