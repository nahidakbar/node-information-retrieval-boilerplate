"use strict";

// const META = Symbol.for('meta');
// const EXTRA = Symbol.for('extra');

class Results
{
  constructor()
  {
    // this[META] = {};
    // this[EXTRA] = {};
    this.results = {};
  }

  addHit(index, hit)
  {
    this.results[index] = (this.results[index] || 0) + hit;
  }

  concat(results)
  {
    for (const [index, score] of Object.entries(results.results))
    {
      this.results[index] = (this.results[index] || 0) + score;
    }
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
    return {
      results
    };
  }
}

module.exports = Results;
