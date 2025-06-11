/**
 * Unit tests for the account module
 */

import { test, describe } from 'node:test';
import assert from 'node:assert';

import {
  adviseTransaction,
  getAvailableBalance,
  consolidateTransaction,
  getEpochBalance
} from '../src/account.js';

describe('Account Module', () => {
  test('advise transaction adds pending transaction', () => {
    const account = {};
    const result = adviseTransaction(account, 'tx-1', 100);
    
    assert.deepStrictEqual(result, {
      pending: { 'tx-1': 100 }
    }, 'Should add pending transaction');
  });
  
  test('advise multiple transactions accumulates pending', () => {
    let account = {};
    account = adviseTransaction(account, 'tx-1', 100);
    account = adviseTransaction(account, 'tx-2', -50);
    
    assert.deepStrictEqual(account.pending, {
      'tx-1': 100,
      'tx-2': -50
    }, 'Should accumulate multiple pending transactions');
  });
  
  test('get available balance with no data returns 0', () => {
    const balance = getAvailableBalance({});
    assert.strictEqual(balance, 0, 'Empty account should have 0 balance');
  });
  
  test('get available balance with only pending transactions', () => {
    const account = {
      pending: { 'tx-1': 100, 'tx-2': -30 }
    };
    
    const balance = getAvailableBalance(account);
    assert.strictEqual(balance, 70, 'Should sum pending transactions (100 - 30 = 70)');
  });
  
  test('get available balance with epoch balances and pending', () => {
    const account = {
      vs: { 0: 50, 1: 200 },
      pending: { 'tx-1': 25 }
    };
    
    const balance = getAvailableBalance(account);
    assert.strictEqual(balance, 225, 'Should use latest epoch balance (200) plus pending (25)');
  });
  
  test('consolidate transaction moves from pending to epoch balance', () => {
    const account = {
      vs: { 0: 100 },
      pending: { 'tx-1': 50, 'tx-2': -25 }
    };
    
    const result = consolidateTransaction(account, 1, 'tx-1');
    
    assert.deepStrictEqual(result, {
      vs: { 0: 100, 1: 50 },
      pending: { 'tx-2': -25 }
    }, 'Should move tx-1 from pending to epoch 1 and remove from pending');
  });
  
  test('consolidate transaction with existing epoch balance', () => {
    const account = {
      vs: { 1: 75 },
      pending: { 'tx-1': 25 }
    };
    
    const result = consolidateTransaction(account, 1, 'tx-1');
    
    assert.deepStrictEqual(result, {
      vs: { 1: 100 }, // 75 + 25
      pending: {}
    }, 'Should add to existing epoch balance');
  });
  
  test('consolidate non-existent transaction returns unchanged', () => {
    const account = {
      vs: { 0: 100 },
      pending: { 'tx-1': 50 }
    };
    
    const result = consolidateTransaction(account, 1, 'tx-2');
    
    assert.deepStrictEqual(result, account, 'Should return unchanged account if transaction not found');
  });
  
  test('get epoch balance returns correct value', () => {
    const account = {
      vs: { 0: 100, 1: 250, 2: -50 }
    };
    
    assert.strictEqual(getEpochBalance(account, 0), 100, 'Should return epoch 0 balance');
    assert.strictEqual(getEpochBalance(account, 1), 250, 'Should return epoch 1 balance');
    assert.strictEqual(getEpochBalance(account, 2), -50, 'Should return epoch 2 balance');
    assert.strictEqual(getEpochBalance(account, 3), undefined, 'Should return undefined for non-existent epoch');
  });
  
  test('get epoch balance with no vs returns undefined', () => {
    const account = { pending: { 'tx-1': 100 } };
    
    assert.strictEqual(getEpochBalance(account, 0), undefined, 'Should return undefined if no vs property');
  });
}); 