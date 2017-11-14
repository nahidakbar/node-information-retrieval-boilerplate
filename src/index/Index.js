"use strict";

const extractObjectdValues = require('./extractObjectdValues');

class Index
{
  constructor(config = {}, type = undefined)
  {
    for (let property in config)
    {
      this[property] = config[property];
    }
    this.type = this.type || type || 'none';
    this.fields = this.fields || [];
    this.values = this.values || {};
    this.filters = this.filters || [];
    this.sorts = this.sorts || [];
    // TODO: xxx
    this.entropy = this.entropy || 0;
  }

  async dumpConfig()
  {
    const name = this.name;
    const type = this.type;
    const fields = this.fields;
    const values = this.values
    const index = this.index;
    const filters = this.filters;
    const sorts = this.sorts;
    const entropy = this.entropy;
    return {name, type, fields, values, index, filters, sorts, entropy};
  }

  async addRecords(records)
  {
    await this.makeSureIndexExists();
    await this.removeExistingValues(records);
    await this.addRecordsToIndex(records);
  }

  async removeRecords(records)
  {
    await this.removeExistingValues(records);
  }

  async makeSureIndexExists()
  {
    if (!this.index)
    {
      this.index = await this.createIndex();
    }
  }
  async removeExistingValues(records)
  {
    let values = records.map(record =>
    {
      return this.values[record[0]];
    });
    await this.removeFromIndex(this.index, records, values);
    records.forEach(record =>
    {
      delete this.values[record[0]];
    });
  }

  async addRecordsToIndex(records)
  {
    let recordValues = await this.getValues(records);
    let analysed = await this.analyseValues(recordValues);
    await this.addToIndex(this.index, records, analysed);
    records.forEach((record, index) =>
    {
      this.values[record[0]] = analysed[index];
    });
  }

  async getValues(records)
  {
    return records.map(record =>
    {
      return this.getRecordValues(record[1]);
    });
  }

  getRecordValues(record)
  {
    return extractObjectdValues(record, this.fields);
  }

  async analyseValues(values)
  {
    return values.map(row =>
    {
      let total = {};
      for (let value of row)
      {
        total[value] = total[value] || 0;
        total[value]++;
      }
      return total;
    });
  }

  searchRecords(filter, results)
  {
    this.searchInIndex(this.index, filter, results);
  }

  async createIndex()
  {
    return {}
  }

  async addToIndex(index, records, values)
  {
    throw new Error('TODO: addToIndex');
  }

  async removeFromIndex(index, records, values)
  {
    throw new Error('TODO: removeFromIndex');
  }

}

module.exports = Index;
