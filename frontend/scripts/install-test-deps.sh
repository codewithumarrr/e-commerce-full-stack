#!/bin/bash

# Install testing dependencies
npm install --save-dev \
  @testing-library/react \
  @testing-library/jest-dom \
  @testing-library/user-event \
  @types/jest \
  @types/testing-library__react \
  @types/testing-library__jest-dom \
  jest \
  jest-environment-jsdom \
  ts-jest \
  identity-obj-proxy \
  camelcase \
  react-app-polyfill \
  jest-watch-typeahead

# Install peer dependencies that might be needed
npm install --save-dev \
  @babel/core \
  @babel/preset-env \
  @babel/preset-react \
  @babel/preset-typescript \
  babel-jest

# Update package.json scripts
npm pkg set scripts.test="jest --watch" \
  scripts.test:ci="jest --ci --coverage --maxWorkers=2" \
  scripts.test:coverage="jest --coverage"

# Create necessary directories
mkdir -p config/jest

echo "Testing dependencies installed successfully!"