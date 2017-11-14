"use strict";

const assert = require('assert');
const Search = require('./Search');

function tester(typeName, config)
{
  describe(`${typeName} index empty`, function ()
  {
    let indexer;
    beforeEach(async function ()
    {
      indexer = new Search();
      indexer.addIndex(await config.create())
    });

    it(`make sure empty works`, async function ()
    {
      const results = await indexer.searchRecords();
      assert.deepEqual(results, []);
    })

    it(`config`, async function ()
    {
      indexer.dumpMeta();
      //console.log(JSON.stringify(indexer.dumpMeta(), null, 2))
    })
  })

  describe(`${typeName} with records`, async function ()
  {
    let indexer;
    beforeEach(async function ()
    {
      indexer = new Search();
      indexer.addIndex(await config.create({fields: ['field']}))
      // add values
      await indexer.addRecords(config.values.map((value, id) =>
      {
        return {
          id: id,
          field: value
        };
      }));
    })

    it(`make sure records can be added and found`, async function ()
    {
      for (let testcase of config.tests)
      {
        let results = (await indexer.searchRecords({
            filter: [
              testcase.input
            ]
          }))
          .map(item => parseInt(item.id));
        assert.deepEqual(results, testcase.output)
      }
    });

    it(`make sure records can be removed`, async function ()
    {
      await indexer.removeRecords(config.values.map((value, id) =>
      {
        return {
          id: id,
        };
      }));

      for (let testcase of config.tests)
      {
        let results = (await indexer.searchRecords({
            filter: [
              testcase.input
            ]
          }))
          .map(item => parseInt(item.id));
        assert.deepEqual(results, [])
      }
    })

    it(`make sure index can be serialised`, async function ()
    {
      indexer = new Search(await indexer.dumpConfig());
      for (let testcase of config.tests)
      {
        let results = (await indexer.searchRecords({
            filter: [
              testcase.input
            ]
          }))
          .map(item => parseInt(item.id));
        assert.deepEqual(results, testcase.output)
      }
    })
  });

}

module.exports = tester;
