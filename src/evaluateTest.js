"use strict";

// http://randomtextgenerator.com/
const DATA = [
  'In to am attended desirous raptures declared diverted confined at. Collected instantly remaining up certainly to necessary as. Over walk dull into son boy door went new. At or happiness commanded daughters as. Is handsome an declared at received in extended vicinity subjects. Into miss on he over been late pain an. Only week bore boy what fat case left use. Match round scale now sex style far times. Your me past an much. ',
  'Letter wooded direct two men indeed income sister. Impression up admiration he by partiality is. Instantly immediate his saw one day perceived. Old blushes respect but offices hearted minutes effects. Written parties winding oh as in without on started. Residence gentleman yet preserved few convinced. Coming regret simple longer little am sister on. Do danger in to adieus ladies houses oh eldest. Gone pure late gay ham. They sigh were not find are rent. ',
  'Stronger unpacked felicity to of mistaken. Fanny at wrong table ye in. Be on easily cannot innate in lasted months on. Differed and and felicity steepest mrs age outweigh. Opinions learning likewise daughter now age outweigh. Raptures stanhill my greatest mistaken or exercise he on although. Discourse otherwise disposing as it of strangers forfeited deficient. ',
  'Open know age use whom him than lady was. On lasted uneasy exeter my itself effect spirit. At design he vanity at cousin longer looked ye. Design praise me father an favour. As greatly replied it windows of an minuter behaved passage. Diminution expression reasonable it we he projection acceptance in devonshire. Perpetual it described at he applauded. ',
  'Considered an invitation do introduced sufficient understood instrument it. Of decisively friendship in as collecting at. No affixed be husband ye females brother garrets proceed. Least child who seven happy yet balls young. Discovery sweetness principle discourse shameless bed one excellent. Sentiments of surrounded friendship dispatched connection is he. Me or produce besides hastily up as pleased. Bore less when had and john shed hope. ',
  'Conveying or northward offending admitting perfectly my. Colonel gravity get thought fat smiling add but. Wonder twenty hunted and put income set desire expect. Am cottage calling my is mistake cousins talking up. Interested especially do impression he unpleasant travelling excellence. All few our knew time done draw ask. ',
  'Two assure edward whence the was. Who worthy yet ten boy denote wonder. Weeks views her sight old tears sorry. Additions can suspected its concealed put furnished. Met the why particular devonshire decisively considered partiality. Certain it waiting no entered is. Passed her indeed uneasy shy polite appear denied. Oh less girl no walk. At he spot with five of view. ',
  'Piqued favour stairs it enable exeter as seeing. Remainder met improving but engrossed sincerity age. Better but length gay denied abroad are. Attachment astonished to on appearance imprudence so collecting in excellence. Tiled way blind lived whose new. The for fully had she there leave merit enjoy forth. ',
  'Indulgence announcing uncommonly met she continuing two unpleasing terminated. Now busy say down the shed eyes roof paid her. Of shameless collected suspicion existence in. Share walls stuff think but the arise guest. Course suffer to do he sussex it window advice. Yet matter enable misery end extent common men should. Her indulgence but assistance favourable cultivated everything collecting. ',
  'Use securing confined his shutters. Delightful as he it acceptance an solicitude discretion reasonably. Carriage we husbands advanced an perceive greatest. Totally dearest expense on demesne ye he. Curiosity excellent commanded in me. Unpleasing impression themselves to at assistance acceptance my or. On consider laughter civility offended oh. ',
  'When be draw drew ye. Defective in do recommend suffering. House it seven in spoil tiled court. Sister others marked fat missed did out use. Alteration possession dispatched collecting instrument travelling he or on. Snug give made at spot or late that mr. When be draw drew ye. Defective in do recommend suffering. House it seven in spoil tiled court. Sister others marked fat missed did out use. Alteration possession dispatched collecting instrument travelling he or on.',
  'Inquietude simplicity terminated she compliment remarkably few her nay. The weeks are ham asked jokes. Neglected perceived shy nay concluded. Not mile draw plan snug next all. Houses latter an valley be indeed wished merely in my. Money doubt oh drawn every or an china. Visited out friends for expense message set eat.',
];

const CASES = {
  "strength": [2],
  "it": [2, 3, 4, 6, 7, 8, 9, 10],
  "when": [4, 10]
};

const assert = require('assert');
const ir = require('.');

describe('evaluate', function ()
{
  it('test', async function ()
  {
    const system = new ir.System();
    const TextIndex = ir.lookup.text;
    system.addIndex(new TextIndex({
      name: 'text',
      fields: ['text']
    }))
    await system.addDocuments(DATA.map((text, id) =>
    {
      return {
        text,
        id
      };
    }));

    const parser = new ir.StringQueryParser(system.meta());

    const results = await ir.evaluate(system, parser, CASES);
    assert.deepEqual(results.overall, {
      T: 3.6666666666666665,
      F: 8.333333333333334,
      N: 8.666666666666666,
      P: 3.333333333333333,
      TP: 3.333333333333333,
      TN: 8.333333333333334,
      FP: 0,
      FN: 0.3333333333333333,
      TPR: 0.6666666666666666,
      TNR: 1,
      PPV: 0.6666666666666666,
      NPV: 0.9722222222222221,
      FNR: 0.3333333333333333,
      FPR: 0,
      FDR: 0.3333333333333333,
      FOR: 0.02777777777777779,
      ACC: 0.9722222222222221,
      F1: 0.6666666666666666,
      MCC: 0.6666666666666666,
      BM: 0.6666666666666666,
      MK: 0.6388888888888888
    })

  })
});
