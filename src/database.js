/**
 * Database abstraction layer for the shardable ledger
 * Provides methods for document CRUD operations with multi-method dispatch pattern
 */

/**
 * Updates a document in the database using a function
 * @param {Object} database - The database object
 * @param {string} collection - Collection name
 * @param {string} documentId - Document ID
 * @param {Function} updateFunction - Function to apply to the document
 * @param {...any} args - Additional arguments for the update function
 * @returns {Object} Updated database
 */
export function updateDocument(database, collection, documentId, updateFunction, ...args) {
  if (!database || typeof database !== 'object') {
    throw new Error('Database must be an object');
  }
  
  const db = { ...database };
  
  // Ensure collection exists
  if (!db[collection]) {
    db[collection] = {};
  }
  
  // Ensure document exists or initialize as empty object
  if (!db[collection][documentId]) {
    db[collection][documentId] = {};
  }
  
  // Apply the update function
  db[collection][documentId] = updateFunction(db[collection][documentId], ...args);
  
  return db;
}

/**
 * Processes a document and returns both updated database and the processed document
 * @param {Object} database - The database object
 * @param {string} collection - Collection name
 * @param {string} documentId - Document ID
 * @param {Function} processFunction - Function to process the document
 * @param {...any} args - Additional arguments for the process function
 * @returns {Array} [updatedDatabase, processedDocument]
 */
export function processDocument(database, collection, documentId, processFunction, ...args) {
  const document = getDocument(database, collection, documentId);
  const processedDocument = processFunction(document, ...args);
  const updatedDatabase = setDocument(database, collection, documentId, processedDocument);
  
  return [updatedDatabase, processedDocument];
}

/**
 * Retrieves a document from the database
 * @param {Object} database - The database object
 * @param {string} collection - Collection name
 * @param {string} documentId - Document ID
 * @returns {any} The document or undefined if not found
 */
export function getDocument(database, collection, documentId) {
  if (!database || !database[collection]) {
    return undefined;
  }
  return database[collection][documentId];
}

/**
 * Sets a document in the database
 * @param {Object} database - The database object
 * @param {string} collection - Collection name
 * @param {string} documentId - Document ID
 * @param {any} value - The value to set
 * @returns {Object} Updated database
 */
export function setDocument(database, collection, documentId, value) {
  const db = { ...database };
  
  if (!db[collection]) {
    db[collection] = {};
  }
  
  db[collection][documentId] = value;
  return db;
} 