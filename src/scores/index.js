"use strict";


/**
 * binary tf (1)
 *
 * @return {number}          calculated score
 */
module.exports.binary = function ()
{
  return 1;
};

/**
 * raw term count
 *
 * @param  {number} t        number of times term occurs in document
 * @param  {number} sum_t    sum of t for all terms in document
 * @param  {number} max_t    maximum number of times any term occurs in document
 * @param  {number} sum_dt   total number of terms in document
 * @param  {number} sum_all  total number of terms in document collection
 * @param  {number} count_d  total number of documents
 * @param  {number} count_dt total number of documents with term
 * @param  {number} max_dt   maximum number of documents per term
 * @return {number}          calculated score
 */
module.exports.count = function (t, sum_t, max_t, sum_dt, sum_all, count_d, count_dt, max_dt)
{
  return t;
};

/**
 * term frequency (raw cunt / total raw count)
 *
 * @param  {number} t        number of times term occurs in document
 * @param  {number} sum_t    sum of t for all terms in document
 * @param  {number} max_t    maximum number of times any term occurs in document
 * @param  {number} sum_dt   total number of terms in document
 * @param  {number} sum_all  total number of terms in document collection
 * @param  {number} count_d  total number of documents
 * @param  {number} count_dt total number of documents with term
 * @param  {number} max_dt   maximum number of documents per term
 * @return {number}          calculated score
 */
module.exports.termFrequency = function (t, sum_t, max_t, sum_dt, sum_all, count_d, count_dt, max_dt)
{
  return t / sum_t;
};

/**
 * 1 + log(count)
 *
 * @param  {number} t        number of times term occurs in document
 * @param  {number} sum_t    sum of t for all terms in document
 * @param  {number} max_t    maximum number of times any term occurs in document
 * @param  {number} sum_dt   total number of terms in document
 * @param  {number} sum_all  total number of terms in document collection
 * @param  {number} count_d  total number of documents
 * @param  {number} count_dt total number of documents with term
 * @param  {number} max_dt   maximum number of documents per term
 * @return {number}          calculated score
 */
module.exports.logNormal = function (t, sum_t, max_t, sum_dt, sum_all, count_d, count_dt, max_dt)
{
  return 1 + Math.log(t);
};


/**
 * doouble normalisation score functon generator K + (1-K) (count / max count)
 *
 * @param  {number} [K=0.5] augment weight
 * @return {function}         score function
 */
module.exports.augmented = function (K = 0.5)
{
  return function (t, sum_t, max_t, sum_dt, sum_all, count_d, count_dt, max_dt)
  {
    return K + K * (t / max_t);
  };
};

/**
 * anonymous function - description
 *
 * @param  {number} t        number of times term occurs in document
 * @param  {number} sum_t    sum of t for all terms in document
 * @param  {number} max_t    maximum number of times any term occurs in document
 * @param  {number} sum_dt   total number of terms in document
 * @param  {number} sum_all  total number of terms in document collection
 * @param  {number} count_d  total number of documents
 * @param  {number} count_dt total number of documents with term
 * @param  {number} max_dt   maximum number of documents per term
 * @return {number}          calculated score
 */
module.exports.naiveBayes = function (t, sum_t, max_t, sum_dt, sum_all, count_d, count_dt, max_dt)
{
  return sum_all / sum_t / count_d;
};

/**
 * unary idf (1)
 *
 * @return {number}          calculated score
 */
module.exports.unary = function ()
{
  return 1;
};

/**
 * idf - number of documents / number of documents with term
 *
 * @param  {number} t        number of times term occurs in document
 * @param  {number} sum_t    sum of t for all terms in document
 * @param  {number} max_t    maximum number of times any term occurs in document
 * @param  {number} sum_dt   total number of terms in document
 * @param  {number} sum_all  total number of terms in document collection
 * @param  {number} count_d  total number of documents
 * @param  {number} count_dt total number of documents with term
 * @param  {number} max_dt   maximum number of documents per term
 * @return {number}          calculated score
 */
module.exports.inverseDocumentFrequency = function (t, sum_t, max_t, sum_dt, sum_all, count_d, count_dt, max_dt)
{
  return Math.log(count_d / count_dt);
};

/**
 * idf smooth
 *
 * @param  {number} t        number of times term occurs in document
 * @param  {number} sum_t    sum of t for all terms in document
 * @param  {number} max_t    maximum number of times any term occurs in document
 * @param  {number} sum_dt   total number of terms in document
 * @param  {number} sum_all  total number of terms in document collection
 * @param  {number} count_d  total number of documents
 * @param  {number} count_dt total number of documents with term
 * @param  {number} max_dt   maximum number of documents per term
 * @return {number}          calculated score
 */
module.exports.inverseDocumentFrequencySmooth = function (t, sum_t, max_t, sum_dt, sum_all, count_d, count_dt, max_dt)
{
  return Math.log(1 + count_d / count_dt);
};

/**
 * idf max
 *
 * @param  {number} t        number of times term occurs in document
 * @param  {number} sum_t    sum of t for all terms in document
 * @param  {number} max_t    maximum number of times any term occurs in document
 * @param  {number} sum_dt   total number of terms in document
 * @param  {number} sum_all  total number of terms in document collection
 * @param  {number} count_d  total number of documents
 * @param  {number} count_dt total number of documents with term
 * @param  {number} max_dt   maximum number of documents per term
 * @return {number}          calculated score
 */
module.exports.inverseDocumentFrequencyMax = function (t, sum_t, max_t, sum_dt, sum_all, count_d, count_dt, max_dt)
{
  // added a small constant here as 0 score is a special non-result case in the system
  return Math.log(max_dt / (1 + count_dt) + 1e-10);
};

/**
 * probailistic idf
 *
 * @param  {number} t        number of times term occurs in document
 * @param  {number} sum_t    sum of t for all terms in document
 * @param  {number} max_t    maximum number of times any term occurs in document
 * @param  {number} sum_dt   total number of terms in document
 * @param  {number} sum_all  total number of terms in document collection
 * @param  {number} count_d  total number of documents
 * @param  {number} count_dt total number of documents with term
 * @param  {number} max_dt   maximum number of documents per term
 * @return {number}          calculated score
 */
module.exports.probabilisticInverseDocumentFrequency = function (t, sum_t, max_t, sum_dt, sum_all, count_d, count_dt, max_dt)
{
  // added a small constant here as 0 score is a special non-result case in the system
  return Math.log((count_d - count_dt) / (count_dt) + 1e-10);
};
