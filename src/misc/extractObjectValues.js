"use strict";

function extractAllValues(callback, value, field, scale)
{
  let type = typeof value;
  if (type === 'undefined' || value === null)
  {
    return;
  }
  if (type === 'object')
  {
    if (Array.isArray(value))
    {
      for (let part of value)
      {
        extractAllValues(callback, part, field, scale);
      }
      return;
    }
    else
    {
      for (let part of Object.values(value))
      {
        extractAllValues(callback, part, field, scale);
      }
      return
    }
  }
  callback(value, field, scale);
}

function extractFragmentValues(callback, document, fragment, field, scale)
{
  if (fragment.length === 0)
  {
    return extractAllValues(callback, document, field, scale);
  }
  let top = fragment.splice(0, 1)[0];
  if (!document)
  {
    return;
  }
  let value = document[top];
  let type = typeof value;
  if (type === 'object' && Array.isArray(value))
  {
    for (let part of value)
    {
      extractFragmentValues(callback, part, fragment.slice(), field, scale);
    }
    return;
  }
  return extractFragmentValues(callback, value, fragment, field, scale);
}


/**
 * extract values from a document object
 *
 * @param  {object} document target document
 * @param  {object} fields   array of fields or map of fields to score
 * @param  {function} callback callback function will be called for each value
 */
function extractObjectValues(document, fields, callback)
{
  if (Array.isArray(fields))
  {
    for (let field of fields)
    {
      extractFragmentValues(callback, document, field.split('.')
        .filter(x => x !== ''), field, 1);
    }
  }
  else
  {
    for (let [field, scale] of Object.entries(fields))
    {
      extractFragmentValues(callback, document, field.split('.')
        .filter(x => x !== ''), field, scale);
    }
  }
}

module.exports = extractObjectValues;
