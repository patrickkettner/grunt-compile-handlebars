'use strict';

var js = require('@eslint/js');
var globals = require('globals');

module.exports = [
  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: globals.node
    },
    rules: {
      'eqeqeq': ['error', 'always', { null: 'ignore' }],
      'new-cap': 'error',
      'no-caller': 'error',
      'no-empty': ['error', { allowEmptyCatch: true }],
      'no-unused-vars': ['error', { caughtErrors: 'none' }],
      'no-use-before-define': ['error', { functions: false }],
      'wrap-iife': 'error'
    }
  }
];
