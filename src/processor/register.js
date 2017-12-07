"use strict";

const lookup = {};

function add(Type, type)
{
  lookup[type] = Type
  Type.type = type;
}

module.exports = {
  lookup,
  add
};
