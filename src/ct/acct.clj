(ns ct.acct
  (:require
   [clojure.spec.alpha :as s]
   [clojure.spec.test.alpha :as st]
   [ct.tools :refer [dissoc-in]]
   ))

;; contains functions that operate on the documents

(s/def ::acct map?)

(defn available-amt
  [acct]
  (let [latest-balance (or (-> acct :value vals last) 0)]
    (reduce + latest-balance
            (-> acct :pending vals))))
