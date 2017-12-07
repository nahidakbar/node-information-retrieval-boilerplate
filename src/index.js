"use strict";

module.exports = require('./index/register');

require('./index/BooleanIndex');
require('./index/NumberIndex');
require('./index/StringIndex');
require('./index/TextIndex');

module.exports.processor = require('./processor/register');

module.exports.System = require('./System');

module.exports.StringQueryParser = require('./query/StringQueryParser');
