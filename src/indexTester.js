"use strict";

const assert = require('assert');
const System = require('.')
  .System;
const StringQueryParser = require('.')
  .StringQueryParser;

function tester(typeName, config)
{
  describe(`${typeName} index empty`, function ()
  {
    let system;
    beforeEach(async function ()
    {
      system = new System();
      system.addIndex(await config.create())
    });

    it(`make sure empty works`, async function ()
    {
      assert.deepEqual(await system.retrieveDocuments(), []);
    })

    it(`config`, async function ()
    {
      assert.notDeepEqual(system.meta(), {});
    });
  });

  describe(`${typeName} with records`, async function ()
  {
    let system;
    let parser;
    beforeEach(async function ()
    {
      system = new System();
      system.addIndex(await config.create({
        name: 'field',
        fields: ['field']
      }))
      // add values
      await system.addDocuments(config.values.map((value, id) =>
      {
        return {
          id: id,
          field: value
        };
      }));

      parser = new StringQueryParser(system.meta())
    })

    it(`make sure records can be added and found`, async function ()
    {
      for (let testcase of config.tests)
      {
        let query = parser.parse(testcase.input);
        let results = (await system.retrieveDocuments(query));
        results = results.results.map(item => parseInt(item.id));
        assert.deepEqual(results, testcase.output)
      }
    });

    it(`make sure records can be removed`, async function ()
    {
      await system.removeDocuments(config.values.map((value, id) =>
      {
        return {
          id: id,
        };
      }));

      for (let testcase of config.tests)
      {
        if (testcase.false)
        {
          continue
        }
        const results = (await system.retrieveDocuments(parser.parse(testcase.input)))
          .results
          .map(item => parseInt(item.id));
        assert.deepEqual(results, [])
      }
    });

    it(`make sure index can be serialised`, async function ()
    {
      system = new System(await system.state());
      for (let testcase of config.tests)
      {
        let results = (await system.retrieveDocuments(parser.parse(testcase.input)))
          .results
          .map(item => parseInt(item.id));
        assert.deepEqual(results, testcase.output)
      }
    })
  });

}

module.exports = tester;
