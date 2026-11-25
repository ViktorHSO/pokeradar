// Estende o app.json. No GitHub Pages o site fica em /<nome-do-repo>,
// então o workflow de deploy define EXPO_BASE_URL com esse caminho.
// Localmente a variável não existe e o app roda na raiz normalmente.
module.exports = ({ config }) => ({
  ...config,
  experiments: {
    ...config.experiments,
    baseUrl: process.env.EXPO_BASE_URL || '',
  },
});
