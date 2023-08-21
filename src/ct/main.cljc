(ns ct.main
  (:require
   [ct.acct :as acct]
   [ct.epoch :as epoch]
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

(defn open-connection
  [db connection file-name]
   (let [last-epoch (-> db :epochs last key)]
     (update-doc db :epochs last-epoch epoch/add-txf file-name))
  )


(defn advise
  [db tx acct amt]
  (update-doc db :accts acct acct/advise tx amt))

(defn get-balance
  [db epoch acct]
  (->  (get-doc db :accts acct)
       (acct/balance epoch)))

(defn get-available
  [db acct]
  (-> (get-doc db :accts acct)
      (acct/available)))
