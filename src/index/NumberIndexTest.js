"use strict";

const indexTester = require('../indexTester');
const NumberIndex = require('./NumberIndex');

indexTester('number', {
  create: async(config) => new NumberIndex(config),
  values: [
    '',
    'true',
    'false',
    null,
    true,
    false,
    1,
    2,
    Number.Infinity, -Number.Infinity,
    Number.NaN
  ],
  tests: [{
    input: 'field:lessThan:2',
    output: [6]
  }, {
    input: 'field:moreThan:1',
    output: [7]
  }, {
    input: 'field:exists:TRUE',
    output: [6, 7]
  }, {
    input: 'field:exists:FalSe',
    output: [0, 1, 2, 3, 4, 5, 8, 9, 10],
    false: true
  }]
});
