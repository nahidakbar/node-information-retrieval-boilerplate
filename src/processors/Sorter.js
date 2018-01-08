"use strict";

const Processor = require('./Processor');

const PROCESSOR_TYPE = 'sorter';

class Sorter extends Processor
{
  constructor(config = {})
  {
    super(config, PROCESSOR_TYPE, ['results']);
  }

  async processResults(system, query, results)
  {
    try
    {
      let sort = query.sort ? query.sort : 'score';
      // load sort value if not score
      if (sort !== 'score')
      {
        try
        {
          const index = system.indicesLookup[sort][0];
          results.results.forEach(result =>
          {
            result[sort] = index.getSortValue(result._index);
          });
        }
        catch (e)
        {
          console.log(e.stack)
          sort = 'score';
        }
      }
      results.results.sort(this.sortFunction(system, sort, query.order));
      results.results.forEach(result =>
      {
        result._index = undefined;
      })
    }
    catch (e)
    {
      console.error(e.stack)
    }
  }

  sortFunction(system, sort, sortOrder)
  {
    const idField = system.idField;
    const order = sort === 'score' ? 1 : (sortOrder === 'asc' ? -1 : 1);
    return (a, b) =>
    {
      const asort = a[sort],
        bsort = b[sort];
      if (asort === bsort)
      {
        // document ids are assumed to never be equal
        // when sorts are equal, order by document ids
        // they could mean something. e.g. file path or omething
        if (a[idField] > b[idField])
        {
          return 1;
        }
        else
        {
          return -1;
        }
      }
      else if (bsort > asort)
      {
        return order;
      }
      else
      {
        return -order;
      }
    };
  }
}

module.exports = Sorter;
// register type for serialisation
require('./register')
  .add(Sorter, PROCESSOR_TYPE);
