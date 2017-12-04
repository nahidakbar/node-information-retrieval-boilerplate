"use strict";

const assert = require('assert');
const Parser = require('./QueryParser');

describe(`System`, function ()
{
  it(`empty 1`, function ()
  {
    assert.throws(() =>
    {
      new Parser({});
    })
  });

  it(`empty 2`, function ()
  {
    assert.throws(() =>
    {
      new Parser({
        fields: {
          test: {}
        },
        defaultField: 'xxx'
      });
    })
  });

  it(`empty 3`, function ()
  {
    const parser = new Parser({
      fields: {
        test: {
          filters: ['filter']
        }
      },
      defaultField: 'test'
    });
    assert.equal(parser.defaultField, 'test')
    assert.equal(parser.defaultFilter, 'filter')
    assert.equal(parser.defaultExactFilter, 'filter')
  });

});
