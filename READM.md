Distributed Ledger

DL is an implemenation of a ledger that works without multi-document transactions by adopting an epoch-based consistency strategy.

Each credit transfer is decompossed into multiple steps:

1) Reserve amount on payer account
2) Advise amount on payee account
3) _Batch_ consolidation of all pending amounts into a consistent balance sheet.

Start by reading `main_test.clj` it uses static data structures to explain the different steps and their input and output. 

# Algorithm 

(not as implemented) 

Constraints

- Each transaction is assigned an epoch when created.
- When the consolidators consolidated an epoch, transactions that have not been flagged as :closed will be flagged as :abandonded
- When a client tries to close an :abandond transaction it realises that it failed and will abort the transaction.
- An epoch is either
  :open = new transaction documents can be added
  :closed = no new transactiond documents can be added
  :frozen = all transaction documents have been marked as :closed

- A transaction document is either
  :open - new transactions can be added
  :closed - no new transactions can be added an all pending transactions are abandonded

- when a client tries to close a transaction, it needs to see if the transaction document is still :open. If not, unwind the transaction and retry.

