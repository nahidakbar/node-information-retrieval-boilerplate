"use strict";

const tester = require('./processorTester');
const Processor = require('./Sorter');

tester('sorter', {
  create: async(config) => new Processor(config),
  tests: [{
    input: 'robots',
    output: [0, 2, 5, 1]
  }, {
    input: 'intelligent',
    output: [4]
  }, {
    input: 'facebook',
    output: []
  }, {
    input: 'chicken',
    output: [2, 3, 5]
  }, {
    input: 'robots sort:field order:dsc',
    output: [1, 2, 5, 0]
  }]
});

describe('processor', function()
{
  it('should intialise', function()
  {
    new Processor();
  });
});
