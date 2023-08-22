(ns ct.main
  (:require
   [clojure.algo.monads :refer [domonad maybe-m]]
   [ct.db :refer :all]
   [ct.acct :as acct]
   [ct.epoch :as epoch]
   [ct.txf :as txf]
))

(defn open-connection
  [db file-name]
  (let [
        [db epoch-id] (process-doc db :meta :open-epoch epoch/get-open-epoch)
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

(defn consolidate-acct
  "consolidates a tx into an acct"
  [db epoch acct-id tx-id]
  (update-doc db :accts acct-id acct/consolidate epoch tx-id))

(defn mark-epoch-consolidated
  "marks epoch doc as consolidated"
  [db epoch-id]
  (update-doc db :epochs epoch-id epoch/consolidate ))

(defn get-available
  [db acct]
  (-> (get-doc db :accts acct)
      (acct/available)))

(defn add-doc-to-tx
  [db txf tx-id doc]
  (update-doc db :txfs txf txf/add-doc tx-id doc))
