"use strict";

const register = require('./index/register');

class Search
{
  constructor(config = [])
  {
    for (let property in config)
    {
      this[property] = config[property];
    }
    // id field
    this.idField = this.idField || 'id';
    this.ids = this.ids || [];
    this.idLookup = this.idLookup || {};
    this.ids.forEach((id, index) => this.idLookup[id] = index);
    this.nextId = this.nextId || this.ids.length;
    // indices
    this.indicesLookup = {};
    this.indices = (this.indices || [])
      .map(object =>
      {
        const Type = register.lookup[object.type];
        object = new Type(object);
        this.indicesLookup[object.name] = this.indicesLookup[object.name] || [];
        this.indicesLookup[object.name].push(object);
        return object;
      });
  }

  async dumpConfig()
  {
    const idField = this.idField;
    const ids = this.ids;
    const indices = [];
    for (let index of this.indices)
    {
      indices.push(await index.dumpConfig())
    }
    return {idField, ids, indices};
  }

  addIndex(index)
  {
    this.indices.push(index);
    if (!index.name)
    {
      index.name = index.filters[0];
    }
    this.indicesLookup[index.name] = this.indicesLookup[index.name] || [];
    this.indicesLookup[index.name].push(index);
  }

  async searchRecords(search)
  {
    if (search && search.filter && search.filter.length > 0)
    {
        if (search.filter.length > 1)
        {
          search.filter = {
            filter: 'and',
            values: search.filter
          }
        }
        else
        {
          search.filter = search.filter[0];
        }
        return this.toObjectResults(await this.getResults(search.filter));
    }
    return [];
  }

  toObjectResults(results)
  {
    let output = [];
    for (let resultIndex = 0; resultIndex < results.length; resultIndex++)
    {
      if (results[resultIndex] > 0)
      {
        output.push({
          id: this.ids[resultIndex],
          score: results[resultIndex]
        });
      }
    }
    return output;
  }

  async getResults(filter)
  {
    let results, resultIndex;
    switch (filter.filter)
    {
      case 'and':
      case 'or':
      case 'not':
        results = this.getResults(filter.value);
        throw new Error('not implemented');
        break;
      default:
        results = this.emptyResults();
        for (let index of (this.indicesLookup[filter.field || filter.filter] || []))
        {
           await index.searchRecords(filter, results);
        }
        return results;
     }
  }

  emptyResults()
  {
    const empty = new Float32Array(this.nextId);
    empty.fill(0);
    return empty;
  }

  async addRecords(records = [])
  {
    records = records.map(record =>
    {
      const id = this.helperGetId(record);
      return [id, record];
    });
    for (let index of this.indices)
    {
      await index.addRecords(records);
    }
  }

  async removeRecords(records = [])
  {
    records = records.map(record =>
    {
      const id = this.helperGetId(record);
      return [id];
    });
    for (let index of this.indices)
    {
      await index.removeRecords(records);
    }
  }

  /**
   * Alias of addRecords.
   */
  async updateRecords(records = [])
  {
    return await this.addRecords(records);
  }

  helperGetId(record)
  {
    const id = record[this.idField];
    let lookup = this.idLookup[id];
    if (lookup === undefined)
    {
      this.ids.push(id);
      lookup = this.idLookup[id] = this.nextId++;
    }
    return lookup;
  }

  dumpMeta()
  {
    const fields = {};
    let sort = {};
    for (let index of this.indices)
    {
      fields[index.name] = {
        filters: index.filters
      }
      index.sorts.forEach(key => sort[key] = 1);
    }
    sort = Object.keys(sort);
    const meta = {fields, sort};
    return meta;
  }

}

module.exports = Search;
