"use strict";

/**
 * A Processor
 */
class Processor
{
  /**
   * Construct a new Processor
   *
   * @param {object} [config={}] configuration; see properties
   */
  constructor(config = {}, type = undefined, bind = [])
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
    this.type = this.type || type;
    this.bind = this.bind || bind;
    if (!this.type || !this.bind)
    {
      throw new Error('Type or bind not specified');
    }
  }

  /**
   * Dump current index state.
   * @return {object}
   */
  async state()
  {
    return {
      type: this.type,
      bind: this.bind,
    };
  }


  /**
   * for classes with bind 'add'
   */
  async addDocuments(system, documentIndices, documents)
  {}

  /**
   * for classes with bind 'remove'
   */
  async removeDocuments(system, documentIndices)
  {}

  /**
   * for classes with bind 'query'
   */
  async processQuery(system, query)
  {}

  /**
   * for classes with bind 'results'
   */
  async processResults(system, query, results)
  {}

}

module.exports = Processor;
