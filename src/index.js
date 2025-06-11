/**
 * Shardable Ledger - JavaScript Implementation
 * 
 * A ledger implementation that works without multi-document transactions by adopting
 * an epoch-based consistency strategy. This allows running an efficient ledger on
 * a distributed database with MUTEX transactions on single documents.
 */

// Database operations
export * from './database.js';

// Account management
export * from './account.js';

// Epoch management
export * from './epoch.js';

// Transaction file management
export * from './transactionFile.js';

// Utility functions
export * from './tools.js';

// Main ledger orchestration
export * from './shardableLedger.js';

// Re-export main functions with cleaner names for convenience
export {
  openLedgerConnection as openConnection,
  adviseTransactionToAccount as advise,
  getAccountBalance as getBalance,
  getAccountAvailableBalance as getAvailable,
  closeTransactionInFile as closeTx,
  closeTransactionFileInDatabase as closeTxf,
  markEpochAsClosed as markEpochClosed,
  consolidateAccountTransaction as consolidateAcct,
  markEpochAsConsolidated as markEpochConsolidated,
  addDocumentToTransactionInFile as addDocToTx
} from './shardableLedger.js'; 