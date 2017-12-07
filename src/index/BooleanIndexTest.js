"use strict";

const indexTester = require('./indexTester');
const BooleanIndex = require('./BooleanIndex');

indexTester('boolean', {
  create: async(config) => new BooleanIndex(config),
  values: [
    '',
    'true',
    'false',
    null,
    true,
    false
  ],
  tests: [{
    input: 'field:is:true',
    output: [4]
  }, {
    input: 'field:is:false',
    output: [5]
  }, {
    input: 'field:exists:true',
    output: [4, 5]
  }, {
    input: 'field:exists:false',
    output: [0, 1, 2, 3],
    false: true
  }]
});
