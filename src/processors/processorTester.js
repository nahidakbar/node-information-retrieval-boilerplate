"use strict";

const assert = require('assert');
const System = require('..')
  .System;
const StringQueryParser = require('..')
  .StringQueryParser;
const TextIndex = require('..')
  .lookup.text;

const documents = [
  'robotics',
  'robots on a plane',
  'robot chicken',
  'hienies chicken',
  'artificial intelligence',
  'robot chicken',
];

function tester(typeName, config)
{
  describe(`${typeName} processor`, function ()
  {
    let system;
    beforeEach(async function ()
    {
      system = new System();
      system.addIndex(await new TextIndex({
        name: 'field',
        fields: ['field']
      }))
      system.addProcessor(await config.create(config.config || {}));
    });

    describe('empty', function ()
    {
      it(`make sure empty works`, async function ()
      {
        await system.addDocuments([]);
        await system.removeDocuments([]);
        assert.deepEqual(await system.retrieveDocuments(), []);
      });

      it(`config`, async function ()
      {
        assert.notDeepEqual(system.meta(), {});
      });
    })

    describe('with data', function ()
    {
      let parser;
      beforeEach(async function ()
      {
        // add values
        await system.addDocuments(documents.map((value, id) =>
        {
          return {
            id: id,
            field: value
          };
        }));
        parser = new StringQueryParser(system.meta())
      })

      function test(testcase)
      {
        return async function ()
        {
          let query = parser.parse(testcase.input);
          let results = (await system.retrieveDocuments(query));
          results = (config.output || (results => results.results.map(item => parseInt(item.id))))(results);
          assert.deepEqual(results, testcase.output)
        }
      }

      config.tests.forEach(testcase =>
      {
        it(`${JSON.stringify(testcase.input)}`, test(testcase));
      });

      describe(`post-serialisation`, function ()
      {
        beforeEach(async function ()
        {
          system = new System(await system.state());
          parser = new StringQueryParser(system.meta())
        })

        config.tests.forEach(testcase =>
        {
          it(`${JSON.stringify(testcase.input)}`, test(testcase));
        })
      });
    });
  });
}

module.exports = tester;
