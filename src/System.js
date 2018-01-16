"use strict";

const indicesRegister = require('./index/register');
const processorRegister = require('./processors/register');
const Results = require('./Results');
const scores = require('./scores');
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
        object = new(indicesRegister.lookup[object.type])(object);
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

    this.processorsLookup = {};
    /**
     * system processors
     * @type {Processor[]}
     */
    this.processors = (this.processors || [])
      .map(object =>
      {
        object = new(processorRegister.lookup[object.type])(object);
        for (let bind of object.bind)
        {
          this.processorsLookup[bind] = this.processorsLookup[bind] || [];
          this.processorsLookup[bind].push(object);
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
      indices: await Promise.all(this.indices.map(index => index.state())),
      processors: await Promise.all(this.processors.map(processor => processor.state())),
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

  addProcessor(processor)
  {
    this.processors.push(processor);
    for (let bind of processor.bind)
    {
      this.processorsLookup[bind] = this.processorsLookup[bind] || [];
      this.processorsLookup[bind].push(processor);
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
    for (let processor of (this.processorsLookup['add'] || []))
    {
      await processor.addDocuments(this, documentIndices, documents);
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
    for (let processor of (this.processorsLookup['remove'] || []))
    {
      await processor.removeDocuments(this, documentIndices);
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
  async retrieveDocuments(query, score = scores.naiveBayes)
  {
    if (query && query.filter)
    {
      for (let processor of (this.processorsLookup['query'] || []))
      {
        await processor.processQuery(this, query);
      }
      const results = (await this.getResults(query.filter, score))
        .normalise(this);
      for (let processor of (this.processorsLookup['results'] || []))
      {
        await processor.processResults(this, query, results);
      }
      return results;
    }
    return {};
  }

  /**
   * @protected
   */
  async getResults(filter, score)
  {
    switch (filter.filter)
    {
    case 'and':
      return await this.getAndResults(filter.values, score);
    case 'or':
      return await this.getOrResults(filter.values, score);
    case 'not':
      return await this.getNotResults(filter.values, score);
    default:
      return await this.getFilterResults(filter, score);
    }
  }

  async getFilterResults(filter, score)
  {
    let results = new Results();
    for (let index of (this.indicesLookup[filter.field || filter.filter] || []))
    {
      const newResults = new Results();
      await index.filterDocuments(filter, newResults, score);
      results = results.concat(newResults);
    }
    return results;
  }

  /**
   * @protected
   */
  async getAndResults(values, score)
  {
    let results = undefined;
    for (let filter of values)
    {
      let filterResults = await this.getResults(filter, score);
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
  async getOrResults(values, score)
  {
    let results = new Results();
    for (let filter of values)
    {
      let filterResults = await this.getResults(filter, score);
      results = results.concat(filterResults);
    }
    return results;
  }

  /**
   * @protected
   */
  async getNotResults(filter, score)
  {
    const results = await this.getFilterResults(filter, score);
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
