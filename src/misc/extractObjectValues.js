"use strict";

function extractAllValues(callback, value)
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
        extractAllValues(callback, part);
      }
      return;
    }
    else
    {
      for (let part of Object.values(value))
      {
        extractAllValues(callback, part);
      }
      return
    }
  }
  callback(value);
}

function extractFragmentValues(callback, document, fragment)
{
  if (fragment.length === 0)
  {
    return extractAllValues(callback, document);
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
      extractFragmentValues(callback, part, fragment.slice());
    }
    return;
  }
  return extractFragmentValues(callback, value, fragment);
}

function extractObjectValues(document, fields, callback)
{
  for (let field of fields)
  {
    extractFragmentValues(callback, document, field.split('.')
      .filter(x => x !== ''));
  }
}

module.exports = extractObjectValues;
