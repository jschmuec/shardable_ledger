/**
 * Main test suite for the shardable ledger
 * Replicates the functionality tests from the Clojure version
 */

import { test, describe } from 'node:test';
import assert from 'node:assert';

import {
  openConnection,
  advise,
  getBalance,
  getAvailable,
  closeTx,
  closeTxf,
  markEpochClosed,
  consolidateAcct,
  markEpochConsolidated,
  addDocToTx
} from './src/index.js';

describe('Shardable Ledger - Full Transaction Test', () => {
  test('complete transaction flow with payer and payee', () => {
    const transactionFileName = 'test-file';
    const transactionId = 'tx-1';
    const payer = 'payer';
    const payee = 'payee';
    
    // Open connection
    const [initialDb, epochId] = openConnection({}, transactionFileName);
    
    // Add payer document to transaction
    let db = addDocToTx(initialDb, transactionFileName, transactionId, payer);
    
    // Advise payer transaction (-100)
    db = advise(db, transactionFileName, transactionId, payer, -100);
    
    // Add payee document to transaction
    db = addDocToTx(db, transactionFileName, transactionId, payee);
    
    // Advise payee transaction (+100)
    db = advise(db, transactionFileName, transactionId, payee, 100);
    
    // Close transaction
    db = closeTx(db, transactionFileName, transactionId);
    
    // Close transaction file
    db = closeTxf(db, transactionFileName);
    
    // Test available amounts
    assert.strictEqual(getAvailable(db, payer), -100, 'Payer available amount should be -100');
    assert.strictEqual(getAvailable(db, payee), 100, 'Payee available amount should be 100');
    
    // Consolidation steps
    db = markEpochClosed(db, epochId);
    db = consolidateAcct(db, epochId, payer, transactionId);
    db = consolidateAcct(db, epochId, payee, transactionId);
    db = markEpochConsolidated(db, epochId);
    
    // Test final balances
    assert.strictEqual(getBalance(db, epochId, payer), -100, 'Payer balance should be -100');
    assert.strictEqual(getBalance(db, epochId, payee), 100, 'Payee balance should be 100');
  });
});

describe('Shardable Ledger - Individual Steps Test', () => {
  test('open connection creates correct structure', () => {
    const transactionFileName = 'test-file';
    const [db, epochId] = openConnection({}, transactionFileName);
    
    const expectedDb = {
      epochs: {
        0: {
          txfs: new Set(['test-file'])
        }
      }
    };
    
    assert.strictEqual(epochId, 0, 'Epoch ID should be 0');
    assert.deepStrictEqual(db.epochs[0].txfs, expectedDb.epochs[0].txfs, 'Should create correct epoch structure');
  });
  
  test('add document to transaction file creates correct structure', () => {
    const transactionFileName = 'test-file';
    const transactionId = 'tx-1';
    const payer = 'payer';
    
    const [initialDb, epochId] = openConnection({}, transactionFileName);
    const db = addDocToTx(initialDb, transactionFileName, transactionId, payer);
    
    const expectedStructure = {
      epochs: {
        0: { txfs: new Set(['test-file']) }
      },
      txfs: {
        'test-file': {
          'tx-1': {
            docs: new Set(['payer'])
          }
        }
      }
    };
    
    assert.deepStrictEqual(db.epochs, expectedStructure.epochs, 'Epochs should match');
    assert.deepStrictEqual(db.txfs['test-file']['tx-1'].docs, expectedStructure.txfs['test-file']['tx-1'].docs, 'Transaction file should have correct document');
  });
});

describe('Shardable Ledger - Connection Test', () => {
  test('creates transaction file in current epoch', () => {
    const initialDb = {
      meta: { 'open-epoch': 1 }
    };
    
    const [db, epochId] = openConnection(initialDb, 'my-file');
    
    const expected = {
      meta: { 'open-epoch': 1 },
      epochs: {
        1: { txfs: new Set(['my-file']) }
      }
    };
    
    assert.strictEqual(epochId, 1, 'Should return correct epoch ID');
    assert.deepStrictEqual(db.epochs[1].txfs, expected.epochs[1].txfs, 'Should add transaction file to existing epoch');
  });
  
  test('handles multiple transaction files in same epoch', () => {
    const initialDb = {
      meta: { 'open-epoch': 2 },
      epochs: {
        1: { closed: true }
      }
    };
    
    const [db1, epochId1] = openConnection(initialDb, 'my-file-1');
    const [db2, epochId2] = openConnection(db1, 'my-file-2');
    
    assert.strictEqual(epochId1, 2, 'First connection should use epoch 2');
    assert.strictEqual(epochId2, 2, 'Second connection should use same epoch 2');
    assert.strictEqual(db2.epochs[2].txfs.size, 2, 'Should have 2 transaction files');
    assert.ok(db2.epochs[2].txfs.has('my-file-1'), 'Should contain first file');
    assert.ok(db2.epochs[2].txfs.has('my-file-2'), 'Should contain second file');
  });
});

