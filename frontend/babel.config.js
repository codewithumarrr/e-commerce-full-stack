module.exports = {
  presets: [
    ["@babel/preset-env", { targets: { node: "current" } }],
    "@babel/preset-typescript",
    ["@babel/preset-react", { runtime: "automatic" }],
  ],
  plugins: [],
  env: {
    test: {
      plugins: [
        // Test-specific plugins can be added here
      ],
    },
    production: {
      plugins: [
        // Production-specific plugins can be added here
      ],
    },
  },
};
