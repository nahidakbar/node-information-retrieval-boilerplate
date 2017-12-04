"use strict";

const assert = require('assert');
const Index = require('./Index');

describe(`System`, function ()
{
  let index;
  beforeEach(async function ()
  {
    index = new Index();
  });

  it(`abstract methods`, function ()
  {
    for (let method of ['createIndex', 'addToIndex', 'removeFromIndex', 'filterBasedOnIndex'])
    {
      assert.throws(() =>
      {
        index[method].call(index);
      }, Error)
    }
  })

});
