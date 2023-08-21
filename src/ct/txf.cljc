(ns ct.txf
  (:require [clojure.spec.alpha :as s]))



(defn txf-open?
  [txf]
  (not (:closed txf)))

(defn tx-open?
  [txf tx]
  (-> txf
      (get tx)
      :closed
      not))

(comment
  (tx-open?
   {"tx-1" {:closed true}} "tx-1")
)

(defn add-doc
  [txf tx doc]
  {:pre [(txf-open? txf)
         (tx-open? txf tx)]}
  (update-in txf [tx :docs] #(conj (or  % #{}) doc)))

(s/fdef add-doc
  :args (s/cat :txf map? :tx any? :doc any?))