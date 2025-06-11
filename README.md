# Shardable Ledger - JavaScript Implementation

Shardable Ledger (SL) is an implementation of a ledger that works without multi-document transactions by adopting an epoch-based consistency strategy. This allows running an efficient ledger on a distributed database. There is one constraint: it must be possible to have MUTEX transactions on single documents.

Do not confuse this with distributed ledgers which are based on blockchain algorithms. Blockchain is a technology aimed at providing ledger-like capabilities on potentially rogue nodes using a probabilistic and slow algorithm. The SL algorithm is fully deterministic and reliable (as far as we know).

## Overview

The algorithm exploits that a ledger has more relaxed consistency requirements than generic ACID. The business requirements are:

- Payers must not be able to spend money twice
- Payees should be able to spend money as quickly as possible
- On the balance sheet both sides of a credit transfer/payment should be applied atomically (both or none). This will ensure that assets equal liabilities at any point in time.

This can be achieved by keeping an "available amount" for each account and multiple "balances" for different balance sheet snapshots. The solution relies on the fact that these operations are commutative, i.e., it doesn't matter in which order the money is reserved or advised on an account, the net sum is always the same.

## Installation

```bash
npm install
```

## Usage

### Basic Example

```javascript
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

// Initialize empty database
let db = {};

// Open connection and get transaction file
const transactionFileName = 'connection-1';
const [initialDb, epochId] = openConnection(db, transactionFileName);
db = initialDb;

// Create a transaction
const transactionId = 'tx-001';
const payerAccount = 'alice';
const payeeAccount = 'bob';
const amount = 100;

// Add accounts to transaction
db = addDocToTx(db, transactionFileName, transactionId, payerAccount);
db = addDocToTx(db, transactionFileName, transactionId, payeeAccount);

// Advise the transaction amounts
db = advise(db, transactionFileName, transactionId, payerAccount, -amount);
db = advise(db, transactionFileName, transactionId, payeeAccount, amount);

// Close the transaction
db = closeTx(db, transactionFileName, transactionId);

// Check available balances
console.log('Alice available:', getAvailable(db, payerAccount)); // -100
console.log('Bob available:', getAvailable(db, payeeAccount));   // 100

// Close transaction file
db = closeTxf(db, transactionFileName);

// Close epoch and consolidate
db = markEpochClosed(db, epochId);
db = consolidateAcct(db, epochId, payerAccount, transactionId);
db = consolidateAcct(db, epochId, payeeAccount, transactionId);
db = markEpochConsolidated(db, epochId);

// Check final balances
console.log('Alice balance:', getBalance(db, epochId, payerAccount)); // -100
console.log('Bob balance:', getBalance(db, epochId, payeeAccount));   // 100
```

## Algorithm

### On Connect

1. Create transaction file
2. Register transaction file in latest open epoch, if there is no open epoch create one

### For Each Transaction

1. Read transaction file to see if it has been closed
2. If transaction file is closed → Retry with new connection
3. Create transaction id and register in transaction file as open
4. Create transaction steps as pending in all the accounts
5. Check if transaction file is still open. If not revert transaction → Retry
6. Mark transaction as closed in transaction file

### On Consolidation

1. Take the first closed epoch
2. Create a new epoch
3. Mark epoch as closed
4. Mark all transaction files as closed
5. Consolidate all closed transactions in transaction files
6. Mark epoch as consolidated

## API Reference

### Core Functions

- `openConnection(database, transactionFileName)` - Opens a connection and returns `[updatedDatabase, epochId]`
- `advise(database, transactionFileId, transactionId, accountId, amount)` - Advises a transaction amount to an account
- `getBalance(database, epochId, accountId)` - Gets account balance for a specific epoch
- `getAvailable(database, accountId)` - Gets available balance (latest epoch + pending transactions)
- `closeTx(database, transactionFileId, transactionId)` - Closes a transaction
- `closeTxf(database, transactionFileId)` - Closes a transaction file
- `markEpochClosed(database, epochId)` - Marks an epoch as closed
- `consolidateAcct(database, epochId, accountId, transactionId)` - Consolidates a transaction
- `markEpochConsolidated(database, epochId)` - Marks an epoch as consolidated
- `addDocToTx(database, transactionFileId, transactionId, documentId)` - Adds a document to a transaction

### Data Structures

#### Database Structure
```javascript
{
  meta: {
    'open-epoch': 0  // Current open epoch ID
  },
  epochs: {
    0: {
      txfs: Set(['file-1', 'file-2']),  // Transaction files in this epoch
      closed: true,                      // Whether epoch is closed
      consolidated: true                 // Whether epoch is consolidated
    }
  },
  txfs: {
    'file-1': {
      'tx-1': {
        docs: Set(['account-1', 'account-2']),  // Documents in transaction
        closed: true                             // Whether transaction is closed
      },
      closed: true  // Whether transaction file is closed
    }
  },
  accts: {
    'account-1': {
      vs: { 0: 100, 1: 150 },           // Balances by epoch
      pending: { 'tx-2': -50 }          // Pending transactions
    }
  }
}
```

## Testing

Run the test suite:

```bash
npm test
```

The test suite includes:
- Full transaction flow tests
- Individual component tests
- Error handling tests
- Complex multi-transaction scenarios

## Architecture

The JavaScript implementation is organized by business context:

- `src/database/` - Database abstraction layer
- `src/account/` - Account management operations
- `src/epoch/` - Epoch lifecycle management
- `src/transaction/` - Transaction file operations
- `src/ledger/` - Main ledger orchestration
- `src/utilities/` - Utility functions

## Constraints

- Transactions are associated with epochs
- Accounts have a value for each epoch
- Epochs are ordered
- The available balance is the sum of the latest epoch value and all pending transactions

## Node.js Requirements

- Node.js 18.0.0 or higher (uses ES modules and Node.js built-in test runner)

## Translation Notes

This JavaScript implementation maintains the same functional programming principles as the original Clojure version:

- Immutable data structures (objects are copied, not mutated)
- Pure functions with no side effects
- Functional composition and higher-order functions
- Comprehensive error handling with preconditions

The main differences from the Clojure version:
- Uses JavaScript's `Set` objects instead of Clojure sets
- Error handling uses JavaScript's `throw` instead of Clojure's `assert`
- Module system uses ES6 imports/exports instead of Clojure namespaces
- Uses native JavaScript objects instead of Clojure maps 