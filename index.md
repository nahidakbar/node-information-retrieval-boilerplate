# Class

## `Results`

Search Results

### `constructor()`

### `keywords: *[]`

### `results: {}`

### `addHit(index: *, hit: *)`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| index | * | nullable: undefined |
| hit | * | nullable: undefined |

### `addKeyword(keyword: *, hits: *)`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| keyword | * | nullable: undefined |
| hits | * | nullable: undefined |

### `concat(results: *): *`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| results | * | nullable: undefined |

### `merge(results: *): *`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| results | * | nullable: undefined |

### `invert(indices: *): *`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| indices | * | nullable: undefined |

### `normalise(config: *): {"keywords": *, "results": *}`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| config | * | nullable: undefined |

## `System`

Information Retrieval System Main Class Basic workflow is: * create a new IRSystem * add indices * manage(add/remove/update)/retrive document collection/sets or: * create a new IRSystem with saved state from another IRSystem * manage(add/remove/update)/retrive documents

### `constructor(config: IRSystem)`

Construct new IR system.

### `[property]: *`

### `idField: string`

id field name

### `ids: *`

list of ids index -> id

### `idLookup: *`

id lookup id => index

### `indicesLookup: {}`

name => index

### `indices: Index[]`

system indices

### `processorsLookup: {}`

### `processors: Processor[]`

system processors

### `state(): object`

Dump current system state

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |

### `addIndex(index: *): IRSystem`

Add a new index to the system.

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| index | * | nullable: undefined |

### `addProcessor(processor: *): *`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| processor | * | nullable: undefined |

### `addDocuments(documents: Document[])`

Add a set of documents to the IR system. Documents are added and removed in bulk for abusing any potential optimisations which might be available for doing things in bulk.

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| documents | Document[] |  | document set to add |

### `removeDocuments(documents: Document[])`

Remove a set of documents from the IR system.

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| documents | Document[] |  | document set to add |

### `updateDocuments(documents: Document[]): *`

Alias of addDocuments. Add is the same as update in this system.

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| documents | Document[] |  | document set to add |

### `retrieveDocuments(query: Query): Document[]`

Retrieve a list of documents that matches a query.

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| query | Query |  | query |

### `getResults(filter: *, score: *): *`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| filter | * | nullable: undefined |
| score | * | nullable: undefined |

### `getFilterResults(filter: *, score: *): *`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| filter | * | nullable: undefined |
| score | * | nullable: undefined |

### `getAndResults(values: *, score: *): *`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| values | * | nullable: undefined |
| score | * | nullable: undefined |

### `getOrResults(values: *, score: *): *`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| values | * | nullable: undefined |
| score | * | nullable: undefined |

### `getNotResults(filter: *, score: *): *`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| filter | * | nullable: undefined |
| score | * | nullable: undefined |

### `helperGetIndex(record: *): *`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| record | * | nullable: undefined |

### `helperRemoveIndices(indices: *)`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| indices | * | nullable: undefined |

### `meta(): *`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |

## `BooleanIndex`

### `constructor()`

### `filters: string[]`

### `getDocumentValues(document: *): *`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| document | * | nullable: undefined |

### `analyseValues(values: *): *`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| values | * | nullable: undefined |

### `createIndex(): *[]`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |

### `addToIndex(index: *, documentIndices: *, documentsValues: *)`

O(documentIndices)

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| index | * | nullable: undefined |
| documentIndices | * | nullable: undefined |
| documentsValues | * | nullable: undefined |

### `removeFromIndex(index: *, documentIndices: *, documentsValues: *)`

O(documentIndices)

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| index | * | nullable: undefined |
| documentIndices | * | nullable: undefined |
| documentsValues | * | nullable: undefined |

### `filterBasedOnIndex(index: *, filter: *, results: *): *`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| index | * | nullable: undefined |
| filter | * | nullable: undefined |
| results | * | nullable: undefined |

### `filterExistsImpl(index: *, filter: *, results: *): *`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| index | * | nullable: undefined |
| filter | * | nullable: undefined |
| results | * | nullable: undefined |

### `filterIsImpl(index: *, filter: *, results: *): *`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| index | * | nullable: undefined |
| filter | * | nullable: undefined |
| results | * | nullable: undefined |

