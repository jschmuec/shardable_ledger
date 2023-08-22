Shardable Ledger (SL) is an implemenation of a ledger that works without multi-document transactions by adopting an epoch-based consistency strategy. This allows to run an efficient ledger on a distributed database. Do not confuse this with distributed ledgers which are based on blockchain algorithms.

Each credit transfer is decompossed into multiple steps:

1) Reserve amount on payer account
2) Advise amount on payee account
3) _Batch_ consolidation of all pending amounts into a consistent balance sheet.

The solution relies on the fact that these operations are commutative, i.e. it doesn't matter in which order the money is reserved or advised on an account, the net sum is always the same.

Start by reading `main_test.clj` it uses static data structures to explain the different steps and their input and output. 

The algorithm works because reserving/advising money from/to an account is comutative. A similar algo would be possible if it could be made to operate on documents always in the same order. 

Algorithm 
====

On connect
---

1. Create transaction file

Sample of a transaction file with one open tarnsaction "tx-2" and a committed transaction "tx-1".

```edn
{:open {"tx-2" #{"payer-acct" "payee-acct"}} :committed {"tx-1" #{"a-acct" "b-acct"}}}
```

2. Register transaction file in latest open epoch, if there is no open epoch create one

Valid epoch looks like this

```edn
{:state :open :txfs {"txf-id" "filename"}}
```

Where there is a document "filename" in the "txfs" collection.

On disconnect
-------------

1. Flag transaction file as closed

For each transaction
-------------

1. Read transaction file to see if has been closed
2. If transaction file is closed -> Retry with new connection
3. Create transaction id and register in transaction file as open
4. Create transaction steps as pending in all the accts
5. Check if transaction file is still :open. If not revert transaction -> Retry
5. Mark transaction as closed in transaction file

On consolidation
-------------

1. Take the first closed epoch
1. Create a new epoch
2. Mark epoch as :closed
3. Mark all transaction files as :closed
4. Consolidate all :closed transactions in transaction files
5. Mark epoch as :consolidated


Contstraints
---

- Transactions are associated into epochs
- Accts have a value for each epoch 
- Epochs are ordered
- The available balance is the sum of the latest epoch value and all pending transactions

Note: We don't really need pending transactions on an acct but it makes unwinding transactions that have not been committed more complicated. It's also a nice visibility feature.

Hierarchical Consistency Structures
====

**WIP**: The ledger use case might be extendable to a portfolio management use case. Each account belongs to a single portfolio. Each portfolio can contain accounts and other ledgers. Because portfolios need to be consistent, even if securities/positions are transfered between two accounts/subportfolios, the full set of portfolios could be included in the consolidation step. However, this will make the system slower as the number of views on the portfolio shrinks. Instead, we can store the aggregated value for each portfolio at the end of a given epoch and update these values offline. This means that any two portfolios can be consistently aggregated by choosing the latest epoch that is updated in both.