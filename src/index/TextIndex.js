"use strict";

const Index = require('./Index');
const extractObjectValues = require('../misc/extractObjectValues');
const decoder = require('unidecode');
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
    this.decoder = decoder;
    this.lex = new Lexer();
    this.lex = this.lex.lex.bind(this.lex)
    this.tag = new Tagger();
    this.tag = this.tag.tag.bind(this.tag);
    this.stem = stemmer;
    this.length = config.length || 0;
    this.maximum = config.maximum || 0;
    this.sorts = [this.name];
    this.allowPartial = this.allowPartial || false;
  }

  async state()
  {
    return Object.assign(await super.state(), {
      length: this.length,
      maximum: this.maximum,
      allowPartial: this.allowPartial
    });
  }

  getDocumentValues(document)
  {
    let values = [];
    extractObjectValues(document, this.fields, (newValue, field, scale) =>
    {
      if (typeof newValue === 'string')
      {
        newValue = newValue.replace(/\s+/g, ' ')
          .trim();
        if (newValue)
        {
          values.push([newValue, scale]);
        }
      }
    });
    return values.length && values || null;
  }

  analyseValue(valuesList)
  {
    if (valuesList)
    {
      let count = 0;
      let total = {};
      let values = {};
      let maximum = 0;
      for (let [original, scale] of valuesList)
      {
        let tokens = this.tag(this.lex(decoder(original)
          .toLowerCase()));
        tokens.forEach(token => token.push(this.stem(token[0])))
        for (let value of tokens)
        {
          let token = value[2];
          total[token] = total[token] || 0;
          total[token] += scale;
          count += scale;
          maximum = Math.max(total[token], maximum)
        }
        values[tokens.map(token => token[2])
          .join(' ')] = 1;
      }
      values = Object.keys(values)
        .join(' ');
      return {
        values,
        total,
        count,
        maximum
      };
    }
    else
    {
      return {
        values: '',
        total: {},
        count: 0
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
      const value = documentsValues[valuesOffset].total;
      const count = documentsValues[valuesOffset].count;
      for (const [term, tally] of Object.entries(value))
      {
        index[term] = index[term] || {
          total: 0
        };
        index[term][documentIndex] = index[term][documentIndex] || 0;
        index[term][documentIndex] += tally
        index[term].total += tally;
      }
      this.length += count;
    });

    let maximum = 0;
    for (const docs of Object.values(index))
    {
      maximum = Math.max(maximum, Object.keys(docs)
        .length - 1);
    }
    this.maximum = maximum;
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

  filterBasedOnIndex(index, filter, results, score)
  {
    switch (filter.filter)
    {
    case 'query':
      return this.filterQueryImpl(index, filter, results, score, false);
    case 'queryexact':
      return this.filterQueryImpl(index, filter, results, score, true);
    }
    return results;
  }


  filterQueryImpl(index, filter, results, score, exact)
  {
    let final = false;
    const values = this.analyseValue([
      [filter.values.join(' '), 1]
    ]);
    Object.entries(values.total)
      .map((keywordTally, keywordIndex, all) =>
      {
        const [keyword, tally] = keywordTally;
        let resultFragment = index[keyword];
        if (resultFragment && resultFragment.total > 0)
        {
          results.addKeyword(filter.values[keywordIndex], resultFragment.total);
          if (!final)
          {
            final = {};
            for (const [result, resultTally] of Object.entries(resultFragment))
            {
              if (result !== 'total')
              {
                const value = this.values[result];
                final[result] = score(resultTally,
                  value.count,
                  value.maximum,
                  resultFragment.total,
                  this.length,
                  this.values.length,
                  all.length,
                  this.maximum) * tally;
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
                const value = this.values[result];
                final[result] *= score(resultTally,
                  value.count,
                  value.maximum,
                  resultFragment.total,
                  this.length,
                  this.values.length,
                  all.length,
                  this.maximum) * tally;
              }
            }
          }
        }
        else
        {
          results.addKeyword(filter.values[keywordIndex], 0);
          if (!this.allowPartial)
          {
            final = {};
          }
        }
      });
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
  }

  getSortValue(index)
  {
    return this.values[index].values
  }

}

module.exports = TextIndex;
require('./register')
  .add(TextIndex, INDEX_TYPE);