## `Index`

An index

### `constructor(config: object)`

Construct a new Index

### `[property]: *`

### `type: string`

Type of index. These are usually predefined values. Filled in by class.

### `fields: string[]`

List of fields it should index.

### `values: string`

List of field values by index. These values are used to add/remove documents from index and also used for sorting.

### `filters: string`

List of filters supported. These are usually predefined values. Filled in by class.

### `index: object`

Actual Index. Format depends on type of index. Override createIndex();

### `sorts: string`

Field values this index can supply for sorting.

### `entropy: number`

Information gain. TODO: should determine which field to query first etc.

### `state(): object`

Dump current index state.

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |

### `addDocuments(documentIndices: number[], documents: Document[])`

Adds a set of documents to Index

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| documentIndices | number[] |  | Index of document ids in the list of ids. Indices must store document data by this index. |
| documents | Document[] |  | Actual documents. |

### `removeDocuments(documentIndices: number[])`

Removes a set of documents from Index

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| documentIndices | number[] |  | Index of document ids in the list of ids. Indices must store document data by this index. |

### `filterDocuments(queryFilter: QueryFilter, results: Results): *`

Filter results based on query

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| queryFilter | QueryFilter |  | query to filter with |
| results | Results |  | results to filter (modify results object) |

### `makeSureIndexExists()`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |

### `removeExistingValues(documentIndices: *)`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| documentIndices | * | nullable: undefined |

### `addDocumentsToIndex(documentIndices: *, documents: *)`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| documentIndices | * | nullable: undefined |
| documents | * | nullable: undefined |

### `getDocumentValues(document: Document): object[]`

Extract values out of a document object. It is set up like this so that we can override this method and filter the values we don't like.

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| document | Document |  |

### `analyseValues(values: object[][]): object[][]`

Processing before adding to index. By default, it turns list of objects into a map of string representation of the objects to their occurance tally.

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| values | object[][] |  | list of values for each documents |

### `analyseValue(row: *): *`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| row | * | nullable: undefined |

### `createIndex(): IndexImplementation`

Create an empty index.

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |

### `addToIndex(index: IndexImplementation, documentIndices: number[], documentValues: string[][])`

Add to index.

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| index | IndexImplementation |  |
| documentIndices | number[] |  |
| documentValues | string[][] |  |

### `removeFromIndex(index: IndexImplementation, documentIndices: number[], documentValues: string[][])`

Remove from index

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| index | IndexImplementation |  |
| documentIndices | number[] |  |
| documentValues | string[][] |  |

### `filterBasedOnIndex(index: IndexImplementation, queryFilter: QueryFilter, results: Results)`

Filter results based on index

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| index | IndexImplementation |  |
| queryFilter | QueryFilter |  |
| results | Results |  |

## `NumberIndex`

### `constructor()`

### `filters: string[]`

### `getDocumentValues(document: *): *`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| document | * | nullable: undefined |

### `analyseValues(values: *): *`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| values | * | nullable: undefined |

### `createIndex(): *[]`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |

### `addToIndex(index: *, documentIndices: *, documentsValues: *)`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| index | * | nullable: undefined |
| documentIndices | * | nullable: undefined |
| documentsValues | * | nullable: undefined |

### `removeFromIndex(index: *, documentIndices: *, documentsValues: *)`

O(documentIndices)

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| index | * | nullable: undefined |
| documentIndices | * | nullable: undefined |
| documentsValues | * | nullable: undefined |

### `filterBasedOnIndex(index: *, filter: *, results: *): *`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| index | * | nullable: undefined |
| filter | * | nullable: undefined |
| results | * | nullable: undefined |

### `filterExistsImpl(index: *, filter: *, results: *): *`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| index | * | nullable: undefined |
| filter | * | nullable: undefined |
| results | * | nullable: undefined |

### `filterLessThanImpl(index: *, filter: *, results: *): *`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| index | * | nullable: undefined |
| filter | * | nullable: undefined |
| results | * | nullable: undefined |

### `filterMoreThanImpl(index: *, filter: *, results: *): *`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| index | * | nullable: undefined |
| filter | * | nullable: undefined |
| results | * | nullable: undefined |

### `filterEqualToImpl(index: *, filter: *, results: *): *`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| index | * | nullable: undefined |
| filter | * | nullable: undefined |
| results | * | nullable: undefined |

