"use strict";

const indexTester = require('../indexTester');
const TextIndex = require('./TextIndex');

indexTester('text', {
  create: async(config) => new TextIndex(config),
  values: [
    '',
    'finger lime',
    'pure bred',
    'ass',
    'mary kisses asses of kings',
    'assult on the titan',
    'assignments are boring',
    null,
    true,
    false
  ],
  tests: [{
    input: 'ass ass',
    output: [3, 4]
  }, {
    input: 'ass ment',
    output: []
  }]
});
