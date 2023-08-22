(ns ct.main
  (:require
   [clojure.algo.monads :refer [domonad maybe-m]]
   [ct.db :refer :all]
   [ct.acct :as acct]
   [ct.epoch :as epoch]
   [ct.txf :as txf]
))

(defn get-open-epoch
  [db]
  (or (get-doc db :meta :open-epoch) 0))

(defn open-connection
  [db file-name]
  (let [
        epoch-id (get-open-epoch db)
        db (update-doc db :epochs epoch-id epoch/add-txf file-name)]
    [db epoch-id]
    )
  )

(defn advise
  [db txf-id tx-id acct-id amt]
  (update-doc db :txfs txf-id txf/add-doc tx-id [:accts acct-id])
  (update-doc db :accts acct-id acct/advise tx-id amt))

(defn get-balance
  [db epoch acct]
  (->  (get-doc db :accts acct)
       (acct/balance epoch)))

(defn close-tx
  "marks a transaction as closed"
  [db txf-id tx-id]
  (update-doc db :txfs txf-id txf/close-tx tx-id)
  )

(defn mark-epoch-closed
  "marks an epoch as closed"
  [db epoch-id]
  (update-doc db :epochs epoch-id epoch/close))

(defn- epoch-closed?
  [db epoch-id]
  (-> db
      (get-doc :epochs epoch-id)
      :closed))

(defn consolidate-acct
  "consolidates a tx into an acct in a new epoch"
  [db epoch-id acct-id tx-id]
  {:pre [(epoch-closed? db epoch-id)]}
  (update-doc db :accts acct-id acct/consolidate epoch-id tx-id))

(defn mark-epoch-consolidated
  [db epoch-id]
  (update-doc db :epochs epoch-id epoch/consolidate ))

(defn get-available
  "retrieves the amt available on an acct"
  [db acct]
  (-> (get-doc db :accts acct)
      (acct/available)))

(defn add-doc-to-tx
  "adds a document to a transaction"
  [db txf-id tx-id doc-id]
  (update-doc db :txfs txf-id txf/add-doc tx-id doc-id))
