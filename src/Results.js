"use strict";

// const META = Symbol.for('meta');
// const EXTRA = Symbol.for('extra');

class Results
{
  constructor()
  {
    // this[META] = {};
    // this[EXTRA] = {};
  }

  addHit(index, hit)
  {
    this[index] = (this[index] || 0) + hit;
  }

  concat(results)
  {
    for (let entry of Object.entries(results))
    {
      this[entry[0]] = (this[entry[0]] || 0) + entry[1];
    }
    return this;
  }

  normalise(config)
  {
    const idField = config.idField;
    const ids = config.ids;
    const results = [];
    for (let entry of Object.entries(this))
    {
      results.push({
        index: config.ids[entry[0]],
        [idField]: ids[entry[0]],
        search: entry[1]
      });
    }
    return {
      results
    };
  }
}

module.exports = Results;
