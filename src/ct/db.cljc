(ns ct.db
  (:require [clojure.spec.alpha :as s]))

;; sample db functions. We can push these later into multimethods
(do 
  (defn update-doc
    "updates a document in the database

  See also
  ---
  process-doc - if you need to use the result of the update"
    [db col doc-id f & args]
    (apply update-in db [col doc-id] f args))

  (s/fdef update-doc
    :args (s/cat :db (s/nilable map?) :col any? :doc any? :f fn? :args (s/* any?))))

(defn process-doc
  "calls a function on a doc and returns the new db state and new doc state

  CAREFUL, this is just a dummy implementation and not thread save."
  [db col-id doc-id f & args]
  (let [doc (get-in db [col-id doc-id])
        new-doc (apply f doc args)]
    [(assoc-in db [col-id doc-id] new-doc)
     new-doc]))

(defn get-doc
  "retrieves a doc from the db"
  [db col doc]
  (get-in db [col doc]))
