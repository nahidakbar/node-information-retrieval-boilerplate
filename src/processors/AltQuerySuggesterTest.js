"use strict";

const tester = require('./processorTester');
const Processor = require('./AltQuerySuggester');

tester('alt query', {
  config: {
    fields: ['field']
  },
  output: results => results.altKeywords,
  create: async(config) => new Processor(config),
  tests: [{
    input: 'madbots',
    output: ['robots']
  }, {
    input: 'ginger and community or robot',
    output: ['hienies and robotics or robot']
  }]
});

describe('processor', function ()
{
  it('should intialise', function ()
  {
    new Processor();
  });
});
