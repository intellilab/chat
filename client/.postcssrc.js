module.exports = {
  // Transform inline comments
  parser: require('postcss-scss'),
  plugins: [
    require('autoprefixer'),
    // Transform SCSS into CSS
    require('precss'),
    // Calculate at compile time
    require('postcss-calc'),
  ].filter(Boolean),
};
