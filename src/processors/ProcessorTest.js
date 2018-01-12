"use strict";

const Processor = require('./Processor');
const assert = require('assert');

describe('processor', function ()
{
  it('should require type', function ()
  {
    assert.throws(() =>
    {
      new Processor();
    });
  });
  it('should require bind', function ()
  {
    assert.throws(() =>
    {
      new Processor({}, 'type');
    });
  });

  let processor;
  beforeEach(function ()
  {
    processor = new Processor({}, 'type', ['bind']);
  });

  it('add is abstract', async function ()
  {
    try
    {
      await processor.addDocuments();
    }
    catch (e)
    {
      return
    }
    throw new Error('abstract method didnt throw error');
  });

  it('results is abstract', async function ()
  {
    try
    {
      await processor.processResults();
    }
    catch (e)
    {
      return
    }
    throw new Error('abstract method didnt throw error');
  });

  it('remove is abstract', async function ()
  {
    try
    {
      await processor.removeDocuments();
    }
    catch (e)
    {
      return
    }
    throw new Error('abstract method didnt throw error');
  });

  it('query is abstract', async function ()
  {
    try
    {
      await processor.processQuery();
    }
    catch (e)
    {
      return
    }
    throw new Error('abstract method didnt throw error');
  });

});
