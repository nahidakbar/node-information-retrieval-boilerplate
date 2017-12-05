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
    'Mary KISSES asses of kings',
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
  }, {
    input: '"mary kissing ass"',
    output: [4]
  }, {
    input: 'pure or ass',
    output: [2, 3, 4]
  }, {
    input: 'pure and ass',
    output: []
  }, {
    input: 'king and mary',
    output: [4]
  }, {
    input: 'not ass',
    output: [0, 1, 2, 5, 6, 7, 8, 9]
  }]
});
