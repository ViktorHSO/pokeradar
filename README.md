# PokéRadar

Pokédex feita em React Native com Expo, consumindo a [PokéAPI](https://pokeapi.co/).
Busque um Pokémon pelo nome ou pelo número da Pokédex e veja a arte oficial, os tipos, os atributos base e as habilidades.

## Funcionalidades

- Busca por nome ou número (ex.: `pikachu` ou `25`)
- Sugestões enquanto você digita
- Botão "Surpreenda-me", que abre um Pokémon aleatório
- Card com a cor do tipo principal e tipos traduzidos para português
- Atributos base com barras animadas
- Alternância entre a arte normal e a shiny
- Navegação para o Pokémon anterior e o próximo
- Mensagens de erro diferentes para "Pokémon não encontrado" e "sem conexão"

## Tecnologias

- React Native com Expo SDK 58
- React Navigation (native stack)
- Axios
- PokéAPI

## Estrutura

```
App.js                      # navegação entre as telas
src/
  theme.js                  # cores, tipos e nomes dos atributos
  services/pokeapi.js       # chamadas à PokéAPI
  utils/format.js           # formatação de nomes e números
  components/
    TypeBadge.js            # etiqueta de tipo
    StatBar.js              # barra de atributo
  screens/
    HomeScreen.js           # tela de busca
    DetailsScreen.js        # tela de detalhes
```

## Como rodar

```bash
npm install
npx expo start
```

Depois, escaneie o QR code com o app Expo Go no celular ou aperte:

- `a` para Android
- `i` para iOS
- `w` para Web
