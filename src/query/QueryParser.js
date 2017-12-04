"use strict";

/**
 * Helper functionality for parsing query representes
 * in different formats into the one this package supports.
 */
class QueryParser
{
  constructor(config)
  {
    for (let property in config)
    {
      /** @private */
      this[property] = config[property];
    }

    this.fields = this.fields || {};
    this.sorts = this.sorts || [];

    // figure out a default field
    if (!this.defaultField)
    {
      for (let [field, body] of Object.entries(this.fields))
      {
        if (body.default)
        {
          this.defaultField = field;
          break;
        }
      }
    }
    this.defaultField = this.defaultField || Object.keys(this.fields)[0];
    if (!this.defaultField)
    {
      throw new Error('Could not determine default field');
    }
    this.defaultFilter = this.fields[this.defaultField].filters[0];
    this.defaultExactFilter = this.defaultFilter + 'exact';
    this.defaultSort = this.defaultSort || false;
    this.defaultSortOrder = this.defaultSortOrder || 'asc';
  }

  getDefault()
  {
    return {
      filter: [],
      sort: this.defaultSort,
      order: this.defaultSortOrder,
    };
  }

}

module.exports = QueryParser;
