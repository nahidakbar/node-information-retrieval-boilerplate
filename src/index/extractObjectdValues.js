"use strict";

function extractAllValues(values, value)
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
        extractAllValues(values, part);
      }
      return;
    }
    else
    {
      for (let part of Object.values(value))
      {
        extractAllValues(values, part);
      }
      return
    }
  }
  values.push(value);
}

function extractFragmentValues(values, record, fragment)
{
  if (fragment.length === 0)
  {
    return extractAllValues(values, record);
  }
  let top = fragment.splice(0, 1)[0];
  if (!record)
  {
    return;
  }
  let value = record[top];
  let type = typeof value;
  if (type === 'object' && Array.isArray(value))
  {
    for (let part of value)
    {
      extractFragmentValues(values, part, fragment.slice());
    }
    return;
  }
  return extractFragmentValues(values, value, fragment);
}

function extractObjectdValues(record, fields)
{
  let values = [];
  for (let field of fields)
  {
    extractFragmentValues(values, record, field.split('.').filter(x => x !== ''));
  }
  return values;
}

module.exports = extractObjectdValues;
