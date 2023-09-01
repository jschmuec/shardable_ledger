(ns ct.db
  (:require [clojure.spec.alpha :as s]))

(defn selector
  [x & _]
  (class x))

(defmulti update-doc selector)
(defmulti process-doc selector)

(do
  (defn update-doc-in-map
    [db col doc-id f & args]
    (apply update-in db [col doc-id] f args))

  (s/fdef update-doc-in-map
    :args (s/cat :db (s/nilable map?) :col any? :doc any? :f fn? :args (s/* any?)))
)

(defmethod update-doc java.util.Map
  [& args]
  (apply update-doc-in-map args))


(do 
  (defn process-doc-in-map
    [db col-id doc-id f & args]
    (let [doc (get-in db [col-id doc-id])
          new-doc (apply f doc args)]
      [(assoc-in db [col-id doc-id] new-doc)
       new-doc]))
  
  (s/fdef process-doc-in-map
    :args (s/cat :db (s/nilable map?) :col any? :doc any? :f fn? :args (s/* any?))))


(defmethod process-doc java.util.Map 
  [& args]
  (apply process-doc-in-map args))


(defn get-doc
  "retrieves a doc from the db"
  [db col doc]
  (get-in db [col doc]))
