const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const config = getDefaultConfig(__dirname);

// shared/ dizinini Metro bundler'a tanıt
config.watchFolders = [path.resolve(__dirname, "shared")];

// shared/ modüllerini resolve et
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, "node_modules"),
];

// @shared alias'ı için extraNodeModules
config.resolver.extraNodeModules = {
  "@shared": path.resolve(__dirname, "shared"),
};

module.exports = withNativeWind(config, { input: "./global.css" });
