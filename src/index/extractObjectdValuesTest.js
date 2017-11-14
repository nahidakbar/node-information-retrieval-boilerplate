"use strict";

const assert = require('assert');
const extractObjectdValues = require('./extractObjectdValues');

describe(`extractObjectdValues`, function()
{
  const object = {
    a: 'a',
    b: ['b', 'c', null, undefined, true, false],
    c: [
      {},
      {
        d: 'd',
        e: ['e', 'f', null, undefined, false, true],
        f: {
          g: 'g',
          h: ['h', 'i'],
          i: false
        }
      }
    ],
  };
  const cases = [
    {
      fields: ['a'],
      output: ['a']
    },
    {
      fields: ['b'],
      output: ['b', 'c', true, false]
    },
    {
      fields: ['c.d'],
      output: ['d']
    },
    {
      fields: ['c.e'],
      output: ['e', 'f', false, true]
    },
    {
      fields: ['c.f'],
      output: ['g', 'h', 'i', false]
    },
    {
      fields: ['c.f.i'],
      output: [false]
    },
    {
      fields: ['z'],
      output: []
    },
    {
      fields: ['a.'],
      output: ['a']
    },
  ];

  cases.forEach(testCase =>
  {
    it (`${JSON.stringify(testCase)}`, function()
    {
      assert.deepEqual(extractObjectdValues(object, testCase.fields), testCase.output)
    })
  })

})
