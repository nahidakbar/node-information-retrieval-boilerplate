"use strict";

const Index = require('./Index');
const extractObjectValues = require('../misc/extractObjectValues');
const Lexer = require('pos')
  .Lexer;
const Tagger = require('pos')
  .Tagger;
const stemmer = require('porter-stemmer')
  .stemmer;

const INDEX_TYPE = 'text';

class TextIndex extends Index
{
  constructor(config = {}, type = undefined)
  {
    super(config, type || INDEX_TYPE);
    this.filters = ['query', 'queryexact'];
    this.lex = new Lexer();
    this.lex = this.lex.lex.bind(this.lex)
    this.tag = new Tagger();
    this.tag = this.tag.tag.bind(this.tag);
    this.stem = stemmer;
  }

  getDocumentValues(document)
  {
    let values = [];
    extractObjectValues(document, this.fields, newValue =>
    {
      if (typeof newValue === 'string')
      {
        newValue = newValue.replace(/\s+/g, ' ')
          .replace(/(^\s+|\s+$)/g, '');
        if (newValue)
        {
          values.push(newValue);
        }
      }
    });
    return values.join('. ') || null;
  }

  analyseValue(values)
  {
    if (values)
    {
      let tokens = this.tag(this.lex(values.toLowerCase()));
      tokens.forEach(token => token.push(this.stem(token[0])))
      let total = {};
      for (let value of tokens)
      {
        let token = value[2];
        total[token] = total[token] || 0;
        total[token]++;
      }
      values = tokens.map(token => token[2])
        .join(' ');
      return {
        values,
        total
      };
    }
    else
    {
      return {
        values: '',
        total: {}
      };
    }
  }

  createIndex()
  {
    return {};
  }

  async addToIndex(index, documentIndices, documentsValues)
  {
    /**
     * O(documentIndices)
     */
    documentIndices.forEach((documentIndex, valuesOffset) =>
    {
      let value = documentsValues[valuesOffset].total;
      for (let kw of Object.entries(value))
      {
        const term = kw[0];
        const tally = kw[1];
        index[term] = index[term] || {
          total: 0
        };
        index[term][documentIndex] = index[term][documentIndex] || 0;
        index[term][documentIndex] += tally
        index[term].total += tally;
      }
    });
  }

  /**
   * O(documentIndices)
   */
  async removeFromIndex(index, documentIndices, documentsValues)
  {
    documentIndices.forEach((documentIndex, valuesOffset) =>
    {
      let value = documentsValues[valuesOffset];
      if (value && value.total)
      {
        value = value.total;
        for (let kw of Object.entries(value))
        {
          const term = kw[0];
          const tally = kw[1];
          index[term][documentIndex] -= tally
          index[term].total -= tally;
        }
      }
    });
  }

  filterBasedOnIndex(index, filter, results)
  {
    switch (filter.filter)
    {
    case 'query':
      return this.filterQueryImpl(index, filter, results, false);
    case 'queryexact':
      return this.filterQueryImpl(index, filter, results, true);
    }
    return results;
  }

  filterQueryImpl(index, filter, results, exact)
  {
    let final = false;
    const values = this.analyseValue(filter.values.join(' '));
    for (let [keyword, tally] of Object.entries(values.total))
    {
      let resultFragment = index[keyword];
      if (resultFragment && resultFragment.total > 0)
      {
        let scale = tally / resultFragment.total;
        if (!final)
        {
          final = {};
          for (const [result, resultTally] of Object.entries(resultFragment))
          {
            if (result !== 'total')
            {
              final[result] = resultTally * scale;
            }
          }
        }
        else
        {
          for (let result in final)
          {
            if (!(result in resultFragment))
            {
              final[result] = undefined;
            }
          }
          for (const [result, resultTally] of Object.entries(resultFragment))
          {
            if (result in final)
            {
              final[result] *= resultTally * scale;
            }
          }
        }
      }
      else
      {
        return results;
      }
    }
    if (final)
    {
      if (exact)
      {
        exact = new RegExp(values.values, 'ig')
      }
      for (let [result, resultTally] of Object.entries(final))
      {
        if (exact)
        {
          try
          {
            const match = this.values[result].values.match(exact);
            if (match && match.length)
            {
              resultTally *= match.length
            }
          }
          catch (e)
          {

          }
        }
        if (resultTally > 0)
        {
          results.addHit(result, resultTally);
        }
      }
    }
    return results;
  }
}

module.exports = TextIndex;
require('./register')
  .add(TextIndex, INDEX_TYPE);