## `StringIndex`

### `constructor()`

### `filters: string[]`

### `getDocumentValues(document: *): *`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| document | * | nullable: undefined |

### `createIndex(): *[]`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |

### `addToIndex(index: *, documentIndices: *, documentsValues: *)`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| index | * | nullable: undefined |
| documentIndices | * | nullable: undefined |
| documentsValues | * | nullable: undefined |

### `removeFromIndex(index: *, documentIndices: *, documentsValues: *)`

O(documentIndices)

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| index | * | nullable: undefined |
| documentIndices | * | nullable: undefined |
| documentsValues | * | nullable: undefined |

### `filterBasedOnIndex(index: *, filter: *, results: *): *`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| index | * | nullable: undefined |
| filter | * | nullable: undefined |
| results | * | nullable: undefined |

### `filterExistsImpl(index: *, filter: *, results: *): *`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| index | * | nullable: undefined |
| filter | * | nullable: undefined |
| results | * | nullable: undefined |

### `filterMatchImpl(index: *, filter: *, results: *): *`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| index | * | nullable: undefined |
| filter | * | nullable: undefined |
| results | * | nullable: undefined |

## `TextIndex`

### `constructor()`

### `filters: string[]`

### `decoder: *`

### `lex: *`

### `tag: *`

### `lemm: *`

### `stem: *`

### `totalWordsTally: *`

### `maximumDocumentsByTerm: *`

### `sorts: undefined[]`

### `allowPartialMatch: *`

### `state(): *`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |

### `getDocumentValues(document: *): *`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| document | * | nullable: undefined |

### `analyseValue(valuesList: *): {"stemmedFull": *, "words": *, "bagOfWords": *, "count": *}`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| valuesList | * | nullable: undefined |

### `createIndex(): {}`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |

### `addToIndex(index: *, documentIndices: *, documentsValues: *)`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| index | * | nullable: undefined |
| documentIndices | * | nullable: undefined |
| documentsValues | * | nullable: undefined |

### `removeFromIndex(index: *, documentIndices: *, documentsValues: *)`

O(documentIndices)

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| index | * | nullable: undefined |
| documentIndices | * | nullable: undefined |
| documentsValues | * | nullable: undefined |

### `filterBasedOnIndex(index: *, filter: *, results: *, score: *): *`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| index | * | nullable: undefined |
| filter | * | nullable: undefined |
| results | * | nullable: undefined |
| score | * | nullable: undefined |

### `filterQueryImpl(index: *, filter: *, results: *, score: *, exact: *)`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| index | * | nullable: undefined |
| filter | * | nullable: undefined |
| results | * | nullable: undefined |
| score | * | nullable: undefined |
| exact | * | nullable: undefined |

### `getSortValue(index: *): *`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| index | * | nullable: undefined |

## `AltQuerySuggester`

### `constructor()`

### `fields: *`

### `words: *`

### `state(): *`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |

### `addDocuments(system: *, documentIndices: *, documents: *)`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| system | * | nullable: undefined |
| documentIndices | * | nullable: undefined |
| documents | * | nullable: undefined |

### `processResults(system: *, query: *, results: *)`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| system | * | nullable: undefined |
| query | * | nullable: undefined |
| results | * | nullable: undefined |

### `getClosest(word: *): *`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| word | * | nullable: undefined |

## `Processor`

A Processor

### `constructor(config: object)`

Construct a new Processor

### `[property]: *`

### `type: string`

Type of index. These are usually predefined values. Filled in by class.

### `bind: *`

### `state(): object`

Dump current index state.

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |

### `addDocuments(system: *, documentIndices: *, documents: *)`

for classes with bind 'add'

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| system | * | nullable: undefined |
| documentIndices | * | nullable: undefined |
| documents | * | nullable: undefined |

### `removeDocuments(system: *, documentIndices: *)`

for classes with bind 'remove'

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| system | * | nullable: undefined |
| documentIndices | * | nullable: undefined |

### `processQuery(system: *, query: *)`

for classes with bind 'query'

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| system | * | nullable: undefined |
| query | * | nullable: undefined |

### `processResults(system: *, query: *, results: *)`

