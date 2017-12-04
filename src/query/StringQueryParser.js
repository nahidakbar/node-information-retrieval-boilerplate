"use strict";

const QueryParser = require('./QueryParser');

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

  parse(query)
  {
    const tokens = Array.from(this.tokenise(query));

    // lets try some bottom up parsing
    this.parseJoinAllExactMatchTokens(tokens);
    this.parseJoinAllNotTokens(tokens);
    this.parseJoinAllFieldTokens(tokens);
    this.parseJoinAllRegularTokens(tokens);
    this.parseJoinAllAndOrTokens(tokens);
    const fresh = this.getDefault();
    fresh.filter = this.treeToFilters(fresh, [tokens, 'and']) || [];
    return fresh;
  }

  treeToFilters(fresh, tree)
  {
    let [values, filter] = tree, field;
    // console.log('treeToFilters', filter, values);
    switch (filter)
    {
    case 'and':
    case 'or':
      values = values.map(this.treeToFilters.bind(this, fresh))
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
        values = this.treeToFilters(fresh, values);
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
        else
        {
          return {
            filter,
            field,
            values
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
            tokens[i - 1] = [
              [tokens[i - 1], tokens[i + 1]], operator
            ];
            tokens.splice(i, 2);
          }
          else
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
    for (let [char, class_] of this.tokenise2(string))
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
      }
      yield [char, class_];
    }
  }

  * tokenise2(string)
  {
    let last = '';
    let lastClass = false;
    for (let [char, class_] of this.lex(string))
    {
      if (!lastClass)
      {
        [last, lastClass] = [char, class_];
      }
      else if (lastClass !== class_)
      {
        yield [last, lastClass];
        [last, lastClass] = [char, class_];
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
    for (let char of (string + '')
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
    case ' ':
      return ' ';
    case '"':
    case "'":
      return '"';
    case ':':
      return ':';
    case '.':
      return '.';
    case '-':
      return '-';
    default:
      return 'a'
    }
  }

}


module.exports = StringQueryParser;
