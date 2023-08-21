(ns ct.acct
  (:require
   [clojure.spec.alpha :as s]
   [clojure.spec.test.alpha :as st]
   [ct.tools :refer [dissoc-in]]
   ))

;; contains functions that operate on the documents

(s/def ::acct map?)

(defn advise
  [acct tx amt]
  (assoc-in acct [:pending tx] amt))

(defn available
  [acct]
  (let [latest-balance (or (-> acct :vs vals last) 0)]
    (reduce + latest-balance
            (-> acct :pending vals))))


(def available-amt 
  "legacy version" 
  available)


(defn consolidate
  [acct epoch tx]
  (let [last-balance (or (get-in acct [:vs epoch]) 0)]
    (if-let [amt (get-in acct [:pending tx])]
      (-> acct
          (assoc-in [:vs epoch] (+ last-balance amt))
          (update :pending #(dissoc % tx)))
      acct))

  )

(defn balance
  [acct epoch]
  (get-in acct [:vs epoch]))
