"use strict";

const indexTester = require('./indexTester');
const TextIndex = require('./TextIndex');

indexTester('text', {
  create: async(config) => new TextIndex(config),
  values: [
    '',
    'finger lime',
    'lime finger',
    'pure bred',
    'ass',
    'Mary KISSES asses of kings',
    'assult on the titan',
    'assignments are boring',
    'legal and taxation affairs are boring (really really shit)',
    null,
    true,
    false
  ],
  tests: [{
    input: 'ass ass',
    output: [4, 5]
  }, {
    input: 'finger lime',
    output: [1, 2]
  }, {
    input: 'ass ment',
    output: []
  }, {
    input: '"mary kissing ass"',
    output: [5]
  }, {
    input: 'pure or ass',
    output: [3, 4, 5]
  }, {
    input: 'pure and ass',
    output: []
  }, {
    input: 'king and mary',
    output: [5]
  }, {
    input: 'tax',
    output: [8]
  }, {
    input: 'not ass',
    output: [0, 1, 2, 3, 6, 7, 8, 9, 10, 11]
  }]
});
