/**
 * @typedef {object} Query
 * @property {QueryFilter[]} filters
 * @property {string} sort sort field name
 * @property {string} order sort order 'asc' or 'dsc'
 */

/**
 * @typedef {object} QueryFilter
 * @property {string} field of field/index e.g. 'firstName'
 * @property {string} filter filter e.g. 'regex'
 * @property {string[]} values e.g. 'asdf.*'
 */
