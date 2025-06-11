/**
 * Epoch management module for the shardable ledger
 * Handles epoch lifecycle: creation, closing, consolidation, and transaction file management
 */

/**
 * Closes an epoch by marking it as closed
 * @param {Object} epoch - The epoch object
 * @returns {Object} Updated epoch with closed status
 */
export function closeEpoch(epoch) {
  return { ...epoch, closed: true };
}

/**
 * Marks an epoch as consolidated (must be closed first)
 * @param {Object} epoch - The epoch object
 * @returns {Object} Updated epoch with consolidated status
 * @throws {Error} If epoch is not closed
 */
export function consolidateEpoch(epoch) {
  if (!epoch.closed) {
    throw new Error('Epoch must be closed before consolidation');
  }
  
  return { ...epoch, consolidated: true };
}

/**
 * Adds a transaction file to an epoch
 * @param {Object} epoch - The epoch object
 * @param {string} transactionFileId - Transaction file ID to add
 * @returns {Object} Updated epoch with the transaction file added
 */
export function addTransactionFileToEpoch(epoch, transactionFileId) {
  const updatedEpoch = { ...epoch };
  
  if (!updatedEpoch.txfs) {
    updatedEpoch.txfs = new Set();
  } else if (Array.isArray(updatedEpoch.txfs)) {
    // Convert array to Set for consistency with Clojure version
    updatedEpoch.txfs = new Set(updatedEpoch.txfs);
  } else if (!(updatedEpoch.txfs instanceof Set)) {
    // If it's some other type, convert to Set
    updatedEpoch.txfs = new Set([updatedEpoch.txfs]);
  } else {
    // Clone the existing Set
    updatedEpoch.txfs = new Set(updatedEpoch.txfs);
  }
  
  updatedEpoch.txfs.add(transactionFileId);
  
  return updatedEpoch;
}

/**
 * Checks if an epoch is closed
 * @param {Object} epoch - The epoch object
 * @returns {boolean} True if epoch is closed
 */
export function isEpochClosed(epoch) {
  return Boolean(epoch?.closed);
}

/**
 * Checks if an epoch is consolidated
 * @param {Object} epoch - The epoch object
 * @returns {boolean} True if epoch is consolidated
 */
export function isEpochConsolidated(epoch) {
  return Boolean(epoch?.consolidated);
}

/**
 * Gets all transaction file IDs from an epoch
 * @param {Object} epoch - The epoch object
 * @returns {Set<string>} Set of transaction file IDs
 */
export function getEpochTransactionFiles(epoch) {
  if (!epoch?.txfs) {
    return new Set();
  }
  
  // Ensure we return a Set regardless of the internal representation
  if (epoch.txfs instanceof Set) {
    return new Set(epoch.txfs);
  } else if (Array.isArray(epoch.txfs)) {
    return new Set(epoch.txfs);
  } else {
    return new Set([epoch.txfs]);
  }
} 