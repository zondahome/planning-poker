module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    '@babel/preset-typescript',
    ['@babel/preset-react', { runtime: 'automatic' }],
  ],
  plugins: ['@babel/plugin-syntax-import-meta'],
  env: {
    // Jest runs as CommonJS, so rewrite Vite's import.meta.env to process.env
    test: {
      plugins: ['babel-plugin-transform-vite-meta-env'],
    },
  },
};
