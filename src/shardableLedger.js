/**
 * Main shardable ledger module
 * Orchestrates all ledger operations including connections, transactions, epochs, and consolidation
 */

import { updateDocument, getDocument } from './database.js';
import { adviseTransaction, consolidateTransaction, getAvailableBalance, getEpochBalance } from './account.js';
import { addTransactionFileToEpoch, closeEpoch, consolidateEpoch, isEpochClosed } from './epoch.js';
import { addDocumentToTransaction, closeTransaction, closeTransactionFile } from './transactionFile.js';

/**
 * Gets the currently open epoch ID from the database
 * @param {Object} database - The database object
 * @returns {number} The open epoch ID (defaults to 0 if none exists)
 */
export function getOpenEpochId(database) {
  return getDocument(database, 'meta', 'open-epoch') || 0;
}

/**
 * Opens a new connection to the ledger by creating a transaction file and registering it with the current epoch
 * @param {Object} database - The database object
 * @param {string} transactionFileName - Name of the transaction file to create
 * @returns {Array} [updatedDatabase, epochId] - Updated database and the epoch ID
 */
export function openLedgerConnection(database, transactionFileName) {
  const epochId = getOpenEpochId(database);
  
  const updatedDatabase = updateDocument(
    database,
    'epochs',
    epochId,
    (epoch) => addTransactionFileToEpoch(epoch || {}, transactionFileName)
  );
  
  return [updatedDatabase, epochId];
}

/**
 * Advises a transaction amount to an account and records it in the transaction file
 * @param {Object} database - The database object
 * @param {string} transactionFileId - Transaction file ID
 * @param {string} transactionId - Transaction ID
 * @param {string} accountId - Account ID
 * @param {number} amount - Transaction amount
 * @returns {Object} Updated database
 */
export function adviseTransactionToAccount(database, transactionFileId, transactionId, accountId, amount) {
  // First, add the document to the transaction file
  let updatedDatabase = updateDocument(
    database,
    'txfs',
    transactionFileId,
    (txf) => addDocumentToTransaction(txf || {}, transactionId, ['accts', accountId])
  );
  
  // Then, advise the transaction to the account
  updatedDatabase = updateDocument(
    updatedDatabase,
    'accts',
    accountId,
    (account) => adviseTransaction(account || {}, transactionId, amount)
  );
  
  return updatedDatabase;
}

/**
 * Gets the balance for an account at a specific epoch
 * @param {Object} database - The database object
 * @param {number} epoch - Epoch number
 * @param {string} accountId - Account ID
 * @returns {number|undefined} Account balance for the epoch
 */
export function getAccountBalance(database, epoch, accountId) {
  const account = getDocument(database, 'accts', accountId);
  return getEpochBalance(account, epoch);
}

/**
 * Closes a transaction in the transaction file
 * @param {Object} database - The database object
 * @param {string} transactionFileId - Transaction file ID
 * @param {string} transactionId - Transaction ID to close
 * @returns {Object} Updated database
 */
export function closeTransactionInFile(database, transactionFileId, transactionId) {
  return updateDocument(
    database,
    'txfs',
    transactionFileId,
    (txf) => closeTransaction(txf || {}, transactionId)
  );
}

/**
 * Closes a transaction file
 * @param {Object} database - The database object
 * @param {string} transactionFileId - Transaction file ID to close
 * @returns {Object} Updated database
 */
export function closeTransactionFileInDatabase(database, transactionFileId) {
  return updateDocument(
    database,
    'txfs',
    transactionFileId,
    (txf) => closeTransactionFile(txf || {})
  );
}

/**
 * Checks if all transaction files in an epoch are closed
 * @param {Object} database - The database object
 * @param {number} epochId - Epoch ID to check
 * @returns {boolean} True if all transaction files are closed
 */
export function areAllTransactionFilesClosed(database, epochId) {
  const epoch = getDocument(database, 'epochs', epochId);
  if (!epoch || !epoch.txfs) {
    return true;
  }
  
  const transactionFileIds = Array.from(epoch.txfs);
  return transactionFileIds.every(txfId => {
    const txf = getDocument(database, 'txfs', txfId);
    return txf?.closed === true;
  });
}

/**
 * Marks an epoch as closed (requires all transaction files to be closed first)
 * @param {Object} database - The database object
 * @param {number} epochId - Epoch ID to close
 * @returns {Object} Updated database
 * @throws {Error} If not all transaction files are closed
 */
export function markEpochAsClosed(database, epochId) {
  if (!areAllTransactionFilesClosed(database, epochId)) {
    throw new Error('Cannot close epoch: not all transaction files are closed');
  }
  
  return updateDocument(
    database,
    'epochs',
    epochId,
    (epoch) => closeEpoch(epoch || {})
  );
}

/**
 * Checks if an epoch is closed
 * @param {Object} database - The database object
 * @param {number} epochId - Epoch ID to check
 * @returns {boolean} True if epoch is closed
 */
export function isEpochClosedInDatabase(database, epochId) {
  const epoch = getDocument(database, 'epochs', epochId);
  return isEpochClosed(epoch);
}

/**
 * Consolidates an account transaction into an epoch balance
 * @param {Object} database - The database object
 * @param {number} epochId - Epoch ID
 * @param {string} accountId - Account ID
 * @param {string} transactionId - Transaction ID to consolidate
 * @returns {Object} Updated database
 * @throws {Error} If epoch is not closed
 */
export function consolidateAccountTransaction(database, epochId, accountId, transactionId) {
  if (!isEpochClosedInDatabase(database, epochId)) {
    throw new Error('Cannot consolidate: epoch must be closed first');
  }
  
  return updateDocument(
    database,
    'accts',
    accountId,
    (account) => consolidateTransaction(account || {}, epochId, transactionId)
  );
}

/**
 * Marks an epoch as consolidated
 * @param {Object} database - The database object
 * @param {number} epochId - Epoch ID to mark as consolidated
 * @returns {Object} Updated database
 */
export function markEpochAsConsolidated(database, epochId) {
  return updateDocument(
    database,
    'epochs',
    epochId,
    (epoch) => consolidateEpoch(epoch || {})
  );
}

/**
 * Gets the available balance for an account
 * @param {Object} database - The database object
 * @param {string} accountId - Account ID
 * @returns {number} Available balance (latest epoch balance + pending transactions)
 */
export function getAccountAvailableBalance(database, accountId) {
  const account = getDocument(database, 'accts', accountId);
  return getAvailableBalance(account);
}

/**
 * Adds a document to a transaction in the transaction file
 * @param {Object} database - The database object
 * @param {string} transactionFileId - Transaction file ID
 * @param {string} transactionId - Transaction ID
 * @param {string} documentId - Document ID to add
 * @returns {Object} Updated database
 */
export function addDocumentToTransactionInFile(database, transactionFileId, transactionId, documentId) {
  return updateDocument(
    database,
    'txfs',
    transactionFileId,
    (txf) => addDocumentToTransaction(txf || {}, transactionId, documentId)
  );
} 