"use strict";

const assert = require('assert');
const ir = require('..');

const TEST_CASES = {
  binary: [ir.scores.binary, 1.001],
  count: [ir.scores.count, 1.000001],
  tf: [ir.scores.termFrequency, 0.1427960873911181],
  ln: [ir.scores.logNormal, 0.9940922447210179],
  normalised1: [ir.scores.augmented(0.5), 1.0005005],
  normalised2: [ir.scores.augmented(), 1.0005005],
  naiveBayes: [ir.scores.naiveBayes, 1.00092853062973],
  unary: [ir.scores.unary, 1.001],
  idf: [ir.scores.inverseDocumentFrequency, 0.6938403277405052],
  idfSmooth: [ir.scores.inverseDocumentFrequencySmooth, 1.0997109009567776],
  idfMax: [ir.scores.inverseDocumentFrequencyMax, 1.0010000827730614e-10],
  prob: [ir.scores.probabilisticInverseDocumentFrequency, 1.0010000827730614e-10],
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
