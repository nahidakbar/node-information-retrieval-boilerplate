"use strict";

const Results = require('../Results');

/**
 * An index
 */
class Index
{
  /**
   * Construct a new Index
   *
   * @param {object} [config={}] configuration; see properties
   */
  constructor(config = {}, type = undefined)
  {
    for (let property in config)
    {
      /**
       * @private
       */
      this[property] = config[property];
    }
    /**
     * Type of index.
     * These are usually predefined values. Filled in by class.
     * @type {string}
     */
    this.type = this.type || type || 'none';
    /**
     * List of fields it should index.
     * @type {string[]}
     */
    this.fields = this.fields || [];
    /**
     * List of field values by index.
     * These values are used to add/remove documents from index and also used for sorting.
     * @protected
     * @type {string}
     */
    this.values = this.values || [];
    /**
     * List of filters supported.
     * These are usually predefined values. Filled in by class.
     * @type {string}
     */
    this.filters = this.filters || [];
    /**
     * Actual Index.
     * Format depends on type of index. Override createIndex();
     * @type {object}
     */
    this.index = this.index || false;

    /**
     * Field values this index can supply for sorting.
     * @type {string}
     */
    this.sorts = this.sorts || [];

    /**
     * Information gain.
     * TODO: should determine which field to query first etc.
     * @type {number}
     */
    this.entropy = this.entropy || 0;
  }

  /**
   * Dump current index state.
   * @return {object}
   */
  async state()
  {
    return {
      name: this.name,
      type: this.type,
      fields: this.fields,
      values: this.values,
      index: this.index,
      filters: this.filters,
      sorts: this.sorts,
      entropy: this.entropy
    };
  }

  /**
   * Adds a set of documents to Index
   *
   * @param {number[]} documentIndices Index of document ids in the list of ids. Indices must store document data by this index.
   * @param {Document[]} documents Actual documents.
   */
  async addDocuments(documentIndices, documents)
  {
    await this.makeSureIndexExists();
    await this.removeExistingValues(documentIndices);
    await this.addDocumentsToIndex(documentIndices, documents);
  }

  /**
   * Removes a set of documents from Index
   * @param {number[]} documentIndices Index of document ids in the list of ids. Indices must store document data by this index.
   */
  async removeDocuments(documentIndices)
  {
    await this.removeExistingValues(documentIndices);
  }

  /**
   * Filter results based on query
   *
   * @param {QueryFilter} queryFilter query to filter with
   * @param {Results} results results to filter (modify results object)
   */
  filterDocuments(queryFilter, results = new Results(), score)
  {
    return this.filterBasedOnIndex(this.index, queryFilter, results, score);
  }

  /**
   * @private
   */
  async makeSureIndexExists()
  {
    if (!this.index)
    {
      this.index = await this.createIndex();
    }
  }

  /**
   * @private
   */
  async removeExistingValues(documentIndices)
  {
    const values = documentIndices.map(index => this.values[index]);
    await this.removeFromIndex(this.index, documentIndices, values);
    documentIndices.forEach(index => this.values[index] = null);
  }

  /**
   * @private
   */
  async addDocumentsToIndex(documentIndices, documents)
  {
    let documentsValues = documents.map(this.getDocumentValues.bind(this));
    let analysed = await this.analyseValues(documentsValues);
    await this.addToIndex(this.index, documentIndices, analysed);
    documentIndices.forEach((index, i) => this.values[index] = analysed[i]);
  }

  /**
   * Extract values out of a document object.
   *
   * It is set up like this so that we can override this method and filter
   * the values we don't like.
   *
   * @example
   * {field: ['a', 'b']} should return ['a', 'b']
   * @protected
   * @param {Document} document
   * @return {object[]}
   */
  getDocumentValues(document)
  {
    throw new Error('Abstract')
  }

  /**
   * Processing before adding to index.
   *
   * By default, it turns list of objects into a map of string representation
   * of the objects to their occurance tally.
   *
   * @protected
   * @param {object[][]} values list of values for each documents
   * @return {object[][]}
   */
  analyseValues(values)
  {
    return values.map(this.analyseValue.bind(this));
  }

  analyseValue(row)
  {
    let total = {};
    for (let value of row)
    {
      total[value] = total[value] || 0;
      total[value]++;
    }
    return total;
  }

  /**
   * Create an empty index.
   * @protected
   * @return {IndexImplementation} default is {}
   */
  createIndex()
  {
    throw new Error('TODO: createIndex is not implemented');
  }

  /**
   * Add to index.
   * @abstract
   * @param {IndexImplementation} index
   * @param {number[]} documentIndices
   * @param {string[][]} documentValues
   */
  addToIndex(index, documentIndices, documentValues)
  {
    throw new Error('TODO: addToIndex is not implemented');
  }

  /**
   * Remove from index
   * @abstract
   * @param {IndexImplementation} index
   * @param {number[]} documentIndices
   * @param {string[][]} documentValues
   */
  removeFromIndex(index, documentIndices, documentValues)
  {
    throw new Error('TODO: removeFromIndex is not implemented');
  }

  /**
   * Filter results based on index
   * @abstract
   * @param {IndexImplementation} index
   * @param {QueryFilter} queryFilter
   * @param {Results} results
   */
  filterBasedOnIndex(index, queryFilter, results)
  {
    throw new Error('TODO: filterBasedOnIndex is not implemented');
  }

}

module.exports = Index;
