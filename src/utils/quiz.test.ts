import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeAnswer, checkAnswer, formatSerialNumber, parseAnswerList } from './quiz';

test('normalizeAnswer trims, lowercases, and converts full-width characters', () => {
  assert.equal(normalizeAnswer('  Hello World  '), 'hello world');
  assert.equal(normalizeAnswer('１０'), '10');
  assert.equal(normalizeAnswer('ＡＢＣ'), 'abc');
  assert.equal(normalizeAnswer(''), '');
});

test('checkAnswer matches any valid answer variation', () => {
  const acceptable = ['10', '十', 'Ten', 'ten'];
  
  // exact match
  assert.equal(checkAnswer('10', acceptable), true);
  // case insensitivity
  assert.equal(checkAnswer('TEN', acceptable), true);
  assert.equal(checkAnswer('Ten', acceptable), true);
  // Chinese numeral
  assert.equal(checkAnswer('十', acceptable), true);
  // whitespace tolerance
  assert.equal(checkAnswer('  10  ', acceptable), true);
  // full-width numbers
  assert.equal(checkAnswer('１０', acceptable), true);

  // incorrect inputs
  assert.equal(checkAnswer('9', acceptable), false);
  assert.equal(checkAnswer('十一', acceptable), false);
  assert.equal(checkAnswer('', acceptable), false);
});

test('formatSerialNumber pads correctly with NO. prefix', () => {
  assert.equal(formatSerialNumber(1), 'NO.0001');
  assert.equal(formatSerialNumber(2), 'NO.0002');
  assert.equal(formatSerialNumber(99), 'NO.0099');
  assert.equal(formatSerialNumber(1000), 'NO.1000');
  assert.equal(formatSerialNumber(12345), 'NO.12345');
});

test('parseAnswerList splits comma and newline separated answers', () => {
  assert.deepEqual(parseAnswerList('10, 十, Ten, ten'), ['10', '十', 'Ten']);
  assert.deepEqual(parseAnswerList('台北，高雄\n台中;台南'), ['台北', '高雄', '台中', '台南']);
  assert.deepEqual(parseAnswerList(''), []);
});
