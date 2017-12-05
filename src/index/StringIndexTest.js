"use strict";

const indexTester = require('../indexTester');
const StringIndex = require('./StringIndex');

indexTester('string', {
  create: async(config) => new StringIndex(config),
  values: [
    '',
    'a',
    'as',
    'ass',
    'asses',
    'assult',
    'assignment',
    null,
    true,
    false
  ],
  tests: [{
    input: 'ass',
    output: [3, 4, 5, 6]
  }, {
    input: 'ASS',
    output: [3, 4, 5, 6]
  }, {
    input: 'ass ment',
    output: [6]
  }, {
    input: 'exists:TRUE',
    output: [1, 2, 3, 4, 5, 6]
  }, {
    input: 'exists:false',
    output: [0, 7, 8, 9],
    false: true
  }]
});
