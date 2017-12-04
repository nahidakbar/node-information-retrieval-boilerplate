"use strict";

const Index = require('./Index');
const extractObjectValues = require('../misc/extractObjectValues');

const INDEX_TYPE = 'number';

class NumberIndex extends Index
{
  constructor(config = {}, type = undefined)
  {
    super(config, type || INDEX_TYPE);
    this.filters = ['lessThan', 'moreThan', 'equalTo', 'exists'];
  }

  getDocumentValues(document)
  {
    let values = [];
    extractObjectValues(document, this.fields, newValue =>
    {
      if (typeof newValue === 'number' && Number.isFinite(newValue))
      {
        values.push(newValue);
      }
    });
    if (values.length > 0)
    {
      return values.sort();
    }
    else
    {
      return null;
    }
  }

  analyseValues(values)
  {
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
    case 'lessThan':
      return this.filterLessThanImpl(index, filter, results);
    case 'moreThan':
      return this.filterMoreThanImpl(index, filter, results);
    case 'equalTo':
      return this.filterEqualToImpl(index, filter, results);
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

  filterLessThanImpl(index, filter, results)
  {
    const targetValue = Math.min.apply(null, filter.values.map(parseFloat)
      .filter(Number.isFinite));
    for (let resultIndex = 0; resultIndex < index.length; resultIndex++)
    {
      const values = (index[resultIndex] || [])
        .filter(v => v < targetValue);
      if (values.length)
      {
        results.addHit(resultIndex, values.length);
      }
    }
    return results;
  }

  filterMoreThanImpl(index, filter, results)
  {
    const targetValue = Math.max.apply(null, filter.values.map(parseFloat)
      .filter(Number.isFinite));
    for (let resultIndex = 0; resultIndex < index.length; resultIndex++)
    {
      const values = (index[resultIndex] || [])
        .filter(v => v > targetValue);
      if (values.length)
      {
        results.addHit(resultIndex, values.length);
      }
    }
    return results;
  }

  filterEqualToImpl(index, filter, results)
  {
    const targetValue = filter.values.map(parseFloat)
      .filter(Number.isFinite)[0];
    for (let resultIndex = 0; resultIndex < index.length; resultIndex++)
    {
      const values = (index[resultIndex] || [])
        .filter(v => Math.abs(v - targetValue) < 1e-10);
      if (values.length)
      {
        results.addHit(resultIndex, values.length);
      }
    }
    return results;
  }

}

module.exports = NumberIndex;
require('./register')
  .add(NumberIndex, INDEX_TYPE);
