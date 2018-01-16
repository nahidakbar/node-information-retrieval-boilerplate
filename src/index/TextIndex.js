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
    this.totalWordsTally = config.totalWordsTally || 0;
    this.maximumDocumentsByTerm = config.maximumDocumentsByTerm || 0;
    this.sorts = [this.name];
    this.allowPartialMatch = this.allowPartialMatch || false;
  }

  async state()
  {
    return Object.assign(await super.state(), {
      totalWordsTally: this.totalWordsTally,
      maximumDocumentsByTerm: this.maximumDocumentsByTerm,
      allowPartialMatch: this.allowPartialMatch
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
      let words = {};
      let bagOfWords = {};
      let stemmedFull = {};
      let maximum = 0;
      for (let [original, scale] of valuesList)
      {
        let tokens = this.tag(this.lex(decoder(original)
          .toLowerCase()));
        tokens.forEach(token => token.push(this.stem(token[0])))
        for (let value of tokens)
        {
          const token = value[2];
          words[token] = words[token] || 0;
          words[token] += scale;
          count += scale;
          maximum = Math.max(words[token], maximum)
        }
        for (let tokenIndex = 1; tokenIndex < tokens.length; tokenIndex++)
        {
          const token = tokens[tokenIndex - 1][2] + tokens[tokenIndex][2];
          bagOfWords[token] = bagOfWords[token] || 0;
          bagOfWords[token] += 1;
          count += 1;
        }
        stemmedFull[tokens.map(token => token[2])
          .join(' ')] = 1;
      }
      stemmedFull = Object.keys(stemmedFull)
        .join(' ');
      return {
        stemmedFull,
        words,
        bagOfWords,
        count,
        maximum
      };
    }
    else
    {
      return {
        stemmedFull: '',
        words: {},
        bagOfWords: {},
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
      const analysed = documentsValues[valuesOffset];
      for (const [term, tally] of Object.entries(analysed.words))
      {
        index[term] = index[term] || {
          total: 0
        };
        index[term][documentIndex] = index[term][documentIndex] || 0;
        index[term][documentIndex] += tally
        index[term].total += tally;
      }
      for (const [term, tally] of Object.entries(analysed.bagOfWords))
      {
        index[term] = index[term] || {
          total: 0
        };
        index[term][documentIndex] = index[term][documentIndex] || 0;
        index[term][documentIndex] += tally
        index[term].total += tally;
      }
      this.totalWordsTally += analysed.count;
    });

    let maximumDocumentsByTerm = 0;
    for (const docs of Object.values(index))
    {
      maximumDocumentsByTerm = Math.max(maximumDocumentsByTerm, Object.keys(docs)
        .length - 1);
    }
    this.maximumDocumentsByTerm = maximumDocumentsByTerm;
  }

  /**
   * O(documentIndices)
   */
  async removeFromIndex(index, documentIndices, documentsValues)
  {
    documentIndices.forEach((documentIndex, valuesOffset) =>
    {
      let value = documentsValues[valuesOffset];
      if (value && value.words)
      {
        for (const [term, tally] of Object.entries(value.words))
        {
          index[term][documentIndex] -= tally
          index[term].total -= tally;
        }
        for (const [term, tally] of Object.entries(value.bagOfWords))
        {
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
    const analysed = this.analyseValue([
      [filter.values.join(' '), 1]
    ]);
    Object.entries(analysed.words)
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
                  this.totalWordsTally,
                  this.values.length,
                  all.length,
                  this.maximumDocumentsByTerm) * tally;
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
                  this.totalWordsTally,
                  this.values.length,
                  all.length,
                  this.maximumDocumentsByTerm) * tally;
              }
            }
          }
        }
        else
        {
          results.addKeyword(filter.values[keywordIndex], 0);
          if (!this.allowPartialMatch)
          {
            final = {};

          }
        }
      });
    Object.entries(analysed.bagOfWords)
      .map((keywordTally, keywordIndex, all) =>
      {
        const [keyword, tally] = keywordTally;
        let resultFragment = index[keyword];
        if (resultFragment && resultFragment.total > 0)
        {
          for (const [result, resultTally] of Object.entries(resultFragment))
          {
            if (result !== 'total')
            {
              const value = this.values[result];
              final[result] += score(resultTally,
                value.count,
                value.maximum,
                resultFragment.total,
                this.totalWordsTally,
                this.values.length,
                all.length,
                this.maximumDocumentsByTerm) * tally;
            }
          }
        }
      });
    if (final)
    {
      if (exact)
      {
        exact = new RegExp(analysed.values, 'ig')
      }
      for (let [result, resultTally] of Object.entries(final))
      {
        if (exact)
        {
          try
          {
            const match = this.values[result].stemmedFull.match(exact);
            if (match && match.length)
            {
              resultTally *= match.length
            }
          }
          catch (e)
          {
            console.log(e.stack)
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
    return this.values[index].stemmedFull
  }

}

module.exports = TextIndex;
require('./register')
  .add(TextIndex, INDEX_TYPE);
