"use strict";

const Index = require('./Index');

class StringIndex extends Index
{
  constructor(config = {}, type = undefined)
  {
    super(config, type || 'string');
    this.filters = ['match'];
  }

  async addToIndex(index, records, values)
  {
    records.forEach((record, recordIndex) =>
    {
      const id = record[0];
      let value = values[recordIndex];
      if (value)
      {
        index[id] = Object.keys(value).join(' ');
      }
    });
  }

  async removeFromIndex(index, records, values)
  {
    records.forEach((record, recordIndex) =>
    {
      const id = record[0];
      delete index[id];
    });
  }

  searchInIndex(index, filter, results)
  {
    for (let resultIndex = 0; resultIndex < results.length; resultIndex++)
    {
      if (results[resultIndex] >= 0)
      {
        if (index[resultIndex] && index[resultIndex].indexOf(filter.value) >= 0)
        {
          results[resultIndex] += 1;
        }
      }
    }
  }


}

module.exports = StringIndex;
require('./register')
  .add(StringIndex, 'string');
