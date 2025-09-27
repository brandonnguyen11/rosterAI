const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Ensure Metro knows about TTF font files
config.resolver.assetExts.push('ttf');

module.exports = config;
