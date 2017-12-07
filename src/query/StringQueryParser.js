"use strict";

const QueryParser = require('./QueryParser');
const decoder = require('unidecode');

/**
 * Helper functionality for parsing query representes
 * in different formats into the one this package supports.
 */
class StringQueryParser extends QueryParser
{
  constructor(config = {})
  {
    super(config);
  }

  parse(query, maxTokns = 15)
  {
    const tokens = Array.from(this.tokenise(query.substr(0, maxTokns * 10)));

    // lets try some bottom up parsing
    this.parseJoinAllExactMatchTokens(tokens);
    this.parseJoinAllNotTokens(tokens);
    this.parseJoinAllFieldTokens(tokens);
    this.parseJoinAllRegularTokens(tokens);
    this.parseJoinAllAndOrTokens(tokens);
    const fresh = this.getDefault();
    fresh.filter = this.treeToFilters(fresh, {
      maxTokns
    }, [tokens, 'and']) || [];
    return fresh;
  }

  treeToFilters(fresh, config, tree)
  {
    config.tokenIndex = config.tokenIndex || 0;
    let [values, filter] = tree, field, index;
    switch (filter)
    {
    case 'and':
    case 'or':
      values = values.map(this.treeToFilters.bind(this, fresh, config))
        .filter(x => x);
      if (values.length === 0)
      {
        return undefined;
      }
      else if (values.length === 1)
      {
        return values[0];
      }
      else
      {
        return {
          filter,
          values
        };
      }
    case 'not':
      if (values)
      {
        values.splice(2, 0, ...tree.slice(2))
        values = this.treeToFilters(fresh, config, values);
        return {
          filter,
          values
        };
      }
      else
      {
        return;
      }
    case 'a':
    case 'exact':
      filter = tree[3] || (tree[2] && this.fields[tree[2]] && this.fields[tree[2]].filters[0]) || (filter === 'exact' ? this.defaultExactFilter : this.defaultFilter);
      field = tree[2] || this.defaultField;
      values = values.split(' ');
      if (field === 'sort')
      {
        fresh.sort = this.sorts.indexOf(values[0]) === -1 ? fresh.sort : values[0];
        return;
      }
      else if (field === 'order')
      {
        fresh.order = values[0].toLowerCase() === 'asc' ? 'asc' : 'dsc';
        return
      }
      else
      {
        if (!this.fields[field] && this.fields[this.defaultField].filters.indexOf(field) !== -1)
        {
          filter = field;
          field = this.defaultField;
        }
        if (!this.fields[field])
        {
          return
        }
        else if (this.fields[field].filters.indexOf(filter) === -1)
        {
          return
        }
        else if (config.tokenIndex > config.maxTokns)
        {
          return;
        }
        else
        {
          index = config.tokenIndex++;
          return {
            filter,
            field,
            values,
            index
          };
        }
      }
    default:
      console.log('UNHANDELLED', filter, values);
    }
  }

  parseJoinAllExactMatchTokens(tokens)
  {
    for (let i = 0; i < tokens.length; i++)
    {
      if (tokens[i][1] === '"')
      {
        tokens[i] = ['', 'exact'];
        while (i + 1 < tokens.length)
        {
          const next = tokens.splice(i + 1, 1)[0];
          if (next[1] !== '"')
          {
            tokens[i][0] += ' ' + next[0];
          }
          else
          {
            break;
          }
        }
        tokens[i][0] = tokens[i][0].trim();
      }
    }
  }

  parseJoinAllNotTokens(tokens)
  {
    for (let i = 0; i < tokens.length; i++)
    {
      if (tokens[i][1] === 'not')
      {
        let next = false;
        while (!next && i + 1 < tokens.length)
        {
          next = tokens.splice(i + 1, 1)[0];
        }
        tokens[i][0] = next;
      }
    }
  }

  parseJoinAllFieldTokens(tokens)
  {
    for (let i = 0; i < tokens.length; i++)
    {
      if (tokens[i][1] === ':' && i > 0 && i + 1 < tokens.length)
      {
        if (tokens[i - 1].length > 2)
        {
          tokens[i + 1].push(tokens[i - 1][2]);
        }
        tokens[i + 1].push(tokens[i - 1][0]);
        tokens.splice(--i, 2);
      }
    }
  }

  parseJoinAllRegularTokens(tokens)
  {
    for (let i = 1; i < tokens.length; i++)
    {
      const signature = tokens[i - 1][1] + tokens[i - 0][1];
      if (signature === 'aa' && tokens[i - 1].length === 2 && tokens[i - 0].length === 2)
      {
        tokens[i - 1][0] = tokens[i - 1][0] + ' ' + tokens[i - 0][0];
        tokens.splice(i--, 1)
      }
    }
  }

  parseJoinAllAndOrTokens(tokens)
  {
    for (let operator of ['and', 'or'])
    {
      for (let i = 0; i < tokens.length; i++)
      {
        if (tokens[i][1] === operator)
        {
          if (i > 0 && i + 1 < tokens.length)
          {
            if (tokens[i - 1][1] === operator)
            {
              tokens[i - 1][0].push(tokens[i + 1]);
            }
            else
            {
              tokens[i - 1] = [
                [tokens[i - 1], tokens[i + 1]], operator
              ];
            }
            tokens.splice(i--, 2);
          }
          else if (typeof tokens[i][0] === 'string')
          {
            tokens.splice(i--, 1);
          }
        }
      }
    }
  }

  /**
   * Probably the smallest tokeniser ever written
   */
  * tokenise(string)
  {
    for (let [char, class_] of this.lemmatise(string))
    {
      switch (class_)
      {
      case 'a':
        switch (char.toLowerCase())
        {
        case 'and':
          yield [char, 'and'];
          continue;
        case 'or':
          yield [char, 'or'];
          continue;
        case 'not':
          yield [char, 'not'];
          continue;
        }
        break;
      case '-':
        yield [char, 'not'];
        continue;
      case ' ':
        continue;
      case '0':
        yield [char, 'a'];
        continue;
      }
      yield [char, class_];
    }
  }

  * lemmatise(string)
  {
    let last = '';
    let lastClass = false;
    let tokens = Array.from(this.lex(string));
    for (let [char, class_] of tokens)
    {
      if (!lastClass)
      {
        [last, lastClass] = [char, class_];
      }
      else if (lastClass !== class_ && !(lastClass === 'a' && class_ === '0') && !(lastClass === '0' && char === 'e') && !(lastClass === '0' && char === '-'))
      {
        if (last === '-' && class_ === '0')
        {
          [last, lastClass] = [last + char, class_];
        }
        else
        {
          yield [last, lastClass];
          [last, lastClass] = [char, class_];
        }
      }
      else
      {
        last += char;
      }
    }
    if (last !== '')
    {
      yield [last, lastClass];
    }
  }

  * lex(string)
  {
    for (let char of decoder(string + '')
        .replace(/\s+/g, ' ')
        .trim())
    {
      yield [char, this.classifyChar(char)];
    }
  }

  classifyChar(char)
  {
    switch (char)
    {
      // whitespace
    case '"':
    case "'":
    case "(":
    case ")":
    case "[":
    case "]":
      return '"';
    case ':':
      return ':';
    case '-':
      return '-';
    default:
      if ((char >= 'A' && char <= 'Z') || (char >= 'a' && char <= 'z'))
      {
        return 'a'
      }
      else if ((char >= '0' && char <= '9') || (char === '.'))
      {
        return '0'
      }
      else
      {
        return ' ';
      }
    }
  }

}


module.exports = StringQueryParser;
