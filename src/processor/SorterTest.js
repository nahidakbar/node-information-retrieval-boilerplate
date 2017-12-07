"use strict";

const tester = require('./processorTester');
const Processor = require('./Sorter');

tester('sorter', {
  create: async(config) => new Processor(config),
  tests: [{
    input: 'robots',
    output: [0, 2, 1]
  }, {
    input: 'intelligent',
    output: [4]
  }, {
    input: 'facebook',
    output: []
  }, {
    input: 'chicken',
    output: [2, 3]
  }]
});
