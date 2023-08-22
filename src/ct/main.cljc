(ns ct.main
  (:require
   [clojure.algo.monads :refer [domonad maybe-m]]
   [ct.acct :as acct]
   [ct.epoch :as epoch]
   [ct.txf :as txf]
))

;; sample db functions. We can push these later into multimethods
(defn update-doc
  "updates a document in the database"
  [db col doc-id f & args]
  (apply update-in db [col doc-id] f args))

(defn get-doc
  "retrieves a doc from the db"
  [db col doc]
  (get-in db [col doc]))

(defn f [x]
  (domonad maybe-m
           [epochs (:epochs {})
            last-e (last epochs)]
           (key last-e)))

(defn open-connection
  [db file-name]
  (domonad maybe-m
              [epochs  (:epochs  db)
               last-e (last epochs)
               last-e-key (key last-e)]
              (update-doc db :epochs (or last-e-key "e0") epoch/add-txf file-name))
  )


(defn advise
  [db txf-id tx-id acct-id amt]
  (update-doc db :txfs txf-id txf/add-doc tx-id [:accts acct-id])
  (update-doc db :accts acct-id acct/advise tx-id amt))

(defn get-balance
  [db epoch acct]
  (->  (get-doc db :accts acct)
       (acct/balance epoch)))

(defn get-available
  [db acct]
  (-> (get-doc db :accts acct)
      (acct/available)))

(defn add-doc-to-tx
  [db txf tx-id doc]
  (update-doc db :txfs txf txf/add-doc tx-id doc))
