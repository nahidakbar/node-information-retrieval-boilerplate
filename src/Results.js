"use strict";

/**
 * Search Results
 */
class Results
{
  constructor()
  {
    this.keywords = [];
    this.results = {};
  }

  addHit(index, hit)
  {
    this.results[index] = (this.results[index] || 0) + hit;
  }

  addKeyword(keyword, hits)
  {
    this.keywords.push({
      keyword,
      hits
    });
  }

  concat(results)
  {
    for (const [index, score] of Object.entries(results.results))
    {
      this.results[index] = (this.results[index] || 0) + score;
    }
    if (this.keywords.length)
    {
      this.keywords.push({
        keyword: 'or'
      });
    }
    this.keywords = this.keywords.concat(results.keywords)
    return this;
  }

  merge(results)
  {
    for (const index of Object.keys(this.results))
    {
      if (!results.results[index])
      {
        delete this.results[index];
      }
    }
    for (const [index, score] of Object.entries(results.results))
    {
      if (this.results[index])
      {
        this.results[index] = this.results[index] * score;
      }
    }
    if (this.keywords.length)
    {
      this.keywords.push({
        keyword: 'and'
      });
    }
    this.keywords = this.keywords.concat(results.keywords)
    return this;
  }

  invert(indices)
  {
    for (let index = 0; index < indices.length; index++)
    {
      if (indices[index] !== null)
      {
        if (this.results[index])
        {
          delete this.results[index]
        }
        else
        {
          this.results[index] = 1;
        }
      }
      else
      {
        delete this.results[index]
      }
    }
    return this;
  }

  normalise(config)
  {
    const idField = config.idField;
    const ids = config.ids;
    const results = [];
    for (const [index, score] of Object.entries(this.results))
    {
      results.push({
        _index: index,
        [idField]: ids[index],
        score: score
      });
    }
    const keywords = this.keywords;
    return {
      keywords,
      results
    };
  }
}

module.exports = Results;
