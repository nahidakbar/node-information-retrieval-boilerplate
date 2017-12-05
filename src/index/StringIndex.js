"use strict";

const Index = require('./Index');
const extractObjectValues = require('../misc/extractObjectValues');
const decoder = require('unidecode');

const INDEX_TYPE = 'string';

class StringIndex extends Index
{
  constructor(config = {}, type = undefined)
  {
    super(config, type || INDEX_TYPE);
    this.filters = ['match', 'exists'];
  }

  getDocumentValues(document)
  {
    const values = [];
    extractObjectValues(document, this.fields, (value, field, scale) => {
      if (typeof value === 'string')
      {
        values.push(decoder(value).toLowerCase());
      }
    });
    return values;
  }

  createIndex()
  {
    return [];
  }

  async addToIndex(index, documentIndices, documentsValues)
  {
    /**
     * O(documentIndices)
     */
    documentIndices.forEach((documentIndex, valuesOffset) =>
    {
      let value = documentsValues[valuesOffset];
      index[documentIndex] = Object.keys(value)
        .join('|');
    });
    // console.log(documentsValues, index)
  }

  /**
   * O(documentIndices)
   */
  async removeFromIndex(index, documentIndices, documentsValues)
  {
    documentIndices.forEach(documentIndex => index[documentIndex] = null);
  }

  filterBasedOnIndex(index, filter, results)
  {
    switch (filter.filter)
    {
    case 'exists':
      return this.filterExistsImpl(index, filter, results);
    case 'match':
      return this.filterMatchImpl(index, filter, results);
    }
    return results;
  }

  filterExistsImpl(index, filter, results)
  {
    const targetValue = filter.values[0].toLowerCase() === 'true';
    for (let resultIndex = 0; resultIndex < index.length; resultIndex++)
    {
      const exists = !!(index[resultIndex]);
      if (targetValue === exists)
      {
        results.addHit(resultIndex, 1);
      }
    }
    return results;
  }

  filterMatchImpl(index, filter, results)
  {
    filter.values = filter.values.map(value => value.toLowerCase())
    for (let resultIndex = 0; resultIndex < index.length; resultIndex++)
    {
      const values = index[resultIndex];
      if (values && filter.values.filter(value => values.indexOf(value) === -1)
        .length === 0)
      {
        results.addHit(resultIndex, 1);
      }
    }
    return results;
  }
}

module.exports = StringIndex;
require('./register')
  .add(StringIndex, INDEX_TYPE);
