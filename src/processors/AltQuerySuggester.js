"use strict";

const Processor = require('./Processor');
const extractObjectValues = require('../misc/extractObjectValues');
const levenshtein = require('fast-levenshtein')

const PROCESSOR_TYPE = 'altquery';

class AltQuerySuggester extends Processor
{
  constructor(config = {})
  {
    super(config, PROCESSOR_TYPE, ['add', 'results']);
    this.fields = this.fields || [];
    this.words = this.words || {};
  }

  async state()
  {
    return Object.assign({
      fields: this.fields,
      words: this.words,
    }, await super.state());
  }

  async addDocuments(system, documentIndices, documents)
  {
    const words = this.words;
    for (const document of documents)
    {
      extractObjectValues(document, this.fields, (newValue, field, scale) =>
      {
        if (typeof newValue === 'string')
        {
          newValue = newValue.toLowerCase()
            .replace(/[^a-z]+/g, ' ')
            .trim();
          if (newValue)
          {
            for (let word of newValue.split(/\s+/g))
            {
              words[word] = words[word] || 0;
              words[word]++;
            }
          }
        }
      });
    }
  }

  async processResults(system, query, results)
  {
    results.altKeywords = [results.keywords.map(kw =>
      {
        const
        {
          keyword,
          hits
        } = kw;
        if (hits)
        {
          return keyword;
        }
        else if (keyword === 'and')
        {
          return 'and'
        }
        else if (keyword === 'or')
        {
          return 'or'
        }
        else
        {
          return this.getClosest(keyword);
        }
      })
      .filter(i => i)
      .join(' ')
    ].filter(i => i);
  }

  getClosest(word)
  {
    let closest, closestDiff = 100;
    const dist = levenshtein.get.bind(levenshtein);
    for (const target of Object.keys(this.words))
    {
      const diff = dist(word, target) / Math.min(word.length, target.length);
      if (diff < closestDiff)
      {
        closestDiff = diff;
        closest = target;
      }
    }
    return closest;
  }

}

module.exports = AltQuerySuggester;
// register type for serialisation
require('./register')
  .add(AltQuerySuggester, PROCESSOR_TYPE);
