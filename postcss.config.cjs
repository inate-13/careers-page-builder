// postcss.config.cjs
module.exports = {
  plugins: {
    '@tailwindcss/postcss': require('@tailwindcss/postcss')(),
    autoprefixer: {},
  },
};
