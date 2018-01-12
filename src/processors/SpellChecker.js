"use strict";

const Processor = require('./Processor');

const PROCESSOR_TYPE = 'spellchecker';

class SpellChecker extends Processor
{
  constructor(config = {})
  {
    super(config, PROCESSOR_TYPE, ['results']);
  }
}

module.exports = SpellChecker;
// register type for serialisation
require('./register')
  .add(SpellChecker, PROCESSOR_TYPE);
