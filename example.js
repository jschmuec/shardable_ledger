#!/usr/bin/env node

/**
 * Example usage of the Shardable Ledger JavaScript implementation
 * This demonstrates a complete transaction flow with multiple accounts
 */

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

console.log('🏦 Shardable Ledger Example\n');

// Initialize empty database
let db = {};

console.log('📊 Initial database state:', JSON.stringify(db, null, 2));

// Open connection and get transaction file
const transactionFileName = 'connection-1';
console.log(`\n🔗 Opening connection with transaction file: ${transactionFileName}`);
const [initialDb, epochId] = openConnection(db, transactionFileName);
db = initialDb;

console.log(`✅ Connection opened, epoch ID: ${epochId}`);
console.log('📊 Database after connection:', JSON.stringify(db, null, 2));

// Create a transaction
const transactionId = 'tx-001';
const payerAccount = 'alice';
const payeeAccount = 'bob';
const amount = 100;

console.log(`\n💸 Creating transaction ${transactionId}: ${payerAccount} → ${payeeAccount} ($${amount})`);

// Add accounts to transaction
console.log(`📝 Adding ${payerAccount} to transaction`);
db = addDocToTx(db, transactionFileName, transactionId, payerAccount);

console.log(`📝 Adding ${payeeAccount} to transaction`);
db = addDocToTx(db, transactionFileName, transactionId, payeeAccount);

// Advise the transaction amounts
console.log(`💰 Advising ${payerAccount}: -$${amount}`);
db = advise(db, transactionFileName, transactionId, payerAccount, -amount);

console.log(`💰 Advising ${payeeAccount}: +$${amount}`);
db = advise(db, transactionFileName, transactionId, payeeAccount, amount);

// Close the transaction
console.log(`🔒 Closing transaction ${transactionId}`);
db = closeTx(db, transactionFileName, transactionId);

// Check available balances
console.log('\n💳 Available balances (before consolidation):');
console.log(`  ${payerAccount}: $${getAvailable(db, payerAccount)}`);
console.log(`  ${payeeAccount}: $${getAvailable(db, payeeAccount)}`);

// Close transaction file
console.log(`\n🔒 Closing transaction file: ${transactionFileName}`);
db = closeTxf(db, transactionFileName);

// Close epoch and consolidate
console.log(`\n🔒 Closing epoch ${epochId}`);
db = markEpochClosed(db, epochId);

console.log(`📊 Consolidating ${payerAccount} transaction`);
db = consolidateAcct(db, epochId, payerAccount, transactionId);

console.log(`📊 Consolidating ${payeeAccount} transaction`);
db = consolidateAcct(db, epochId, payeeAccount, transactionId);

console.log(`✅ Marking epoch ${epochId} as consolidated`);
db = markEpochConsolidated(db, epochId);

// Check final balances
console.log('\n🏁 Final balances (after consolidation):');
console.log(`  ${payerAccount}: $${getBalance(db, epochId, payerAccount)}`);
console.log(`  ${payeeAccount}: $${getBalance(db, epochId, payeeAccount)}`);

// Verify conservation of money
const totalBalance = getBalance(db, epochId, payerAccount) + getBalance(db, epochId, payeeAccount);
console.log(`\n⚖️  Total balance (should be 0): $${totalBalance}`);

console.log('\n📊 Final database state:');
console.log(JSON.stringify(db, (key, value) => {
  // Convert Sets to Arrays for JSON serialization
  if (value instanceof Set) {
    return Array.from(value);
  }
  return value;
}, 2));

console.log('\n✅ Transaction completed successfully!');

// Demonstrate multiple transactions
console.log('\n\n🔄 Demonstrating multiple transactions...');

// Open a second connection for a new transaction
const transactionFileName2 = 'connection-2';
const [db2, epochId2] = openConnection(db, transactionFileName2);
db = db2;

const transactionId2 = 'tx-002';
const charlieAccount = 'charlie';

console.log(`\n💸 Creating second transaction ${transactionId2}: ${payeeAccount} → ${charlieAccount} ($30)`);

// Bob sends $30 to Charlie
db = addDocToTx(db, transactionFileName2, transactionId2, payeeAccount);
db = addDocToTx(db, transactionFileName2, transactionId2, charlieAccount);
db = advise(db, transactionFileName2, transactionId2, payeeAccount, -30);
db = advise(db, transactionFileName2, transactionId2, charlieAccount, 30);
db = closeTx(db, transactionFileName2, transactionId2);

console.log('\n💳 Available balances (with second transaction):');
console.log(`  ${payerAccount}: $${getAvailable(db, payerAccount)}`);
console.log(`  ${payeeAccount}: $${getAvailable(db, payeeAccount)}`);
console.log(`  ${charlieAccount}: $${getAvailable(db, charlieAccount)}`);

// Close and consolidate second transaction
db = closeTxf(db, transactionFileName2);
db = markEpochClosed(db, epochId2);
db = consolidateAcct(db, epochId2, payeeAccount, transactionId2);
db = consolidateAcct(db, epochId2, charlieAccount, transactionId2);
db = markEpochConsolidated(db, epochId2);

console.log('\n🏁 Final balances (after second transaction):');
console.log(`  ${payerAccount}: $${getBalance(db, epochId2, payerAccount) || getBalance(db, epochId, payerAccount)}`);
console.log(`  ${payeeAccount}: $${getBalance(db, epochId2, payeeAccount)}`);
console.log(`  ${charlieAccount}: $${getBalance(db, epochId2, charlieAccount)}`);

const finalTotal = (getBalance(db, epochId2, payerAccount) || getBalance(db, epochId, payerAccount)) + 
                   getBalance(db, epochId2, payeeAccount) + 
                   getBalance(db, epochId2, charlieAccount);
console.log(`\n⚖️  Final total balance (should be 0): $${finalTotal}`);

console.log('\n🎉 All transactions completed successfully!'); 