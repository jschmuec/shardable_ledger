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

(do
  (defn add-doc
    [txf tx doc]
    {:pre [(txf-open? txf)
           (tx-open? txf tx)]}
    (update-in txf [tx :docs] #(conj (or  % #{}) doc)))

  (s/fdef add-doc
    :args (s/cat :txf (s/nilable map?) :tx any? :doc any?)))


(defn tx-closed?
  [txf tx]
  (get-in txf [tx :closed]))

(defn close-tx
  [txf tx]
  (assoc-in txf [tx :closed] true))

(defn close-txf
  [txf]
  (assoc txf :closed true))
