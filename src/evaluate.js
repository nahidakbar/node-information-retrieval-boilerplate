"use strict";

/**
 * Evaluate an IR system.
 *
 * @param  {System} system description
 * @param  {QueryParser} parser  description
 * @param  {object} cases  description
 * @return {object}        description
 */
async function evaluate(system, parser, expected)
{
  // find actual results
  const actual = {};
  for (const query of Object.keys(expected))
  {
    actual[query] = (await system.retrieveDocuments(parser.parse(query)))
      .results.map(x => x.id);
  }

  let count = Object.keys(expected)
    .length;

  const individual = {};

  for (let [query, T] of Object.entries(expected))
  {
    let P = actual[query];
    const TP = P.filter(a => T.indexOf(a) !== -1)
      .length;
    const FP = P.filter(a => T.indexOf(a) === -1)
      .length;

    let F = system.ids.filter(n => T.indexOf(n) === -1)
      .length;

    let N = system.ids.filter(n => P.indexOf(n) === -1);
    const TN = N.filter(a => T.indexOf(a) === -1)
      .length;
    const FN = N.filter(a => T.indexOf(a) !== -1)
      .length;
    N = N.length;
    P = P.length;
    T = T.length;

    let TPR = (TP + FN) !== 0 ? TP / (TP + FN) : 0;
    let TNR = (TN + FP) !== 0 ? TN / (TN + FP) : 0;
    let PPV = P !== 0 ? TP / (TP + FP) : 0;
    let NPV = N !== 0 ? TN / (TN + FN) : 0;
    let FNR = 1 - TPR;
    let FPR = 1 - TNR;
    let FDR = 1 - PPV;
    let FOR = 1 - NPV;
    let ACC = (TN + TP) / (P + N);
    let F1 = 2 * PPV * TPR / (PPV + TPR);
    let MCC = (TP * TN - FP * FN) / Math.sqrt((TP + FP) * (TP + FN) * (TN + FP) * (TN + FN));
    let BM = TPR + TNR - 1;
    let MK = PPV + NPV - 1;

    individual[query] = {
      T,
      F,
      P,
      N,
      TP,
      TN,
      FP,
      FN,
      TPR,
      TNR,
      PPV,
      NPV,
      FNR,
      FPR,
      FDR,
      FOR,
      ACC,
      F1,
      MCC,
      BM,
      MK
    }

  }

  const overall = {};
  for (let ind of Object.values(individual))
  {
    for (let [marker, value] of Object.entries(ind))
    {
      overall[marker] = overall[marker] || 0;
      if (Number.isFinite(value))
      {
        overall[marker] += value / count;
      }
    }
  }

  return {
    individual,
    overall
  };
}

module.exports = evaluate;
