"use strict";

const assert = require('assert');
const ir = require('..');

const TEST_CASES = {
  binary: [ir.scores.binary, 1],
  count: [ir.scores.count, 1],
  tf: [ir.scores.termFrequency, 0.25],
  ln: [ir.scores.logNormal, 1],
  normalised1: [ir.scores.augmented(0.5), 1],
  normalised2: [ir.scores.augmented(), 1],
  naiveBayes: [ir.scores.naiveBayes, 1],
  unary: [ir.scores.unary, 1],
  idf: [ir.scores.inverseDocumentFrequency, 0.6931471805599453],
  idfSmooth: [ir.scores.inverseDocumentFrequencySmooth, 1.0986122886681096],
  idfMax: [ir.scores.inverseDocumentFrequencyMax, 1.000000082690371e-10],
  prob: [ir.scores.probabilisticInverseDocumentFrequency, 1.000000082690371e-10],
};

describe(`scores`, function ()
{
  let search;

  beforeEach(async function ()
  {
    search = new ir.System();
    const TextIndex = ir.lookup.text;
    search.addIndex(new TextIndex({
      name: 'field',
      fields: ['field']
    }));
    for (let field of ['this is a sample', 'this is another example'])
    {
      await search.addDocuments([{
        id: search.ids.length,
        field
      }]);
    }
  });

  for (const [score, value] of Object.entries(TEST_CASES))
  {
    it(score, async function ()
    {
      const results = await search.retrieveDocuments({
        filter: {
          field: 'field',
          filter: 'query',
          values: ['example']
        }
      }, value[0]);
      assert.equal(results.results[0].score, value[1])
    });
  }

});