for classes with bind 'results'

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| system | * | nullable: undefined |
| query | * | nullable: undefined |
| results | * | nullable: undefined |

## `Sorter`

### `constructor()`

### `processResults(system: *, query: *, results: *)`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| system | * | nullable: undefined |
| query | * | nullable: undefined |
| results | * | nullable: undefined |

### `sortFunction(system: *, sort: *, sortOrder: *): *`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| system | * | nullable: undefined |
| sort | * | nullable: undefined |
| sortOrder | * | nullable: undefined |

## `QueryParser`

Helper functionality for parsing query representes in different formats into the one this package supports.

### `constructor()`

### `[property]: *`

### `fields: *`

### `sort: *`

### `defaultField: *`

### `defaultFilter: *`

### `defaultExactFilter: *`

### `defaultSort: *`

### `defaultSortOrder: *`

### `getDefault(): {"filter": *, "sort": *, "order": *}`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |

## `StringQueryParser`

Helper functionality for parsing query representes in different formats into the one this package supports.

### `constructor()`

### `parse(query: *, maxTokns: number): *`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| query | * | nullable: undefined |
| maxTokns | number | nullable: undefined, optional: true, default: 15 |

### `treeToFilters(fresh: *, config: *, tree: *): {"filter": *, "field": *, "values": *}`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| fresh | * | nullable: undefined |
| config | * | nullable: undefined |
| tree | * | nullable: undefined |

### `parseJoinAllExactMatchTokens(tokens: *)`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| tokens | * | nullable: undefined |

### `parseJoinAllNotTokens(tokens: *)`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| tokens | * | nullable: undefined |

### `parseJoinAllFieldTokens(tokens: *)`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| tokens | * | nullable: undefined |

### `parseJoinAllRegularTokens(tokens: *)`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| tokens | * | nullable: undefined |

### `parseJoinAllAndOrTokens(tokens: *)`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| tokens | * | nullable: undefined |

### `tokenise(string: *)`

Probably the smallest tokeniser ever written

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| string | * | nullable: undefined |

### `lemmatise(string: *)`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| string | * | nullable: undefined |

### `lex(string: *)`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| string | * | nullable: undefined |

### `classifyChar(char: *): string`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| char | * | nullable: undefined |

# Function

## `evaluate(system: System, parser: QueryParser, cases: object): object`

Evaluate an IR system.

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| system | System |  | description |
| parser | QueryParser |  | description |
| cases | object |  | description |

## `add(Type: *, type: *)`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| Type | * | nullable: undefined |
| type | * | nullable: undefined |

## `extractAllValues(callback: *, value: *, field: *, scale: *)`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| callback | * | nullable: undefined |
| value | * | nullable: undefined |
| field | * | nullable: undefined |
| scale | * | nullable: undefined |

## `extractFragmentValues(callback: *, document: *, fragment: *, field: *, scale: *): *`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| callback | * | nullable: undefined |
| document | * | nullable: undefined |
| fragment | * | nullable: undefined |
| field | * | nullable: undefined |
| scale | * | nullable: undefined |

## `extractObjectValues(document: object, fields: object, callback: function)`

extract values from a document object

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| document | object |  | target document |
| fields | object |  | array of fields or map of fields to score |
| callback | function |  | callback function will be called for each value |

## `add(Type: *, type: *)`

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| Type | * | nullable: undefined |
| type | * | nullable: undefined |

## `binary(): number`

binary tf (1)

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |

## `count(t: number, sum_t: number, max_t: number, sum_dt: number, sum_all: number, count_d: number, count_dt: number, max_dt: number): number`

raw term count

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| t | number |  | number of times term occurs in document |
| sum_t | number |  | sum of t for all terms in document |
| max_t | number |  | maximum number of times any term occurs in document |
| sum_dt | number |  | total number of terms in document |
| sum_all | number |  | total number of terms in document collection |
| count_d | number |  | total number of documents |
| count_dt | number |  | total number of documents with term |
| max_dt | number |  | maximum number of documents per term |

## `termFrequency(t: number, sum_t: number, max_t: number, sum_dt: number, sum_all: number, count_d: number, count_dt: number, max_dt: number): number`

