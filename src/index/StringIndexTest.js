"use strict";

const searchIndexTester = require('../searchIndexTester');
const StringIndex = require('./StringIndex');

searchIndexTester('string', {
  create: async(config) => new StringIndex(config),
  values: [
    '',
    'a',
    'as',
    'ass',
    'asses',
    'assult',
    'assignment'
  ],
  tests: [{
    input: {
      filter: 'match',
      value: 'ass'
    },
    output: [3, 4, 5, 6]
  }]
});
