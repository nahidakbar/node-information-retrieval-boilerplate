"use strict";

const Index = require('./Index');
const extractObjectValues = require('../misc/extractObjectValues');

const INDEX_TYPE = 'boolean';

class BooleanIndex extends Index
{
  constructor(config = {}, type = undefined)
  {
    super(config, type || INDEX_TYPE);
    this.filters = ['is', 'exists'];
  }

  getDocumentValues(document)
  {
    let value = null;
    extractObjectValues(document, this.fields, newValue =>
    {
      if (typeof newValue === 'boolean')
      {
        value = newValue;
      }
    });
    return value;
  }

  analyseValues(values)
  {
    return values;
  }

  createIndex()
  {
    return [];
  }

  /**
   * O(documentIndices)
   */
  async addToIndex(index, documentIndices, documentsValues)
  {
    documentIndices.forEach((documentIndex, valuesOffset) =>
    {
      let value = documentsValues[valuesOffset];
      index[documentIndex] = value;
    });
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
    case 'is':
      return this.filterIsImpl(index, filter, results);
    }
    return results;
  }

  filterExistsImpl(index, filter, results)
  {
    const targetValue = filter.values[0].toLowerCase() === 'true';
    for (let resultIndex = 0; resultIndex < index.length; resultIndex++)
    {
      const exists = typeof index[resultIndex] === 'boolean';
      if (targetValue === exists)
      {
        results.addHit(resultIndex, 1);
      }
    }
    return results;
  }

  filterIsImpl(index, filter, results)
  {
    const targetValue = filter.values[0].toLowerCase() === 'true';
    for (let resultIndex = 0; resultIndex < index.length; resultIndex++)
    {
      if (index[resultIndex] === targetValue)
      {
        results.addHit(resultIndex, 1);
      }
    }
    return results;
  }

}

module.exports = BooleanIndex;
require('./register')
  .add(BooleanIndex, INDEX_TYPE);
