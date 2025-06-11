/**
 * Account management module for the shardable ledger
 * Handles account balance operations, pending transactions, and consolidation
 */

import { dissocIn } from './tools.js';

/**
 * Advises a transaction amount to an account (creates a pending transaction)
 * @param {Object} account - The account object
 * @param {string} transactionId - Transaction ID
 * @param {number} amount - Transaction amount
 * @returns {Object} Updated account with pending transaction
 */
export function adviseTransaction(account, transactionId, amount) {
  const updatedAccount = { ...account };
  
  if (!updatedAccount.pending) {
    updatedAccount.pending = {};
  }
  
  updatedAccount.pending[transactionId] = amount;
  return updatedAccount;
}

/**
 * Calculates the available balance for an account
 * @param {Object} account - The account object
 * @returns {number} Available balance (latest epoch balance + pending transactions)
 */
export function getAvailableBalance(account) {
  if (!account) {
    return 0;
  }
  
  // Get the latest balance from the most recent epoch
  const epochValues = account.vs ? Object.values(account.vs).filter(v => typeof v === 'number') : [];
  const latestBalance = epochValues.length > 0 ? Math.max(...epochValues) : 0;
  
  // Sum all pending transactions
  const pendingSum = account.pending ? 
    Object.values(account.pending).reduce((sum, amount) => sum + amount, 0) : 0;
  
  return latestBalance + pendingSum;
}

/**
 * Legacy alias for getAvailableBalance
 * @deprecated Use getAvailableBalance instead
 */
export const getAvailableAmount = getAvailableBalance;

/**
 * Consolidates a pending transaction into the account's epoch balance
 * @param {Object} account - The account object
 * @param {number} epoch - The epoch number
 * @param {string} transactionId - Transaction ID to consolidate
 * @returns {Object} Updated account with consolidated transaction
 */
export function consolidateTransaction(account, epoch, transactionId) {
  if (!account) {
    return account;
  }
  
  const updatedAccount = { ...account };
  
  // Get the current balance for this epoch (default to 0)
  const currentEpochBalance = updatedAccount.vs?.[epoch] || 0;
  
  // Get the pending transaction amount
  const pendingAmount = updatedAccount.pending?.[transactionId];
  
  if (pendingAmount === undefined) {
    return account; // No pending transaction to consolidate
  }
  
  // Update the epoch balance
  if (!updatedAccount.vs) {
    updatedAccount.vs = {};
  }
  updatedAccount.vs[epoch] = currentEpochBalance + pendingAmount;
  
  // Remove the pending transaction
  if (updatedAccount.pending) {
    const { [transactionId]: removed, ...remainingPending } = updatedAccount.pending;
    updatedAccount.pending = remainingPending;
  }
  
  return updatedAccount;
}

/**
 * Gets the balance for a specific epoch
 * @param {Object} account - The account object
 * @param {number} epoch - The epoch number
 * @returns {number|undefined} The balance for the epoch, or undefined if not set
 */
export function getEpochBalance(account, epoch) {
  if (!account || !account.vs) {
    return undefined;
  }
  return account.vs[epoch];
} 