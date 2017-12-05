"use strict";

const register = require('./index/register');
const Results = require('./Results');

/**
 * Information Retrieval System Main Class
 *
 * Basic workflow is:
 *
 * * create a new IRSystem
 * * add indices
 * * manage(add/remove/update)/retrive document collection/sets
 *
 * or:
 *
 * * create a new IRSystem with saved state from another IRSystem
 * * manage(add/remove/update)/retrive documents
 *
 */
class System
{
  /**
   * Construct new IR system.
   *
   * @param {IRSystem} [config={}] configuration/state. Can be result of state(). See attributes.
   */
  constructor(config = {})
  {
    for (let property in config)
    {
      /** @private */
      this[property] = config[property];
    }
    /**
     * id field name
     * @type {string}
     */
    this.idField = this.idField || 'id';

    /**
     * list of ids
     * index -> id
     * @private
     */
    this.ids = this.ids || [];
    /**
     * id lookup
     * id => index
     * @private
     */
    this.idLookup = this.idLookup || {};
    // rebuild ids table
    this.ids.forEach((id, index) => this.idLookup[id] = index);
    /**
     * name => index
     * @private
     */
    this.indicesLookup = {};
    /**
     * system indices
     * @type {Index[]}
     */
    this.indices = (this.indices || [])
      .map(object =>
      {
        object = new(register.lookup[object.type])(object);
        if (object.name)
        {
          (this.indicesLookup[object.name] || (this.indicesLookup[object.name] = []))
          .push(object);
        }
        for (let filter of object.filters)
        {
          (this.indicesLookup[filter] || (this.indicesLookup[filter] = []))
          .push(object);
        }
        return object;
      });
  }

  /**
   * Dump current system state
   * @return {object}
   */
  async state()
  {
    return {
      idField: this.idField,
      ids: this.ids,
      indices: await Promise.all(this.indices.map(index => index.state()))
    };
  }

  /**
   * Add a new index to the system.
   * @return {IRSystem}
   */
  addIndex(index)
  {
    this.indices.push(index);
    if (index.name)
    {
      (this.indicesLookup[index.name] || (this.indicesLookup[index.name] = []))
      .push(index);
    }
    for (let filter of index.filters)
    {
      (this.indicesLookup[filter] || (this.indicesLookup[filter] = []))
      .push(index);
    }
    return this;
  }

  /**
   * Add a set of documents to the IR system.
   *
   * Documents are added and removed in bulk for abusing any potential
   * optimisations which might be available for doing things in bulk.
   *
   * @param {Document[]} documents document set to add
   */
  async addDocuments(documents = [])
  {
    const documentIndices = documents.map(this.helperGetIndex.bind(this));
    for (let index of this.indices)
    {
      await index.addDocuments(documentIndices, documents);
    }
  }

  /**
   * Remove a set of documents from the IR system.
   * @param {Document[]} documents document set to add
   */
  async removeDocuments(documents = [])
  {
    const documentIndices = documents.map(this.helperGetIndex.bind(this));
    for (let index of this.indices)
    {
      await index.removeDocuments(documentIndices);
    }
    this.helperRemoveIndices(documentIndices);
  }

  /**
   * Alias of addDocuments.
   *
   * Add is the same as update in this system.
   *
   * @param {Document[]} documents document set to add
   */
  updateDocuments(documents = [])
  {
    return this.addDocuments(documents);
  }

  /**
   * Retrieve a list of documents that matches a query.
   * @param {Query} query query
   * @return {Document[]} retrieve
   */
  async retrieveDocuments(query)
  {
    if (query && query.filter)
    {
      const results = (await this.getResults(query.filter))
        .normalise(this);
      this.postProcessResults(query, results);
      return results;
    }
    return {};
  }

  async postProcessResults(query, results)
  {
    try
    {
      let sort = query.sort ? query.sort : 'score';
      // load sort value if not score
      if (sort !== 'score')
      {
        try
        {
          const index = this.indicesLookup[sort][0];
          results.results.forEach(result =>
          {
            result[sort] = index.getSortValue(result._index);
          });
        }
        catch (e)
        {
          sort = 'score';
        }
      }
      results.results.sort(this.sortFunction(sort, query.order));
      results.results.forEach(result =>
      {
        result._index = undefined;
      })
    }
    catch (e)
    {
      console.error(e.stack)
    }
  }

  sortFunction(sort, sortOrder)
  {
    const idField = this.idField;
    const order = sort === 'score' ? 1 : (sortOrder === 'asc' ? -1 : 1);
    return (a, b) =>
    {
      const asort = a[sort],
        bsort = b[sort];
      if (asort === bsort)
      {
        // document ids are assumed to never be equal
        // when sorts are equal, order by document ids
        // they could mean something. e.g. file path or omething
        if (a[idField] > b[idField])
        {
          return 1;
        }
        else
        {
          return -1;
        }
      }
      else if (bsort > asort)
      {
        return order;
      }
      else
      {
        return -order;
      }
    };
  }

  /**
   * @protected
   */
  async getResults(filter)
  {
    switch (filter.filter)
    {
    case 'and':
      return await this.getAndResults(filter.values);
    case 'or':
      return await this.getOrResults(filter.values);
    case 'not':
      return await this.getNotResults(filter.values);
    default:
      return await this.getFilterResults(filter);
    }
  }

  async getFilterResults(filter)
  {
    let results = new Results();
    for (let index of (this.indicesLookup[filter.field || filter.filter] || []))
    {
      const newResults = await index.filterDocuments(filter);
      results = results.concat(newResults);
    }
    return results;
  }

  /**
   * @protected
   */
  async getAndResults(values)
  {
    let results = undefined;
    for (let filter of values)
    {
      let filterResults = await this.getFilterResults(filter);
      if (!results)
      {
        results = filterResults;
      }
      else
      {
        results = results.merge(filterResults);
      }
    }
    return results;
  }

  /**
   * @protected
   */
  async getOrResults(values)
  {
    let results = new Results();
    for (let filter of values)
    {
      let filterResults = await this.getFilterResults(filter);
      results = results.concat(filterResults);
    }
    return results;
  }

  /**
   * @protected
   */
  async getNotResults(filter)
  {
    const results = await this.getFilterResults(filter);
    return results.invert(this.ids);
  }

  /**
   * @protected
   */
  helperGetIndex(record)
  {
    const id = record[this.idField];
    let lookup = this.idLookup[id];
    if (lookup === undefined)
    {
      lookup = this.ids.indexOf(null);
      if (lookup === -1)
      {
        lookup = this.ids.length;
      }
      this.idLookup[id] = lookup
      this.ids[lookup] = id
    }
    return lookup;
  }


  helperRemoveIndices(indices)
  {
    indices.forEach(index =>
    {
      const id = this.ids[index];
      delete this.idLookup[id];
      this.ids[index] = null;
    })
  }

  /**
   * @public
   */
  meta()
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
    const meta = {
      fields,
      sort
    };
    return meta;
  }

}

module.exports = System;
