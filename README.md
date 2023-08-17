Distributed Ledger

DL is an implemenation of a ledger that works without multi-document transactions by adopting an epoch-based consistency strategy.

Each credit transfer is decompossed into multiple steps:

1) Reserve amount on payer account
2) Advise amount on payee account
3) _Batch_ consolidation of all pending amounts into a consistent balance sheet.

Start by reading `main_test.clj` it uses static data structures to explain the different steps and their input and output. 

# Algorithm 

(not as implemented) 

Contstraints
---

- Transactions are associated into epochs
- Accts have a value for each epoch 
- Epochs are ordered
- The available balance is the sum of the latest epoch value and all pending transactions

Note: We don't need pending transactions on an acct but it makes unwinding transactions that have not been committed more complicated.