"use strict";

module.exports = require('./index/register');

require('./index/BooleanIndex');
require('./index/NumberIndex');
require('./index/StringIndex');
require('./index/TextIndex');

module.exports.processors = require('./processors/register');
require('./processors/Sorter');

module.exports.System = require('./System');

module.exports.StringQueryParser = require('./query/StringQueryParser');

module.exports.scores = require('./scores');

module.exports.evaluate = require('./evaluate');
