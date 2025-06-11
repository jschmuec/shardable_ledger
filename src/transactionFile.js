/**
 * Transaction file management module for the shardable ledger
 * Handles transaction file operations, transaction tracking, and document associations
 */

/**
 * Checks if a transaction file is open (not closed)
 * @param {Object} transactionFile - The transaction file object
 * @returns {boolean} True if transaction file is open
 */
export function isTransactionFileOpen(transactionFile) {
  return !transactionFile?.closed;
}

/**
 * Checks if a specific transaction is open within a transaction file
 * @param {Object} transactionFile - The transaction file object
 * @param {string} transactionId - Transaction ID to check
 * @returns {boolean} True if transaction is open (or doesn't exist yet)
 */
export function isTransactionOpen(transactionFile, transactionId) {
  if (!transactionFile || !transactionFile[transactionId]) {
    return true; // Transaction doesn't exist yet, so it's considered "open" for creation
  }
  return !transactionFile[transactionId].closed;
}

/**
 * Adds multiple documents to a transaction
 * @param {Object} transactionFile - The transaction file object
 * @param {string} transactionId - Transaction ID
 * @param {Array<string>} documents - Array of document IDs to add
 * @returns {Object} Updated transaction file
 * @throws {Error} If transaction file is closed or transaction is closed
 */
export function addDocumentsToTransaction(transactionFile, transactionId, documents) {
  if (!isTransactionFileOpen(transactionFile)) {
    throw new Error('Cannot add documents to closed transaction file');
  }
  
  if (!isTransactionOpen(transactionFile, transactionId)) {
    throw new Error('Cannot add documents to closed transaction');
  }
  
  const updatedFile = { ...transactionFile };
  
  if (!updatedFile[transactionId]) {
    updatedFile[transactionId] = { docs: new Set() };
  } else {
    updatedFile[transactionId] = { ...updatedFile[transactionId] };
    if (!updatedFile[transactionId].docs) {
      updatedFile[transactionId].docs = new Set();
    } else if (Array.isArray(updatedFile[transactionId].docs)) {
      updatedFile[transactionId].docs = new Set(updatedFile[transactionId].docs);
    } else if (!(updatedFile[transactionId].docs instanceof Set)) {
      updatedFile[transactionId].docs = new Set([updatedFile[transactionId].docs]);
    } else {
      updatedFile[transactionId].docs = new Set(updatedFile[transactionId].docs);
    }
  }
  
  // Add all documents to the set
  documents.forEach(doc => updatedFile[transactionId].docs.add(doc));
  
  return updatedFile;
}

/**
 * Adds a single document to a transaction
 * @param {Object} transactionFile - The transaction file object
 * @param {string} transactionId - Transaction ID
 * @param {string} documentId - Document ID to add
 * @returns {Object} Updated transaction file
 */
export function addDocumentToTransaction(transactionFile, transactionId, documentId) {
  return addDocumentsToTransaction(transactionFile, transactionId, [documentId]);
}

/**
 * Checks if a transaction is closed
 * @param {Object} transactionFile - The transaction file object
 * @param {string} transactionId - Transaction ID to check
 * @returns {boolean} True if transaction is closed
 */
export function isTransactionClosed(transactionFile, transactionId) {
  if (!transactionFile || !transactionFile[transactionId]) {
    return false;
  }
  return Boolean(transactionFile[transactionId].closed);
}

/**
 * Closes a specific transaction within a transaction file
 * @param {Object} transactionFile - The transaction file object
 * @param {string} transactionId - Transaction ID to close
 * @returns {Object} Updated transaction file with closed transaction
 */
export function closeTransaction(transactionFile, transactionId) {
  const updatedFile = { ...transactionFile };
  
  if (!updatedFile[transactionId]) {
    updatedFile[transactionId] = {};
  } else {
    updatedFile[transactionId] = { ...updatedFile[transactionId] };
  }
  
  updatedFile[transactionId].closed = true;
  
  return updatedFile;
}

/**
 * Closes the entire transaction file
 * @param {Object} transactionFile - The transaction file object
 * @returns {Object} Updated transaction file marked as closed
 */
export function closeTransactionFile(transactionFile) {
  return { ...transactionFile, closed: true };
}

/**
 * Gets all document IDs associated with a transaction
 * @param {Object} transactionFile - The transaction file object
 * @param {string} transactionId - Transaction ID
 * @returns {Set<string>} Set of document IDs for the transaction
 */
export function getTransactionDocuments(transactionFile, transactionId) {
  if (!transactionFile || !transactionFile[transactionId] || !transactionFile[transactionId].docs) {
    return new Set();
  }
  
  const docs = transactionFile[transactionId].docs;
  if (docs instanceof Set) {
    return new Set(docs);
  } else if (Array.isArray(docs)) {
    return new Set(docs);
  } else {
    return new Set([docs]);
  }
}

/**
 * Gets all transaction IDs in the transaction file
 * @param {Object} transactionFile - The transaction file object
 * @returns {Array<string>} Array of transaction IDs
 */
export function getAllTransactionIds(transactionFile) {
  if (!transactionFile) {
    return [];
  }
  
  return Object.keys(transactionFile).filter(key => key !== 'closed');
} 