term frequency (raw cunt / total raw count)

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| t | number |  | number of times term occurs in document |
| sum_t | number |  | sum of t for all terms in document |
| max_t | number |  | maximum number of times any term occurs in document |
| sum_dt | number |  | total number of terms in document |
| sum_all | number |  | total number of terms in document collection |
| count_d | number |  | total number of documents |
| count_dt | number |  | total number of documents with term |
| max_dt | number |  | maximum number of documents per term |

## `logNormal(t: number, sum_t: number, max_t: number, sum_dt: number, sum_all: number, count_d: number, count_dt: number, max_dt: number): number`

1 + log(count)

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| t | number |  | number of times term occurs in document |
| sum_t | number |  | sum of t for all terms in document |
| max_t | number |  | maximum number of times any term occurs in document |
| sum_dt | number |  | total number of terms in document |
| sum_all | number |  | total number of terms in document collection |
| count_d | number |  | total number of documents |
| count_dt | number |  | total number of documents with term |
| max_dt | number |  | maximum number of documents per term |

## `augmented(K: number): function`

doouble normalisation score functon generator K + (1-K) (count / max count)

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| K | number | optional: true, default: 0.5 | augment weight |

## `naiveBayes(t: number, sum_t: number, max_t: number, sum_dt: number, sum_all: number, count_d: number, count_dt: number, max_dt: number): number`

anonymous function - description

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| t | number |  | number of times term occurs in document |
| sum_t | number |  | sum of t for all terms in document |
| max_t | number |  | maximum number of times any term occurs in document |
| sum_dt | number |  | total number of terms in document |
| sum_all | number |  | total number of terms in document collection |
| count_d | number |  | total number of documents |
| count_dt | number |  | total number of documents with term |
| max_dt | number |  | maximum number of documents per term |

## `unary(): number`

unary idf (1)

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |

## `inverseDocumentFrequency(t: number, sum_t: number, max_t: number, sum_dt: number, sum_all: number, count_d: number, count_dt: number, max_dt: number): number`

idf - number of documents / number of documents with term

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| t | number |  | number of times term occurs in document |
| sum_t | number |  | sum of t for all terms in document |
| max_t | number |  | maximum number of times any term occurs in document |
| sum_dt | number |  | total number of terms in document |
| sum_all | number |  | total number of terms in document collection |
| count_d | number |  | total number of documents |
| count_dt | number |  | total number of documents with term |
| max_dt | number |  | maximum number of documents per term |

## `inverseDocumentFrequencySmooth(t: number, sum_t: number, max_t: number, sum_dt: number, sum_all: number, count_d: number, count_dt: number, max_dt: number): number`

idf smooth

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| t | number |  | number of times term occurs in document |
| sum_t | number |  | sum of t for all terms in document |
| max_t | number |  | maximum number of times any term occurs in document |
| sum_dt | number |  | total number of terms in document |
| sum_all | number |  | total number of terms in document collection |
| count_d | number |  | total number of documents |
| count_dt | number |  | total number of documents with term |
| max_dt | number |  | maximum number of documents per term |

## `inverseDocumentFrequencyMax(t: number, sum_t: number, max_t: number, sum_dt: number, sum_all: number, count_d: number, count_dt: number, max_dt: number): number`

idf max

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| t | number |  | number of times term occurs in document |
| sum_t | number |  | sum of t for all terms in document |
| max_t | number |  | maximum number of times any term occurs in document |
| sum_dt | number |  | total number of terms in document |
| sum_all | number |  | total number of terms in document collection |
| count_d | number |  | total number of documents |
| count_dt | number |  | total number of documents with term |
| max_dt | number |  | maximum number of documents per term |

## `probabilisticInverseDocumentFrequency(t: number, sum_t: number, max_t: number, sum_dt: number, sum_all: number, count_d: number, count_dt: number, max_dt: number): number`

probailistic idf

| Name | Type | Attribute | Description |
| --- | --- | --- | --- |
| t | number |  | number of times term occurs in document |
| sum_t | number |  | sum of t for all terms in document |
| max_t | number |  | maximum number of times any term occurs in document |
| sum_dt | number |  | total number of terms in document |
| sum_all | number |  | total number of terms in document collection |
| count_d | number |  | total number of documents |
| count_dt | number |  | total number of documents with term |
| max_dt | number |  | maximum number of documents per term |