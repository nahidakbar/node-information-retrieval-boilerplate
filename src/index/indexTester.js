"use strict";

const assert = require('assert');
const System = require('..')
  .System;
const StringQueryParser = require('..')
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

    function test(testcase)
    {
      return async function ()
      {
        let query = parser.parse(testcase.input);
        let results = (await system.retrieveDocuments(query));
        results = results.results.map(item => parseInt(item.id));
        assert.deepEqual(results, testcase.output)
      }
    }

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

    describe(`make sure records can be added and found`, function ()
    {
      config.tests.forEach(testcase =>
      {
        it(`${JSON.stringify(testcase.input)}`, test(testcase));
      })
    });

    describe(`make sure records can be removed`, function ()
    {
      beforeEach(async function ()
      {
        await system.removeDocuments(config.values.map((value, id) =>
        {
          return {
            id: id,
          };
        }));
      })

      config.tests.forEach(testcase =>
      {
        if (!testcase.false)
        {
          it(`${JSON.stringify(testcase.input)}`, test(Object.assign({}, testcase, {
            output: []
          })));
        }
      })
    });

    describe(`make sure index can be serialised`, async function ()
    {
      beforeEach(async function ()
      {
        system = new System(await system.state());
      });
      config.tests.forEach(testcase =>
      {
        it(`${JSON.stringify(testcase.input)}`, test(testcase));
      })
    })
  });

}

module.exports = tester;