describe('Shardable Ledger - Error Handling', () => {
  test('consolidation fails if epoch is not closed', () => {
    const db = {
      epochs: { 0: {} },
      accts: { payer: {} }
    };
    
    assert.throws(
      () => consolidateAcct(db, 0, 'payer', 'tx-1'),
      { message: 'Cannot consolidate: epoch must be closed first' },
      'Should throw error when trying to consolidate unclosed epoch'
    );
  });
  
  test('closing epoch fails if not all transaction files are closed', () => {
    const db = {
      epochs: {
        11: { txfs: new Set(['open-file']) }
      },
      txfs: {
        'open-file': {} // Not closed
      }
    };
    
    assert.throws(
      () => markEpochClosed(db, 11),
      { message: 'Cannot close epoch: not all transaction files are closed' },
      'Should throw error when trying to close epoch with open transaction files'
    );
  });
});

describe('Shardable Ledger - Complex Scenarios', () => {
  test('multiple transactions in same epoch', () => {
    const tf1 = 'file-1';
    const tf2 = 'file-2';
    const tx1 = 'tx-1';
    const tx2 = 'tx-2';
    const accountA = 'account-a';
    const accountB = 'account-b';
    const accountC = 'account-c';
    
    // Setup two connections
    const [db1, epochId1] = openConnection({}, tf1);
    const [db2, epochId2] = openConnection(db1, tf2);
    
    assert.strictEqual(epochId1, epochId2, 'Both connections should use same epoch');
    
    // First transaction: A -> B (50)
    let db = addDocToTx(db2, tf1, tx1, accountA);
    db = advise(db, tf1, tx1, accountA, -50);
    db = addDocToTx(db, tf1, tx1, accountB);
    db = advise(db, tf1, tx1, accountB, 50);
    db = closeTx(db, tf1, tx1);
    
    // Second transaction: B -> C (30)
    db = addDocToTx(db, tf2, tx2, accountB);
    db = advise(db, tf2, tx2, accountB, -30);
    db = addDocToTx(db, tf2, tx2, accountC);
    db = advise(db, tf2, tx2, accountC, 30);
    db = closeTx(db, tf2, tx2);
    
    // Check available balances before consolidation
    assert.strictEqual(getAvailable(db, accountA), -50, 'Account A should have -50 available');
    assert.strictEqual(getAvailable(db, accountB), 20, 'Account B should have 20 available (50 - 30)');
    assert.strictEqual(getAvailable(db, accountC), 30, 'Account C should have 30 available');
    
    // Close transaction files and epoch
    db = closeTxf(db, tf1);
    db = closeTxf(db, tf2);
    db = markEpochClosed(db, epochId1);
    
    // Consolidate all transactions
    db = consolidateAcct(db, epochId1, accountA, tx1);
    db = consolidateAcct(db, epochId1, accountB, tx1);
    db = consolidateAcct(db, epochId1, accountB, tx2);
    db = consolidateAcct(db, epochId1, accountC, tx2);
    db = markEpochConsolidated(db, epochId1);
    
    // Verify final balances
    assert.strictEqual(getBalance(db, epochId1, accountA), -50, 'Account A final balance should be -50');
    assert.strictEqual(getBalance(db, epochId1, accountB), 20, 'Account B final balance should be 20');
    assert.strictEqual(getBalance(db, epochId1, accountC), 30, 'Account C final balance should be 30');
    
    // Verify sum is zero (conservation)
    const totalBalance = getBalance(db, epochId1, accountA) + 
                        getBalance(db, epochId1, accountB) + 
                        getBalance(db, epochId1, accountC);
    assert.strictEqual(totalBalance, 0, 'Total balance should be zero (conservation of money)');
  });
}); 