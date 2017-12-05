"use strict";

const assert = require('assert');
const Parser = require('./StringQueryParser');

describe(`System`, function ()
{
  const config = {
    fields: {
      text: {
        default: true,
        filters: [
          'default',
          'custom',
          'defaultexact',
        ]
      },
      nonText: {
        filters: [
          'ndefault',
          'ncustom'
        ]
      }
    },
    sorts: [
      'sorta'
    ]
  };
  const testCases = [{
    config,
    input: '\n\nZM0G \t "keybo4rd" cat  is l33t\r\n 💩 -poop ',
    output: {
      "filter": {
        "filter": "and",
        "values": [

          {
            "filter": "default",
            "field": "text",
            "values": [
              "ZM0G"
            ]
          }, {
            "filter": "defaultexact",
            "field": "text",
            "values": [
              "keybo4rd"
            ]
          }, {
            "filter": "default",
            "field": "text",
            "values": [
              "cat",
              "is",
              "l33t"
            ]
          }, {
            "filter": "not",
            "values": {
              "filter": "default",
              "field": "text",
              "values": [
                "poop"
              ]
            }
          }
        ]
      },
      "sort": false,
      "order": "asc"
    }
  }, {
    config,
    input: 'not A and B OR C',
    output: {
      "filter": {
        "filter": "or",
        "values": [{
          "filter": "and",
          "values": [{
            "filter": "not",
            "values": {
              "filter": "default",
              "field": "text",
              "values": [
                "A"
              ]
            }
          }, {
            "filter": "default",
            "field": "text",
            "values": [
              "B"
            ]
          }]
        }, {
          "filter": "default",
          "field": "text",
          "values": [
            "C"
          ]
        }]
      },
      "sort": false,
      "order": "asc"
    }
  }, {
    config,
    input: 'nonText:ncustom:"xxx"',
    output: {
      "filter": {
        "filter": "ncustom",
        "field": "nonText",
        "values": [
          "xxx"
        ]
      },
      "sort": false,
      "order": "asc"
    }
  }, {
    config,
    input: 'nonText:xxx',
    output: {
      "filter": {
        "filter": "ndefault",
        "field": "nonText",
        "values": [
          "xxx"
        ]
      },
      "sort": false,
      "order": "asc"
    }
  }, {
    config,
    input: 'nonText:-xxx',
    output: {
      "filter": {
        "filter": "not",
        "values": {
          "filter": "ndefault",
          "field": "nonText",
          "values": [
            "xxx"
          ]
        }
      },
      "sort": false,
      "order": "asc"
    }
  }, {
    config,
    input: 'and',
    output: {
      "filter": [],
      "sort": false,
      "order": "asc"
    }
  }, {
    config,
    input: 'or',
    output: {
      "filter": [],
      "sort": false,
      "order": "asc"
    }
  }, {
    config,
    input: 'X or',
    output: {
      "filter": {
        "field": "text",
        "filter": "default",
        "values": [
          "X"
        ]
      },
      "sort": false,
      "order": "asc"
    }
  }, {
    config,
    input: 'or X',
    output: {
      "filter": {
        "field": "text",
        "filter": "default",
        "values": [
          "X"
        ]
      },
      "sort": false,
      "order": "asc"
    }
  }, {
    config,
    input: '',
    output: {
      "filter": [],
      "sort": false,
      "order": "asc"
    }
  }, {
    config,
    input: 'not',
    output: {
      "filter": [],
      "sort": false,
      "order": "asc"
    }
  }, {
    config,
    input: '-X',
    output: {
      "filter": {
        "filter": "not",
        "values": {
          "filter": "default",
          "field": "text",
          "values": [
            "X"
          ]
        }
      },
      "sort": false,
      "order": "asc"
    }
  }, {
    config,
    input: 'sort:xxx order:asc',
    output: {
      "filter": [],
      "sort": false,
      "order": "asc"
    }
  }, {
    config,
    input: 'sort:sorta',
    output: {
      "filter": [],
      "sort": 'sorta',
      "order": "asc"
    }
  }, {
    config,
    input: 'sort:sorta order:dsc',
    output: {
      "filter": [],
      "sort": 'sorta',
      "order": "dsc"
    }
  }, {
    config,
    input: 'a and b and c',
    output: {
      "filter": {
        "filter": "and",
        "values": [{
          "filter": "default",
          "field": "text",
          "values": [
            "a"
          ]
        }, {
          "filter": "default",
          "field": "text",
          "values": [
            "b"
          ]
        }, {
          "filter": "default",
          "field": "text",
          "values": [
            "c"
          ]
        }]
      },
      "sort": false,
      "order": "asc"
    }
  }, {
    config,
    input: 'acid:rain',
    output: {
      "filter": [],
      "sort": false,
      "order": "asc"
    }
  }, {
    config,
    input: 'text:acid:rain',
    output: {
      "filter": [],
      "sort": false,
      "order": "asc"
    }
  }, {
    config,
    input: '33.33',
    output: {

      "filter": {
        "filter": "default",
        "field": "text",
        "values": [
          "33.33"
        ]
      },
      "sort": false,
      "order": "asc"
    }
  }, {
    config,
    input: '-33.33e-33',
    output: {

      "filter": {
        "filter": "default",
        "field": "text",
        "values": [
          "-33.33e-33"
        ]
      },
      "sort": false,
      "order": "asc"
    }
  }];

  testCases.forEach((testCase, testCaseIndex) =>
  {
    it(`${testCaseIndex}: ${JSON.stringify(testCase.config).substr(0, 20)}... ${JSON.stringify(testCase.input).substr(0, 20)}...`, function ()
    {
      const parser = new Parser(testCase.config);
      const result = parser.parse(testCase.input);
      // console.log(JSON.stringify(result, null, 2))
      assert.deepEqual(result, testCase.output);
    });
  });

});
